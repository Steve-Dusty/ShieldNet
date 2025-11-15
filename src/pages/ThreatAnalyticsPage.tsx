import { ThreatAnalytics } from "@/components/ThreatAnalytics";
import { Activity, TrendingDown, Shield } from "lucide-react";

const ThreatAnalyticsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-purple-950/30">
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-badge-purple to-badge-pink flex items-center justify-center shadow-lg shadow-purple-500/40">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Threat Analytics</h1>
              <p className="text-gray-400">Network intelligence and fraud patterns</p>
            </div>
          </div>
        </div>

        {/* Threat Analytics Component */}
        <ThreatAnalytics />

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-gradient-to-br from-purple-950/40 to-black/40 rounded-2xl p-6 border border-purple-800/30 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Network Protection</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Every threat blocked by your system is anonymized and shared with the ShieldNet network. This creates a collective immune system that gets stronger as more companies join.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-950/40 to-black/40 rounded-2xl p-6 border border-amber-800/30 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                <TrendingDown className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Earn Rewards</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  When your threat intelligence helps another company block fraud, you earn micro-rewards. Early detection = higher rewards. Your contribution makes everyone safer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ThreatAnalyticsPage;
