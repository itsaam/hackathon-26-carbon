import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  trend?: string;
  variant?: "default" | "primary" | "vibrant" | "green";
  delay?: number;
}

const variantStyles = {
  default: "bg-card border border-border",
  primary: "bg-card border border-cap-blue/20",
  vibrant: "bg-card border border-cap-vibrant/20",
  green: "bg-card border border-cap-green/20",
};

const iconStyles = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-cap-blue/10 text-cap-blue",
  vibrant: "bg-cap-vibrant/10 text-cap-vibrant",
  green: "bg-cap-green/10 text-cap-green",
};

export default function KpiCard({ title, value, unit, icon: Icon, trend, variant = "default", delay = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1 }}
      className={cn("rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow", variantStyles[variant])}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-card-foreground">{value}</span>
            {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
          </div>
          {trend && <p className="text-xs font-medium text-cap-green mt-1">{trend}</p>}
        </div>
        {Icon && (
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconStyles[variant])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
