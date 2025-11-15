import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  badgeColor: "blue" | "orange" | "green" | "pink" | "purple";
}

const badgeColorClasses = {
  blue: "bg-badge-blue",
  orange: "bg-badge-orange",
  green: "bg-badge-green",
  pink: "bg-badge-pink",
  purple: "bg-badge-purple",
};

export const FeatureCard = ({ title, description, icon: Icon, badgeColor }: FeatureCardProps) => {
  return (
    <Card className="group relative overflow-hidden border-gray-800 bg-black/40 backdrop-blur-sm shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-500 hover:scale-[1.02] cursor-pointer">
      <div className="p-8">
        <div className={`w-16 h-16 rounded-2xl ${badgeColorClasses[badgeColor]} flex items-center justify-center shadow-lg shadow-${badgeColor}/50 mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/10`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 shadow-lg shadow-primary/50" />
    </Card>
  );
};
