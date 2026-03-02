import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus, ArrowUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  color: "primary" | "success" | "warning" | "destructive" | "info" | "secondary";
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  onClick?: () => void;
  className?: string;
}

const colorMap = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
  secondary: "bg-secondary/10 text-secondary",
};

const StatCard = ({
  title,
  value,
  subValue,
  icon,
  color,
  trend,
  trendValue,
  onClick,
  className,
}: StatCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "card-hover rounded-lg border border-border bg-card p-4 transition-all hover:shadow-lg hover:-translate-y-1 group",
        onClick && "cursor-pointer hover:border-primary/30",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{title}</p>
          <p className="text-2xl font-bold group-hover:scale-105 transition-transform">{value}</p>
          {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
          {trend && trendValue && (
            <div
              className={cn(
                "mt-2 flex items-center gap-1 text-xs font-medium",
                trend === "up"
                  ? "text-success"
                  : trend === "down"
                  ? "text-destructive"
                  : "text-muted-foreground"
              )}
            >
              {trend === "up" && <ArrowUpRight className="h-3 w-3 animate-bounce" />}
              {trend === "down" && <ArrowDownRight className="h-3 w-3 animate-bounce" />}
              {trend === "neutral" && <Minus className="h-3 w-3" />}
              {trendValue}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center">
          <div
            className={cn(
              "h-10 w-10 items-center justify-center rounded-lg transition-all group-hover:scale-110 icon-hover",
              colorMap[color],
              onClick && "cursor-pointer group-hover:bg-hover:scale-110"
            )}
          >
            <div className="transition-transform group-hover:rotate-3">
              {icon}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { StatCard };
