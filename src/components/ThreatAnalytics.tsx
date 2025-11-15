import { useState, useEffect } from "react";
import { AlertTriangle, TrendingUp, Shield, DollarSign, FileText, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getThreatAnalytics, getInvoiceHistory, ThreatAnalytics as ThreatAnalyticsData, InvoiceAnalysisResult } from "@/services/api";

export const ThreatAnalytics = () => {
  const [data, setData] = useState<ThreatAnalyticsData | null>(null);
  const [invoiceHistory, setInvoiceHistory] = useState<InvoiceAnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expandedInvoices, setExpandedInvoices] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("ThreatAnalytics: Fetching data...");
        console.log("ThreatAnalytics: API URL:", import.meta.env.VITE_API_URL || 'http://localhost:8000');

        const [analytics, history] = await Promise.all([
          getThreatAnalytics(),
          getInvoiceHistory(),
        ]);

        console.log("ThreatAnalytics: Received analytics:", analytics);
        console.log("ThreatAnalytics: Received history:", history);
        console.log("ThreatAnalytics: History length:", history.length);

        setData(analytics);
        setInvoiceHistory(history);
      } catch (error) {
        console.error("ThreatAnalytics: Failed to fetch data:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  // Expose refresh function for external use
  useEffect(() => {
    const handleRefresh = () => {
      console.log("ThreatAnalytics: Refresh triggered");
      setRefreshTrigger(prev => prev + 1);
    };

    // Listen for custom refresh event
    window.addEventListener('refreshThreatAnalytics', handleRefresh);
    return () => window.removeEventListener('refreshThreatAnalytics', handleRefresh);
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

  if (error) {
    return (
      <Card className="border-gray-800 bg-black/40 backdrop-blur-sm shadow-lg p-6">
        <div className="text-center py-8">
          <p className="text-loss font-semibold mb-2">Failed to load threat analytics</p>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border-gray-800 bg-black/40 backdrop-blur-sm shadow-lg p-6">
        <p className="text-gray-400">No data available. Try analyzing an invoice first.</p>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'blocked':
        return <XCircle className="w-5 h-5 text-loss" />;
      case 'hold':
        return <Clock className="w-5 h-5 text-badge-orange" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success/20 text-success border-success/30';
      case 'blocked':
        return 'bg-loss/20 text-loss border-loss/30';
      case 'hold':
        return 'bg-badge-orange/20 text-badge-orange border-badge-orange/30';
      default:
        return 'bg-secondary text-gray-600';
    }
  };

  const toggleInvoiceExpanded = (invoiceId: string) => {
    setExpandedInvoices(prev => {
      const next = new Set(prev);
      if (next.has(invoiceId)) {
        next.delete(invoiceId);
      } else {
        next.add(invoiceId);
      }
      return next;
    });
  };

  console.log("ThreatAnalytics: Rendering with invoiceHistory:", invoiceHistory);

  return (
    <div className="space-y-6">
      {/* Invoice Analysis History */}
      <Card className="border-gray-800 bg-black/40 backdrop-blur-sm shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Invoice Analysis History</h2>
            <p className="text-sm text-gray-400">
              All analyzed invoices with AI-powered fraud detection results ({invoiceHistory.length} invoices)
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-badge-blue flex items-center justify-center shadow-lg shadow-blue-500/40">
            <FileText className="w-6 h-6 text-white" />
          </div>
        </div>

        {invoiceHistory.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No invoices analyzed yet</p>
            <p className="text-sm text-gray-500 mt-2">Upload an invoice to see analysis results here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoiceHistory.map((invoice) => {
              const isExpanded = expandedInvoices.has(invoice.invoiceId);
              return (
                <div
                  key={invoice.invoiceId}
                  className="p-5 rounded-2xl bg-gray-900/40 border border-gray-800 hover:bg-gray-900/60 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(invoice.status)}
                      <div>
                        <h3 className="text-lg font-bold text-white">{invoice.vendor}</h3>
                        <p className="text-sm text-gray-400">Invoice ID: {invoice.invoiceId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">
                        ${invoice.amount.toLocaleString()} {invoice.currency}
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase border mt-2 ${getStatusBadge(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                    <div className="p-3 rounded-lg bg-black/40 border border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">Fraud Score</p>
                      <p className={`text-lg font-bold ${invoice.fraudScore > 70 ? 'text-loss' : invoice.fraudScore > 40 ? 'text-badge-orange' : 'text-success'}`}>
                        {invoice.fraudScore}/100
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40 border border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">Confidence</p>
                      <p className="text-lg font-bold text-white">{invoice.confidence}%</p>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40 border border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">Checks</p>
                      <p className="text-lg font-bold text-white">
                        {invoice.localChecks.filter(c => c.status === 'pass').length}/{invoice.localChecks.length}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleInvoiceExpanded(invoice.invoiceId)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-black/40 border border-gray-700 hover:bg-black/60 transition-colors"
                  >
                    <span className="text-sm font-semibold text-white">AI Decision Explanation</span>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 p-4 rounded-lg bg-black/60 border border-gray-700 space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-primary mb-2">Summary</h4>
                        <p className="text-sm text-gray-300 leading-relaxed">{invoice.explanation}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-primary mb-2">Local Checks</h4>
                        <div className="space-y-2">
                          {invoice.localChecks.map((check, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-gray-900/60 border border-gray-700">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-white">{check.name}</span>
                                <span className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                                  check.status === 'pass' ? 'bg-success/20 text-success' :
                                  check.status === 'fail' ? 'bg-loss/20 text-loss' :
                                  'bg-badge-orange/20 text-badge-orange'
                                }`}>
                                  {check.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400">{check.detail}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-primary mb-2">Network Signals</h4>
                        <div className="space-y-2">
                          {invoice.networkSignals.map((signal, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-gray-900/60 border border-gray-700">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full ${
                                  signal.type === 'clean' ? 'bg-success' :
                                  signal.type === 'flagged' ? 'bg-loss' :
                                  'bg-badge-orange'
                                }`} />
                                <span className="text-sm font-semibold text-white capitalize">{signal.type}</span>
                              </div>
                              <p className="text-xs text-gray-400">{signal.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <h3 className="text-3xl font-bold text-white">${data.totalBlockedAmount.toFixed(2)}</h3>
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
              Every blocked invoice is anonymized and shared with the ShieldNet network. This creates
              a shared immune system where every company benefits from threats caught by others,
              protecting the entire network from emerging fraud patterns.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
