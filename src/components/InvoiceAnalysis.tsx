import { useState } from "react";
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { analyzeInvoiceStreaming, reportThreat } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface InvoiceAnalysisProps {
  onAnalysisComplete?: () => void;
}

export const InvoiceAnalysis = ({ onAnalysisComplete }: InvoiceAnalysisProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [streamingText, setStreamingText] = useState<string>("");
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    setProgressMessage("");
    setCurrentStep(0);
    setStreamingText("");

    try {
      console.log("Starting invoice analysis...");
      const analysisResult = await analyzeInvoiceStreaming(file, (update) => {
        if (update.type === 'progress') {
          console.log("Progress:", update.message);
          setProgressMessage(update.message);
          setCurrentStep(update.step);
        } else if (update.type === 'stream') {
          setStreamingText(prev => prev + update.text);
        } else if (update.type === 'complete') {
          console.log("Analysis complete:", update.result);
        }
      });

      console.log("Analysis finished:", analysisResult);

      // Analysis complete - stop analyzing immediately
      setAnalyzing(false);
      setFile(null);

      // If blocked, report to threat network
      if (analysisResult.status === 'blocked') {
        console.log("Reporting threat to network...");
        await reportThreat({
          invoiceId: analysisResult.invoiceId,
          vendor: analysisResult.vendor,
          fraudScore: analysisResult.fraudScore,
          reason: analysisResult.explanation,
          amount: analysisResult.amount,
        });
        console.log("Threat reported successfully");
      }

      // Show success message
      toast({
        title: "Analysis Complete",
        description: `Invoice ${analysisResult.status === 'approved' ? 'approved' : analysisResult.status === 'blocked' ? 'blocked' : 'on hold'}`,
      });

      // Wait briefly for backend to finish saving, then redirect
      console.log("Waiting before redirect...");
      await new Promise(resolve => setTimeout(resolve, 500));

      // Trigger treasury and threat analytics refresh
      window.dispatchEvent(new Event('refreshTreasury'));
      window.dispatchEvent(new Event('refreshThreatAnalytics'));

      console.log("Calling onAnalysisComplete");
      onAnalysisComplete?.();

    } catch (error) {
      console.error("Analysis error:", error);
      setAnalyzing(false);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze invoice. Please try again.",
        variant: "destructive",
      });
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

  if (analyzing) {
    // Full-page streaming analysis view
    return (
      <Card className="border-gray-800 bg-black/40 backdrop-blur-sm shadow-lg p-6 min-h-[600px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">AI Analyzing Invoice...</h2>
            <p className="text-sm text-gray-400">Claude is thinking</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/40 animate-pulse">
            <FileText className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Streaming AI Analysis */}
        <div className="p-6 rounded-xl bg-black/60 border border-primary/30 min-h-[500px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-primary font-semibold">Live AI Analysis Stream</p>
          </div>
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
            {streamingText || "Initializing Claude AI analysis..."}
          </pre>
        </div>
      </Card>
    );
  }

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
                PDF, PNG, or JPG (Max 10MB)
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
    </Card>
  );
};
