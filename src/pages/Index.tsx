import { useState } from "react";
import { BarChart3, TrendingUp, Target, Zap, Brain, Shield, Activity, DollarSign, LineChart } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { FeatureCard } from "@/components/FeatureCard";
import { InvoiceAnalysis } from "@/components/InvoiceAnalysis";
import { ThreatAnalytics } from "@/components/ThreatAnalytics";
import { TreasuryPanel } from "@/components/TreasuryPanel";
import { PDFScanBackground } from "@/components/PDFScanBackground";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [activeTab, setActiveTab] = useState("platform");

  const handleAnalysisComplete = () => {
    console.log("handleAnalysisComplete called");
    console.log("Current tab:", activeTab);

    // Trigger refresh of ThreatAnalytics
    window.dispatchEvent(new Event('refreshThreatAnalytics'));

    // Switch to analytics tab after a short delay to ensure refresh starts
    setTimeout(() => {
      setActiveTab("analytics");
      console.log("Switched to analytics tab");
    }, 100);
  };

  // Also refresh when switching to analytics tab manually
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "analytics") {
      window.dispatchEvent(new Event('refreshThreatAnalytics'));
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Animated PDF Scanning Background */}
      <PDFScanBackground />
      
      {/* Navigation */}
      <nav className="border-b border-gray-300 backdrop-blur-xl bg-white/90 sticky top-0 z-50 relative shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ShieldNet</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-gray-700 hover:text-primary hover:bg-gray-100">
                Invoice Protection
              </Button>
              <Button variant="ghost" className="text-gray-700 hover:text-primary hover:bg-gray-100">
                Threat Analytics
              </Button>
              <Button variant="ghost" className="text-gray-700 hover:text-primary hover:bg-gray-100">
                Treasury
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-white font-semibold px-6">
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 relative z-10">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-card/50 backdrop-blur-xl border border-border/50 p-1">
            <TabsTrigger 
              value="platform" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white font-semibold"
            >
              Invoice Protection
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white font-semibold"
            >
              Threat Analytics
            </TabsTrigger>
          </TabsList>

          {/* Invoice Protection Platform Tab */}
          <TabsContent value="platform" className="space-y-8 animate-fade-in">
            {/* Hero Section */}
            <section className="mb-8 max-w-3xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-gray-600 font-medium">Shared Immune System for AI Payments</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                AI agents that refuse
                <br />
                <span className="bg-gradient-to-r from-primary via-badge-purple to-badge-pink bg-clip-text text-transparent">
                  to pay bad invoices
                </span>
              </h1>
              <p className="text-xl text-gray-900 font-semibold max-w-2xl mb-8 leading-relaxed">
                Multi-agent fraud detection verifies every invoice before USDC moves. Blocked threats are shared across the network—early detectors earn rewards.
              </p>
              <div className="flex items-center gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold px-8">
                  Start Protecting
                </Button>
                <Button size="lg" variant="outline" className="border-gray-300 hover:bg-gray-100 text-gray-900 bg-white">
                  See How It Works
                </Button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-8 mt-12">
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">$1.2M</div>
                  <div className="text-sm text-gray-600">Fraud Blocked by Network</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">2,847</div>
                  <div className="text-sm text-gray-600">Invoices Auto-Blocked</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">94.2%</div>
                  <div className="text-sm text-gray-600">AI Detection Accuracy</div>
                </div>
              </div>
            </section>

            {/* Invoice & Treasury Interface */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InvoiceAnalysis onAnalysisComplete={handleAnalysisComplete} />
              <TreasuryPanel />
            </section>

            {/* Features Grid */}
            <section className="mt-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How ShieldNet Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FeatureCard
                  title="Multi-Agent Verification"
                  description="AI agents parse invoices, verify against POs and contracts, check hours vs. logs, and query the ShieldNet network before any payment moves."
                  icon={Shield}
                  badgeColor="blue"
                />
                <FeatureCard
                  title="Network Intelligence"
                  description="Every blocked threat is anonymized and shared across the network. When others use your intel to stop fraud, you earn micro-rewards."
                  icon={Brain}
                  badgeColor="green"
                />
                <FeatureCard
                  title="Treasury Protection"
                  description="Locus-powered USDC payments only execute after verification. Blocked invoices never leave your wallet, and threats are tracked forever."
                  icon={LineChart}
                  badgeColor="orange"
                />
              </div>
            </section>
          </TabsContent>

          {/* Analytics/Performance Tab */}
          <TabsContent value="analytics" className="space-y-8 animate-fade-in">
            <ThreatAnalytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
