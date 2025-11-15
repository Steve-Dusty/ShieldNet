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
  const [files, setFiles] = useState<File[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [streamingText, setStreamingText] = useState<string>("");
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      setFiles(fileList);
    }
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;

    setAnalyzing(true);
    setProgressMessage("");
    setCurrentStep(0);
    setStreamingText("");
    setTotalFiles(files.length);
    setCurrentFileIndex(0);

    let successCount = 0;
    let failedCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFileIndex(i + 1);
        setStreamingText("");

        console.log(`Analyzing file ${i + 1}/${files.length}: ${file.name}`);

        try {
          const analysisResult = await analyzeInvoiceStreaming(file, (update) => {
            if (update.type === 'progress') {
              console.log("Progress:", update.message);
              setProgressMessage(`[${i + 1}/${files.length}] ${update.message}`);
              setCurrentStep(update.step);
            } else if (update.type === 'stream') {
              setStreamingText(prev => prev + update.text);
            } else if (update.type === 'complete') {
              console.log("Analysis complete:", update.result);
            }
          });

          console.log("Analysis finished:", analysisResult);

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

          successCount++;

        } catch (fileError) {
          console.error(`Failed to analyze ${file.name}:`, fileError);
          failedCount++;
        }

        // Small delay between files
        if (i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      // All files processed
      setAnalyzing(false);
      setFiles([]);

      // Show summary message
      toast({
        title: "Batch Analysis Complete",
        description: `Successfully analyzed ${successCount} file${successCount !== 1 ? 's' : ''}${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
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
      console.error("Batch analysis error:", error);
      setAnalyzing(false);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze invoices. Please try again.",
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
            <h2 className="text-2xl font-bold text-white mb-1">
              AI Analyzing {totalFiles > 1 ? `Invoices (${currentFileIndex}/${totalFiles})` : 'Invoice'}...
            </h2>
            <p className="text-sm text-gray-400">Claude is thinking</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/40 animate-pulse">
            <FileText className="w-6 h-6 text-white" />
          </div>
        </div>

        {totalFiles > 1 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>Progress: {currentFileIndex} of {totalFiles} files</span>
              <span>{Math.round((currentFileIndex / totalFiles) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all duration-300"
                style={{ width: `${(currentFileIndex / totalFiles) * 100}%` }}
              />
            </div>
          </div>
        )}

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
              multiple
              onChange={handleFileChange}
            />
            <label htmlFor="invoice-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-white font-semibold mb-2">
                {files.length > 0
                  ? `${files.length} file${files.length > 1 ? 's' : ''} selected`
                  : "Drop invoice files here or click to upload"}
              </p>
              <p className="text-sm text-gray-400">
                PDF, PNG, or JPG • Multiple files supported (Max 10MB each)
              </p>
              {files.length > 0 && (
                <div className="mt-4 text-left max-h-32 overflow-y-auto">
                  {files.map((f, i) => (
                    <p key={i} className="text-xs text-gray-500 truncate">• {f.name}</p>
                  ))}
                </div>
              )}
            </label>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={files.length === 0 || analyzing}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-lg shadow-lg shadow-primary/40"
          >
            {analyzing ? "Analyzing..." : `Analyze ${files.length || ''} Invoice${files.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
    </Card>
  );
};
