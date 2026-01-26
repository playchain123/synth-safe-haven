import { Shield, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProofBadgeProps {
  verified: boolean;
  label: string;
  className?: string;
}

export function ProofBadge({ verified, label, className }: ProofBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] uppercase tracking-wider",
        verified
          ? "bg-green-500/10 text-green-400 border border-green-500/20"
          : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
        className
      )}
    >
      {verified ? (
        <CheckCircle className="h-3 w-3" />
      ) : (
        <AlertCircle className="h-3 w-3" />
      )}
      <span>{label}</span>
      {verified && <span>✓</span>}
    </div>
  );
}