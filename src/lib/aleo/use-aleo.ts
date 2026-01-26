import { useCallback, useState } from "react";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletNotConnectedError } from "@demox-labs/aleo-wallet-adapter-base";
import { supabase } from "@/integrations/supabase/client";

export interface AleoTransaction {
  txId: string;
  status: "pending" | "confirmed" | "failed";
  type: string;
  timestamp: Date;
}

export interface GenerationResult {
  generationId: string;
  syntheticData: Record<string, (string | number)[]>;
  qualityScore: number;
  aleoTxId: string;
  proofHash: string;
  synthCommitment: string;
  columnsIncluded: number;
  sensitiveRemoved: number;
}

export function useAleo() {
  const { publicKey, connected, signMessage, requestTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user's Aleo address
  const getAddress = useCallback(() => {
    if (!publicKey) return null;
    return publicKey;
  }, [publicKey]);

  // Sign a message to prove ownership
  const signDatasetCommitment = useCallback(async (commitment: string): Promise<string | null> => {
    if (!publicKey) throw new WalletNotConnectedError();
    
    try {
      const message = `AleoSynth Dataset Registration: ${commitment}`;
      const bytes = new TextEncoder().encode(message);
      // Note: signMessage returns Uint8Array, we convert to hex string
      const signatureBytes = await signMessage?.(bytes);
      if (!signatureBytes) return null;
      return Array.from(signatureBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (err) {
      console.error("Signing error:", err);
      return null;
    }
  }, [publicKey, signMessage]);

  // Register a dataset on-chain
  const registerDataset = useCallback(async (
    filename: string,
    originalHash: string,
    columnCount: number,
    rowCount: number,
    datasetType: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const userAddress = publicKey || `demo_${Date.now().toString(16)}`;

      const { data, error: fnError } = await supabase.functions.invoke("register-dataset", {
        body: {
          userAddress,
          filename,
          originalHash,
          columnCount,
          rowCount,
          datasetType,
        },
      });

      if (fnError) throw fnError;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [publicKey]);

  // Generate synthetic data
  const generateSynthetic = useCallback(async (
    datasetId: string,
    columns: { name: string; type: string; selected: boolean }[],
    hideSensitive: boolean,
    privacySafeRanges: boolean,
    syntheticRows: number,
    outputFormat: string,
    qualityMode: string,
    originalDataHash: string
  ): Promise<GenerationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const userAddress = publicKey || `demo_${Date.now().toString(16)}`;

      const { data, error: fnError } = await supabase.functions.invoke("generate-synthetic", {
        body: {
          datasetId,
          userAddress,
          columns,
          hideSensitive,
          privacySafeRanges,
          syntheticRows,
          outputFormat,
          qualityMode,
          originalDataHash,
        },
      });

      if (fnError) throw fnError;
      return data as GenerationResult;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [publicKey]);

  // Verify a synthetic data proof
  const verifyProof = useCallback(async (generationId: string, synthCommitment: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("verify-proof", {
        body: { generationId, synthCommitment },
      });

      if (fnError) throw fnError;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Export receipt
  const exportReceipt = useCallback(async (generationId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("export-receipt", {
        body: { generationId },
      });

      if (fnError) throw fnError;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Request transaction execution
  const executeAleoProgram = useCallback(async (
    programId: string,
    functionName: string,
    inputs: string[]
  ) => {
    if (!publicKey || !requestTransaction) {
      throw new WalletNotConnectedError();
    }

    try {
      const result = await requestTransaction({
        address: publicKey,
        chainId: "testnetbeta",
        transitions: [{
          program: programId,
          functionName,
          inputs,
        }],
        fee: 100000,
        feePrivate: false,
      });

      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [publicKey, requestTransaction]);

  return {
    connected,
    address: getAddress(),
    isLoading,
    error,
    signDatasetCommitment,
    registerDataset,
    generateSynthetic,
    verifyProof,
    exportReceipt,
    executeAleoProgram,
  };
}