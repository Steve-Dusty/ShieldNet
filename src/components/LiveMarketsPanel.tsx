import { Card } from "@/components/ui/card";
import { Shield, Key } from "lucide-react";

const marketData = [
  { symbol: "BTC/USD", name: "Bitcoin", price: "$44,084.92", change: "+2.45%", positive: true, color: "bg-badge-orange" },
  { symbol: "ETH/USD", name: "Ethereum", price: "$1,616.18", change: "-1.23%", positive: false, color: "bg-badge-blue" },
  { symbol: "SOL/USD", name: "Solana", price: "$99.24", change: "+5.67%", positive: true, color: "bg-badge-purple" },
];

export const LiveMarketsPanel = () => {
  return (
    <Card className="border-gray-200 bg-white shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Live Markets</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm text-muted-foreground">Real-time</span>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {marketData.map((market) => (
          <div
            key={market.symbol}
            className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-all cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-xl ${market.color} flex items-center justify-center shadow-lg`}>
              <span className="text-white font-bold">{market.symbol.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-foreground">{market.symbol}</div>
              <div className="text-sm text-muted-foreground">{market.name}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-foreground text-lg">{market.price}</div>
              <div className={`text-sm font-medium ${market.positive ? "text-success" : "text-loss"}`}>
                {market.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground mb-4">Security Features</h3>
        
        <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/20 border border-border/20">
          <div className="w-10 h-10 rounded-lg bg-badge-green/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-badge-green" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">Multi-signature wallets</h4>
            <p className="text-sm text-muted-foreground">Enhanced security with multiple approvals</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/20 border border-border/20">
          <div className="w-10 h-10 rounded-lg bg-badge-orange/20 flex items-center justify-center">
            <Key className="w-5 h-5 text-badge-orange" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">Hardware security modules</h4>
            <p className="text-sm text-muted-foreground">Bank-grade encryption and protection</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
