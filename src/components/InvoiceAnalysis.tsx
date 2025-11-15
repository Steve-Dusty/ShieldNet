import { useState } from "react";
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Shield, Network } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { analyzeInvoice, InvoiceAnalysisResult, reportThreat } from "@/services/mockApi";
import { useToast } from "@/hooks/use-toast";

export const InvoiceAnalysis = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<InvoiceAnalysisResult | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    
    setAnalyzing(true);
    try {
      const analysisResult = await analyzeInvoice(file);
      setResult(analysisResult);
      
      // If blocked, report to threat network
      if (analysisResult.status === 'blocked') {
        await reportThreat({
          invoiceId: analysisResult.invoiceId,
          vendor: analysisResult.vendor,
          fraudScore: analysisResult.fraudScore,
          reason: analysisResult.explanation,
          amount: analysisResult.amount,
        });
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/50',
          title: 'Verified & Safe to Auto-Pay',
          description: 'All security checks passed. Payment can proceed automatically.',
        };
      case 'blocked':
        return {
          icon: XCircle,
          color: 'text-loss',
          bgColor: 'bg-loss/10',
          borderColor: 'border-loss/50',
          title: 'High Fraud Risk – Blocked',
          description: 'Invoice blocked. Threat fingerprint added to ShieldNet.',
        };
      case 'hold':
        return {
          icon: AlertCircle,
          color: 'text-badge-orange',
          bgColor: 'bg-badge-orange/10',
          borderColor: 'border-badge-orange/50',
          title: 'Mismatch – Payment on Hold',
          description: 'Manual review required before payment can proceed.',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-secondary/50',
          borderColor: 'border-border/50',
          title: 'Unknown Status',
          description: '',
        };
    }
  };

  return (
    <Card className="border-gray-800 bg-black/40 backdrop-blur-sm shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Invoice Analysis</h2>
          <p className="text-sm text-gray-400">Upload invoice for AI fraud detection</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
          <FileText className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Upload Section */}
      {!result && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors bg-gray-900/20">
            <input
              type="file"
              id="invoice-upload"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
            />
            <label htmlFor="invoice-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-white font-semibold mb-2">
                {file ? file.name : "Drop invoice file here or click to upload"}
              </p>
              <p className="text-sm text-gray-400">
                Supports PDF, PNG, JPG (Max 10MB)
              </p>
            </label>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!file || analyzing}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-lg shadow-lg shadow-primary/40"
          >
            {analyzing ? "Analyzing..." : "Analyze Invoice"}
          </Button>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Decision Banner */}
          <div className={`p-6 rounded-2xl border-2 ${getStatusConfig(result.status).borderColor} ${getStatusConfig(result.status).bgColor}`}>
            <div className="flex items-start gap-4">
              {(() => {
                const StatusIcon = getStatusConfig(result.status).icon;
                return <StatusIcon className={`w-8 h-8 ${getStatusConfig(result.status).color} flex-shrink-0 mt-1`} />;
              })()}
              <div className="flex-1">
                <h3 className={`text-2xl font-bold ${getStatusConfig(result.status).color} mb-2`}>
                  {getStatusConfig(result.status).title}
                </h3>
                <p className="text-gray-300 mb-4">{getStatusConfig(result.status).description}</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Confidence</p>
                    <p className="text-2xl font-bold text-white">{result.confidence}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Fraud Score</p>
                    <p className={`text-2xl font-bold ${result.fraudScore > 70 ? 'text-loss' : result.fraudScore > 40 ? 'text-badge-orange' : 'text-success'}`}>
                      {result.fraudScore}/100
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-gray-900/40 border border-gray-800">
            <div>
              <p className="text-sm text-gray-400 mb-1">Vendor</p>
              <p className="font-semibold text-white">{result.vendor}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Amount</p>
              <p className="font-semibold text-white">{result.amount.toLocaleString()} {result.currency}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Invoice ID</p>
              <p className="font-semibold text-white">{result.invoiceId}</p>
            </div>
          </div>

          {/* Explanation */}
          <div className="p-4 rounded-xl bg-gray-900/30 border border-gray-800">
            <p className="text-gray-300">{result.explanation}</p>
          </div>

          {/* Local Checks */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold text-white">Local Security Checks</h3>
            </div>
            <div className="space-y-3">
              {result.localChecks.map((check, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-gray-900/40 border border-gray-800">
                  {check.status === 'pass' && <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />}
                  {check.status === 'fail' && <XCircle className="w-5 h-5 text-loss flex-shrink-0 mt-0.5" />}
                  {check.status === 'warning' && <AlertCircle className="w-5 h-5 text-badge-orange flex-shrink-0 mt-0.5" />}
                  <div>
                    <p className="font-semibold text-white">{check.name}</p>
                    <p className="text-sm text-gray-400">{check.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Network Signals */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Network className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold text-white">ShieldNet Network Signals</h3>
            </div>
            <div className="space-y-3">
              {result.networkSignals.map((signal, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-gray-900/40 border border-gray-800">
                  {signal.type === 'flagged' && <XCircle className="w-5 h-5 text-loss flex-shrink-0 mt-0.5" />}
                  {signal.type === 'clean' && <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />}
                  {signal.type === 'seen' && <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />}
                  <p className="text-gray-300">{signal.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Analyze Another */}
          <Button
            onClick={() => {
              setResult(null);
              setFile(null);
            }}
            variant="outline"
            className="w-full border-gray-700 hover:bg-gray-900/40 text-white hover:text-white"
          >
            Analyze Another Invoice
          </Button>
        </div>
      )}
    </Card>
  );
};
