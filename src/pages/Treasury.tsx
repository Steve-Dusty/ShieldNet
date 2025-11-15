import { TreasuryPanel } from "@/components/TreasuryPanel";
import { Wallet, DollarSign, TrendingUp, Lock } from "lucide-react";

const Treasury = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-emerald-950/30">
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Treasury Management</h1>
              <p className="text-gray-400">Protected USDC payments and transaction history</p>
            </div>
          </div>
        </div>

        {/* Treasury Panel */}
        <div className="max-w-3xl mx-auto">
          <TreasuryPanel />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-950/40 to-black/40 rounded-2xl p-6 border border-emerald-800/30 backdrop-blur-sm">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Lock className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Protected Payments</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Every USDC payment goes through AI verification before execution
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-950/40 to-black/40 rounded-2xl p-6 border border-blue-800/30 backdrop-blur-sm">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Auto-Payments</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Verified invoices are paid automatically through Locus integration
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-950/40 to-black/40 rounded-2xl p-6 border border-purple-800/30 backdrop-blur-sm">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Real-Time Tracking</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Monitor all transactions with detailed status and audit trails
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Treasury;
