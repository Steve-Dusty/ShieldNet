import { InvoiceAnalysis } from "@/components/InvoiceAnalysis";
import { Shield, FileCheck, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InvoiceProtection = () => {
  const navigate = useNavigate();

  const handleAnalysisComplete = () => {
    console.log("InvoiceProtection: Analysis complete, navigating to threat analytics");

    // Navigate to threat analytics page after a brief delay to ensure backend saves complete
    setTimeout(() => {
      navigate('/threat-analytics');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-blue-950/30">
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-badge-purple flex items-center justify-center shadow-lg shadow-primary/40">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Invoice Protection</h1>
              <p className="text-gray-400">AI-powered fraud detection for every payment</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <InvoiceAnalysis onAnalysisComplete={handleAnalysisComplete} />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-gradient-to-br from-blue-950/40 to-black/40 rounded-2xl p-6 border border-blue-800/30 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                <FileCheck className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">How Verification Works</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Our AI agents verify invoices against purchase orders, check vendor authenticity, cross-reference hours with time logs, and query the ShieldNet network for known fraud patterns. All in seconds.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-950/40 to-black/40 rounded-2xl p-6 border border-emerald-800/30 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Treasury Safety</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Blocked invoices never touch your USDC wallet. Approved payments execute automatically through Locus. Held invoices are flagged for manual review before any funds move.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InvoiceProtection;
