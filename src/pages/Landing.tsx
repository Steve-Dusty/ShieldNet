import { Shield, Brain, LineChart, ArrowRight, CheckCircle, Zap } from "lucide-react";
import { FeatureCard } from "@/components/FeatureCard";
import { PDFScanBackground } from "@/components/PDFScanBackground";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      {/* Animated PDF Scanning Background */}
      <PDFScanBackground />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16 relative z-10">
        {/* Hero Section */}
        <section className="mb-24 max-w-4xl mx-auto text-center">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
            <span className="text-sm text-emerald-400 font-medium tracking-wide">Shared Immune System for AI Payments</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            AI agents that refuse
            <br />
            <span className="bg-gradient-to-r from-primary via-badge-purple to-badge-pink bg-clip-text text-transparent animate-pulse">
              to pay bad invoices
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed mx-auto drop-shadow-lg">
            Multi-agent fraud detection verifies every invoice before USDC moves. Blocked threats are shared across the network—early detectors earn rewards.
          </p>
          <div className="flex items-center gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 shadow-lg shadow-primary/50 hover:shadow-xl hover:shadow-primary/60 transition-all border border-primary/30"
              onClick={() => navigate('/invoice-protection')}
            >
              Start Protecting
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-gray-600 hover:bg-white/10 text-white bg-white/5 backdrop-blur-md font-semibold hover:border-gray-500 transition-all"
            >
              See How It Works
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-primary/30 shadow-xl shadow-primary/20">
            <div>
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-badge-purple bg-clip-text text-transparent mb-2 drop-shadow-lg">$1.2M</div>
              <div className="text-sm text-gray-400 font-medium">Fraud Blocked by Network</div>
            </div>
            <div className="border-l border-r border-gray-700">
              <div className="text-5xl font-bold bg-gradient-to-r from-badge-purple to-badge-pink bg-clip-text text-transparent mb-2 drop-shadow-lg">2,847</div>
              <div className="text-sm text-gray-400 font-medium">Invoices Auto-Blocked</div>
            </div>
            <div>
              <div className="text-5xl font-bold bg-gradient-to-r from-badge-pink to-primary bg-clip-text text-transparent mb-2 drop-shadow-lg">94.2%</div>
              <div className="text-sm text-gray-400 font-medium">AI Detection Accuracy</div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-24">
          <h2 className="text-4xl font-bold text-white mb-4 text-center drop-shadow-lg">How ShieldNet Works</h2>
          <p className="text-lg text-gray-400 mb-12 text-center max-w-2xl mx-auto">
            Three layers of protection working together to keep your treasury safe
          </p>
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

        {/* Benefits Section */}
        <section className="mb-24 bg-gradient-to-br from-primary/10 via-badge-purple/10 to-badge-pink/10 rounded-3xl p-12 border border-primary/20 backdrop-blur-sm">
          <h2 className="text-4xl font-bold text-white mb-12 text-center drop-shadow-lg">Why Companies Choose ShieldNet</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Zero False Positives</h3>
                <p className="text-gray-400">Multi-agent consensus ensures legitimate invoices are never blocked</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Instant Verification</h3>
                <p className="text-gray-400">AI agents analyze invoices in seconds, not days</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                  <Brain className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Network Effect</h3>
                <p className="text-gray-400">Get smarter with every company that joins the network</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                  <Shield className="w-6 h-6 text-orange-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Earn Rewards</h3>
                <p className="text-gray-400">Get paid for contributing threat intelligence to the network</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-primary via-badge-purple to-badge-pink rounded-3xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to protect your treasury?</h2>
          <p className="text-xl mb-8 text-white/90">Join the network and start blocking fraud today</p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 shadow-xl"
              onClick={() => navigate('/invoice-protection')}
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 font-semibold"
              onClick={() => navigate('/threat-analytics')}
            >
              View Analytics
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
