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
      className={cn("rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow min-w-0", variantStyles[variant])}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground leading-snug break-words">
            {title}
          </p>
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <span className="text-base sm:text-lg font-bold tracking-tight text-card-foreground break-words">
              {value}
            </span>
            {unit && <span className="text-xs font-medium text-muted-foreground shrink-0">{unit}</span>}
          </div>
          {trend && <p className="text-xs font-medium text-cap-green mt-1">{trend}</p>}
        </div>
        {Icon && (
          <div className={cn("w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0", iconStyles[variant])}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
