import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
}

export const StatCard = ({
  icon,
  title,
  value,
  subtitle,
  trend,
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <Card className="border-0 shadow-md transition-all duration-300 bg-white dark:bg-slate-900">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p className="text-2xl font-bold">{value}</p>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-purple-600/10">
              {icon}
            </div>
          </div>
          {trend && (
            <p className="text-xs text-green-500 font-medium mt-1">{trend}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
