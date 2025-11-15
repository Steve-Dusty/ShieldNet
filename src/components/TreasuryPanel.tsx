import { useState, useEffect } from "react";
import { Wallet, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getWalletBalance, getTransactions, WalletBalance, Transaction } from "@/services/api";

export const TreasuryPanel = () => {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("TreasuryPanel: Fetching wallet and transaction data...");
        const [balanceData, transactionsData] = await Promise.all([
          getWalletBalance(),
          getTransactions(),
        ]);
        console.log("TreasuryPanel: Received balance:", balanceData);
        console.log("TreasuryPanel: Received transactions:", transactionsData);
        setBalance(balanceData);
        setTransactions(transactionsData);
      } catch (error) {
        console.error("TreasuryPanel: Failed to fetch treasury data:", error);
        // Still set loading to false even on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for refresh events
    const handleRefresh = () => {
      console.log("TreasuryPanel: Refresh triggered");
      setLoading(true);
      fetchData();
    };

    window.addEventListener('refreshTreasury', handleRefresh);
    return () => window.removeEventListener('refreshTreasury', handleRefresh);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'blocked':
        return <XCircle className="w-5 h-5 text-loss" />;
      case 'held':
        return <Clock className="w-5 h-5 text-badge-orange" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-success/20 text-success';
      case 'blocked':
        return 'bg-loss/20 text-loss';
      case 'held':
        return 'bg-badge-orange/20 text-badge-orange';
      default:
        return 'bg-secondary text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card className="border-gray-800 bg-black/40 backdrop-blur-sm shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/3 mb-4" />
          <div className="space-y-3">
            <div className="h-32 bg-gray-800 rounded" />
            <div className="h-24 bg-gray-800 rounded" />
            <div className="h-24 bg-gray-800 rounded" />
          </div>
        </div>
      </Card>
    );
  }

  if (!balance) {
    return (
      <Card className="border-gray-800 bg-black/40 backdrop-blur-sm shadow-lg p-6">
        <p className="text-gray-400">Failed to load treasury data.</p>
      </Card>
    );
  }

  return (
    <Card className="border-gray-800 bg-black/40 backdrop-blur-sm shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Treasury Wallet</h2>
          <p className="text-sm text-gray-400">USDC payments via Locus</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-badge-green flex items-center justify-center shadow-lg shadow-emerald-500/40">
          <Wallet className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Wallet Balance */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-badge-purple/20 border border-primary/30 mb-6 backdrop-blur-sm">
        <p className="text-sm text-gray-400 mb-2">Current Balance</p>
        <h3 className="text-4xl font-bold text-white mb-4">
          {balance.balance.toLocaleString()} <span className="text-2xl text-primary">{balance.currency}</span>
        </h3>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
          <div>
            <p className="text-sm text-gray-400 mb-1">Auto-Paid This Month</p>
            <p className="text-xl font-bold text-success">
              ${balance.autoPaidThisMonth.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Blocked This Month</p>
            <p className="text-xl font-bold text-loss">
              ${balance.blockedThisMonth.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 hover:bg-gray-900/60 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">{getStatusIcon(tx.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-white">{tx.vendor}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadge(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-white">
                      {tx.amount.toLocaleString()} {tx.currency}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-gray-400">{tx.reason}</p>
                    <p className="text-gray-400">
                      {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Invoice: {tx.invoiceId}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/30 backdrop-blur-sm">
        <p className="text-sm text-gray-400">
          <span className="font-semibold text-white">Protected by ShieldNet:</span> Every payment
          is verified by AI agents before USDC moves. Blocked invoices are added to your Threat Analytics
          and shared anonymously with the network.
        </p>
      </div>
    </Card>
  );
};
