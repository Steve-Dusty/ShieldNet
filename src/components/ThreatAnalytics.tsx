import { useState, useEffect } from "react";
import { AlertTriangle, TrendingUp, Shield, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getThreatAnalytics, ThreatAnalytics as ThreatAnalyticsData } from "@/services/api";

export const ThreatAnalytics = () => {
  const [data, setData] = useState<ThreatAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const analytics = await getThreatAnalytics();
        setData(analytics);
      } catch (error) {
        console.error("Failed to fetch threat analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card className="border-gray-800 bg-black/40 backdrop-blur-sm shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/3 mb-4" />
          <div className="space-y-3">
            <div className="h-24 bg-gray-800 rounded" />
            <div className="h-24 bg-gray-800 rounded" />
            <div className="h-24 bg-gray-800 rounded" />
          </div>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border-gray-800 bg-black/40 backdrop-blur-sm shadow-lg p-6">
        <p className="text-gray-400">Failed to load threat analytics.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-gray-800 bg-black/40 backdrop-blur-sm shadow-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-2">Threats Blocked</p>
              <h3 className="text-3xl font-bold text-white">{data.totalBlockedInvoices.toLocaleString()}</h3>
              <p className="text-sm text-primary mt-1">High-risk transactions</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-badge-blue flex items-center justify-center shadow-lg shadow-blue-500/40">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="border-gray-800 bg-black/40 backdrop-blur-sm shadow-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-2">Fraud Avoided</p>
              <h3 className="text-3xl font-bold text-white">${(data.totalBlockedAmount / 1000000).toFixed(1)}M</h3>
              <p className="text-sm text-primary mt-1">Total USDC protected</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-badge-orange flex items-center justify-center shadow-lg shadow-orange-500/40">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="border-gray-800 bg-black/40 backdrop-blur-sm shadow-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-2">Unique Threats</p>
              <h3 className="text-3xl font-bold text-white">{data.totalThreatsDetected}</h3>
              <p className="text-sm text-primary mt-1">Distinct fraud patterns</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-badge-purple flex items-center justify-center shadow-lg shadow-purple-500/40">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="border-gray-800 bg-black/40 backdrop-blur-sm shadow-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-2">Rewards Earned</p>
              <h3 className="text-3xl font-bold text-white">${data.rewardsEarned.toLocaleString()}</h3>
              <p className="text-sm text-primary mt-1">From threat intel sharing</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-badge-green flex items-center justify-center shadow-lg shadow-emerald-500/40">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Threat List */}
      <Card className="border-gray-800 bg-black/40 backdrop-blur-sm shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Detected Threats</h2>
            <p className="text-sm text-gray-400">
              Blocked invoices shared with ShieldNet network
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-lg shadow-emerald-500/50" />
            <span className="text-sm text-gray-400">Live monitoring</span>
          </div>
        </div>

        <div className="space-y-4">
          {data.threats.map((threat) => (
            <div
              key={threat.id}
              className="p-5 rounded-2xl bg-gray-900/40 border border-gray-800 hover:bg-gray-900/60 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{threat.vendor}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        threat.fraudScore >= 85
                          ? "bg-loss/20 text-loss"
                          : threat.fraudScore >= 70
                          ? "bg-badge-orange/20 text-badge-orange"
                          : "bg-badge-yellow/20 text-badge-yellow"
                      }`}
                    >
                      {threat.fraudScore}/100 Risk
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{threat.reason}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 mb-1">First Seen</p>
                      <p className="text-white font-semibold">
                        {new Date(threat.firstSeen).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Times Seen</p>
                      <p className="text-white font-semibold">{threat.timesSeen}x</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Amount Blocked</p>
                      <p className="text-white font-semibold">
                        ${threat.amountBlocked.toLocaleString()}
                      </p>
                    </div>
                    {threat.templateHash && (
                      <div>
                        <p className="text-gray-400 mb-1">Template Hash</p>
                        <p className="text-white font-mono text-xs">{threat.templateHash}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Network Intelligence Info */}
      <Card className="border-primary/30 bg-primary/10 backdrop-blur-xl shadow-card p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">
              How ShieldNet Network Intelligence Works
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Every blocked invoice is anonymized and shared with the ShieldNet network. When other
              companies' AI agents query and use your threat intelligence to block similar fraud, you
              earn micro-rewards. This creates a shared immune system where every company benefits
              from threats caught by others, and early detectors are rewarded for protecting the network.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
