import { CheckCircle, Clock, XCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionStatusProps {
  txId: string;
  status: "pending" | "confirmed" | "failed";
  type: string;
  className?: string;
}

export function TransactionStatus({ txId, status, type, className }: TransactionStatusProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-yellow-500",
      label: "Pending",
    },
    confirmed: {
      icon: CheckCircle,
      color: "text-green-500",
      label: "Confirmed",
    },
    failed: {
      icon: XCircle,
      color: "text-red-500",
      label: "Failed",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-2 p-2 rounded bg-secondary/50", className)}>
      <Icon className={cn("h-4 w-4", config.color)} />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {type}
        </div>
        <div className="text-xs font-mono truncate">
          {txId}
        </div>
      </div>
      <a
        href={`https://explorer.aleo.org/transaction/${txId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}