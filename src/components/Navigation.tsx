import { TrendingUp, Shield, Activity, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-gray-800/50 backdrop-blur-xl bg-black/40 sticky top-0 z-50 shadow-lg shadow-black/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-badge-purple flex items-center justify-center shadow-lg shadow-primary/40 group-hover:shadow-xl group-hover:shadow-primary/60 transition-all">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              ShieldNet
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className={`text-gray-300 hover:text-primary hover:bg-primary/10 font-medium gap-2 ${
                isActive('/invoice-protection') ? 'bg-primary/20 text-primary' : ''
              }`}
              onClick={() => navigate('/invoice-protection')}
            >
              <Shield className="w-4 h-4" />
              Invoice Protection
            </Button>
            <Button
              variant="ghost"
              className={`text-gray-300 hover:text-primary hover:bg-primary/10 font-medium gap-2 ${
                isActive('/threat-analytics') ? 'bg-primary/20 text-primary' : ''
              }`}
              onClick={() => navigate('/threat-analytics')}
            >
              <Activity className="w-4 h-4" />
              Threat Analytics
            </Button>
            <Button
              variant="ghost"
              className={`text-gray-300 hover:text-primary hover:bg-primary/10 font-medium gap-2 ${
                isActive('/treasury') ? 'bg-primary/20 text-primary' : ''
              }`}
              onClick={() => navigate('/treasury')}
            >
              <Wallet className="w-4 h-4" />
              Treasury
            </Button>
            <Button className="bg-gradient-to-r from-primary to-badge-purple hover:from-primary/90 hover:to-badge-purple/90 text-white font-semibold px-6 ml-2 shadow-lg shadow-primary/40 hover:shadow-xl hover:shadow-primary/60 transition-all border border-primary/30">
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
