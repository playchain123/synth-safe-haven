import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { cn } from "@/lib/utils";

interface WalletButtonProps {
  className?: string;
}

export function WalletButton({ className }: WalletButtonProps) {
  const { connected, publicKey } = useWallet();

  return (
    <div className={cn("wallet-button-wrapper", className)}>
      <WalletMultiButton
        style={{
          backgroundColor: connected ? "#1a1a1a" : "#ffffff",
          color: connected ? "#ffffff" : "#000000",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "4px",
          fontSize: "10px",
          fontWeight: 400,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "8px 16px",
          height: "auto",
        }}
      />
      {connected && publicKey && (
        <div className="mt-1 text-[9px] text-muted-foreground font-mono truncate max-w-[120px]">
          {publicKey.slice(0, 8)}...{publicKey.slice(-6)}
        </div>
      )}
    </div>
  );
}