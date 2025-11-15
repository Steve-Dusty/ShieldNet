import { RefreshCw, Settings, ArrowDownUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const QuickTradePanel = () => {
  return (
    <Card className="border-gray-200 bg-white shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Quick Trade</h2>
          <p className="text-sm text-muted-foreground">Instant crypto exchange</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <RefreshCw className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* From Section */}
      <div className="space-y-4 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">From</span>
          <span className="text-muted-foreground">Balance: 12.5847 BTC</span>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border/50">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-badge-orange flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-foreground font-semibold">BTC</span>
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">0.5</div>
            <div className="text-sm text-muted-foreground">≈ $21,450.00</div>
          </div>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center my-4">
        <Button variant="ghost" size="icon" className="rounded-full bg-secondary hover:bg-secondary/80">
          <ArrowDownUp className="w-5 h-5 text-foreground" />
        </Button>
      </div>

      {/* To Section */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">To</span>
          <span className="text-muted-foreground">Balance: 245.92 ETH</span>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border/50">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-badge-blue flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-foreground font-semibold">ETH</span>
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">12.847</div>
            <div className="text-sm text-muted-foreground">≈ $21,380.50</div>
          </div>
        </div>
      </div>

      {/* Exchange Details */}
      <div className="space-y-3 p-4 rounded-xl bg-secondary/30 border border-border/30 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Exchange Rate</span>
          <span className="text-foreground font-medium">1 BTC = 25.694 ETH</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Network Fee</span>
          <span className="text-foreground font-medium">~$12.50</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Estimated Time</span>
          <span className="text-success font-medium">~2 minutes</span>
        </div>
      </div>

      <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-lg">
        Execute Trade
      </Button>
    </Card>
  );
};
