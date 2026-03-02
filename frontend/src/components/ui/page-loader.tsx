import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  message?: string;
  className?: string;
}

const PageLoader = ({ message = "Memuat data...", className }: PageLoaderProps) => {
  return (
    <div className={cn("flex min-h-[500px] items-center justify-center", className)}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export { PageLoader };
