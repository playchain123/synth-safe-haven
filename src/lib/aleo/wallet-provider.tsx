import React, { FC, useMemo, ReactNode } from "react";
import { WalletProvider } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletModalProvider } from "@demox-labs/aleo-wallet-adapter-reactui";
import { LeoWalletAdapter } from "@demox-labs/aleo-wallet-adapter-leo";
import {
  DecryptPermission,
  WalletAdapterNetwork,
} from "@demox-labs/aleo-wallet-adapter-base";

// Import wallet adapter styles
import "@demox-labs/aleo-wallet-adapter-reactui/styles.css";

interface AleoWalletProviderProps {
  children: ReactNode;
}

export const AleoWalletProvider: FC<AleoWalletProviderProps> = ({ children }) => {
  // Initialize Leo Wallet adapter for Aleo Testnet Beta
  // Following: https://docs.leo.app/aleo-wallet-adapter/
  const wallets = useMemo(
    () => [
      new LeoWalletAdapter({
        appName: "AleoSynth",
      }),
    ],
    []
  );

  return (
    <WalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.UponRequest}
      network={WalletAdapterNetwork.TestnetBeta}
      autoConnect
    >
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </WalletProvider>
  );
};