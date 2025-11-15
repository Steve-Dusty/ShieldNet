import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  badgeColor: "blue" | "orange" | "green" | "pink" | "purple";
  trend?: string;
}

const badgeColorClasses = {
  blue: "bg-badge-blue",
  orange: "bg-badge-orange",
  green: "bg-badge-green",
  pink: "bg-badge-pink",
  purple: "bg-badge-purple",
};

export const StatCard = ({ title, value, subtitle, icon: Icon, badgeColor, trend }: StatCardProps) => {
  return (
    <Card className="relative overflow-hidden border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">{title}</p>
            <h3 className="text-4xl font-bold text-gray-900">{value}</h3>
          </div>
          <div className={`w-14 h-14 rounded-2xl ${badgeColorClasses[badgeColor]} flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>{trend}</span>
          </div>
        )}
        <p className="text-sm text-primary mt-2">{subtitle}</p>
      </div>
    </Card>
  );
};
