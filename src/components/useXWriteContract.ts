import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useEffect, useState } from "react";
import { WriteContractErrorType } from "viem";
import { useToast } from "@/components/ui/use-toast";

type Log = {
  address: string;
  topics: string[];
  data: string;
  blockNumber: bigint;
  transactionHash: string;
  logIndex: number;
  blockHash: string;
};

type TransactionReceipt = {
  blockHash: string;
  blockNumber: bigint;
  contractAddress: string | null;
  cumulativeGasUsed: bigint;
  effectiveGasPrice: bigint;
  from: string;
  gasUsed: bigint;
  logs: Log[];
  status: "success" | "reverted";
  to: string;
  transactionHash: string;
  transactionIndex: number;
};

interface UseXWriteContractOptions {
  onSubmitted?: (hash: string) => void;
  onSuccess?: (receipt: TransactionReceipt) => void;
  onError?: (error: WriteContractErrorType) => void;
}

const useXWriteContract = ({
  onSubmitted,
  onSuccess,
  onError,
}: UseXWriteContractOptions = {}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    data: hash,
    isPending: isSubmittedLoading,
    writeContractAsync,
    isSuccess: isSubmitted,
    error: submittedError,
    isError,
  } = useWriteContract({});

  const {
    isSuccess,
    data: receipt,
    error: writeError,
    isError: isWriteError,
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  // Handle transaction submission
  useEffect(() => {
    if (isSubmitted && hash) {
      setLoading(true);
      toast({
        title: "Transaction submitted",
        description: `Transaction hash: ${hash}`,
      });
      onSubmitted?.(hash);
    }
  }, [isSubmitted, hash, onSubmitted]);

  // Handle submission error
  useEffect(() => {
    if (isError && submittedError) {
      setLoading(false);
      const errorMessage =
        submittedError.message.split("Contract Call:")[0] ||
        "Failed to submit transaction. Please try again.";

      toast({
        title: "Transaction failed",
        description: errorMessage,
        variant: "destructive",
      });
      onError?.(submittedError as WriteContractErrorType);
    }
  }, [submittedError, isError, onError]);

  // Handle transaction execution error
  useEffect(() => {
    if (isWriteError && writeError) {
      setLoading(false);
      const errorMessage =
        writeError.message.split("Contract Call:")[0] ||
        "Transaction execution failed. Please try again.";

      toast({
        title: "Transaction failed",
        description: errorMessage,
        variant: "destructive",
      });
      onError?.(writeError as WriteContractErrorType);
    }
  }, [writeError, isWriteError, onError]);

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && receipt) {
      setLoading(false);
      toast({
        title: "Transaction successful",
        description: "Your transaction has been confirmed.",
      });
      onSuccess?.(receipt as TransactionReceipt);
    }
  }, [isSuccess, receipt, onSuccess]);

  return {
    hash,
    receipt,
    loading: loading || isSubmittedLoading,
    writeContractAsync,
    isSubmitted,
    isSuccess,
    error: submittedError || writeError,
  };
};

export default useXWriteContract;
