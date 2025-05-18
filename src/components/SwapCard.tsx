import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TokenAmountInput } from "@/components/TokenAmountInput";
import { useToast } from "@/components/ui/use-toast";
import { Token, NETWORKS } from "@/constants/tokens";
import { useWallet } from "@/hooks/useWallet";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useTokenAllowance } from "@/hooks/useTokenAllowance";
import { ArrowDown } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import useXWriteContract from "@/components/useXWriteContract";
import { parseEther, WriteContractParameters } from "viem";
import { base } from "wagmi/chains";
import { config } from "@/config/wagmi";
import { ROUTER_ADDRESSES, ROUTER_ABI } from "@/constants/contracts";
import { usePublicClient } from "wagmi";

// ERC20 ABI for approve function
const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export function SwapCard() {
  const { wallet, connectWallet } = useWallet();
  const { toast } = useToast();
  const publicClient = usePublicClient();

  const [tokenIn, setTokenIn] = useState<Token | null>(null);
  const [tokenOut, setTokenOut] = useState<Token | null>(null);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [estimatedAmount, setEstimatedAmount] = useState<bigint | undefined>();

  const tokenInBalance = useTokenBalance(tokenIn);
  const tokenOutBalance = useTokenBalance(tokenOut);
  const tokenInAllowance = useTokenAllowance(
    tokenIn,
    wallet.address,
    wallet.chainId
  );

  // Get quote from contract using viem
  useEffect(() => {
    const getEstimate = async () => {
      if (
        !tokenIn ||
        !tokenOut ||
        !amountIn ||
        parseFloat(amountIn) <= 0 ||
        !ROUTER_ADDRESSES[wallet.chainId] ||
        !publicClient
      ) {
        setEstimatedAmount(undefined);
        return;
      }

      try {
        const result = await publicClient.readContract({
          address: ROUTER_ADDRESSES[wallet.chainId] as `0x${string}`,
          abi: ROUTER_ABI,
          functionName: "exchangeEstimate",
          args: [
            tokenIn.address as `0x${string}`,
            tokenOut.address as `0x${string}`,
            parseEther(amountIn),
          ],
        });
        setEstimatedAmount(result as bigint);
      } catch (error) {
        console.error("Error getting estimate:", error);
        setEstimatedAmount(undefined);
      }
    };

    getEstimate();
    // Set up interval for periodic updates
    const interval = setInterval(getEstimate, 10000);
    return () => clearInterval(interval);
  }, [tokenIn, tokenOut, amountIn, wallet.chainId, publicClient]);

  // Update amountOut when estimate changes
  useEffect(() => {
    if (estimatedAmount !== undefined) {
      // Convert from wei to token units
      const formattedAmount =
        Number(estimatedAmount) / Math.pow(10, tokenOut?.decimals || 18);
      setAmountOut(formattedAmount.toFixed(6));
    } else {
      setAmountOut("");
    }
  }, [estimatedAmount, tokenOut?.decimals]);

  const { writeContractAsync } = useXWriteContract({
    onSuccess: useCallback(() => {
      toast({
        title: "Swap successful",
        description: `Swapped ${amountIn} ${tokenIn.symbol} for ${amountOut} ${tokenOut.symbol}`,
      });
      // Reset form
      setAmountIn("");
      setAmountOut("");
    }, [amountIn, amountOut, toast, tokenIn, tokenOut]),
    onError: useCallback(
      (error) => {
        toast({
          title: "Swap failed",
          description:
            error.message || "Failed to execute swap. Please try again.",
          variant: "destructive",
        });
      },
      [toast]
    ),
  });

  // Get network tokens
  const getNetworkTokens = () => {
    if (!wallet.chainId || !NETWORKS[wallet.chainId]) {
      return [];
    }
    return NETWORKS[wallet.chainId].tokens;
  };

  // Initialize with default tokens when network changes
  useEffect(() => {
    const tokens = getNetworkTokens();
    if (
      tokens.length > 0 &&
      (!tokenIn || !tokens.some((t) => t.address === tokenIn.address))
    ) {
      setTokenIn(tokens[0]);
    }
    if (
      tokens.length > 1 &&
      (!tokenOut || !tokens.some((t) => t.address === tokenOut.address))
    ) {
      setTokenOut(tokens[1]);
    }
  }, [wallet.chainId, tokenIn, tokenOut]);

  const handleSwapTokens = () => {
    const tempToken = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(tempToken);
    setAmountIn(amountOut);
    setAmountOut(amountIn);
  };

  const handleSwap = async () => {
    if (!wallet.isConnected) {
      connectWallet();
      return;
    }

    if (!tokenIn || !tokenOut || !amountIn || parseFloat(amountIn) <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid amount and select tokens",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const routerAddress = ROUTER_ADDRESSES[wallet.chainId];
      if (!routerAddress) {
        throw new Error("Router contract not found for this network");
      }

      // Calculate minimum amount out with 0.5% slippage
      const minAmountOut = parseFloat(amountOut) * 0.995;
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

      // Prepare parameters for xexchange
      const baseParams = {
        address: routerAddress as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: "xexchange" as const,
        args: [
          [tokenIn.address, tokenOut.address] as readonly `0x${string}`[],
          parseEther(amountIn),
          parseEther(minAmountOut.toString()),
          parseEther(amountIn), // Using amountIn as limits for now
          BigInt(deadline),
        ] as const,
        chain: wallet.chainId === 71 ? config.chains[0] : base,
        account: wallet.address as `0x${string}`,
      };

      // Log parameters with BigInt values converted to strings

      console.log(
        "baseParams",
        JSON.stringify({
          args: baseParams.args.map((arg) =>
            typeof arg === "bigint"
              ? arg.toString()
              : Array.isArray(arg)
              ? arg.map((item) => item.toString())
              : arg
          ),
        })
      );

      await writeContractAsync(baseParams);
    } catch (error) {
      console.error("Swap error:", error);
      toast({
        title: "Swap failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to execute swap. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!wallet.isConnected || !tokenIn || !amountIn) {
      return;
    }

    setApproving(true);

    try {
      const routerAddress = ROUTER_ADDRESSES[wallet.chainId];
      if (!routerAddress) {
        throw new Error("Router contract not found for this network");
      }

      const approveParams = {
        address: tokenIn.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve" as const,
        args: [routerAddress as `0x${string}`, parseEther(amountIn)] as const,
        chain: wallet.chainId === 71 ? config.chains[0] : base,
        account: wallet.address as `0x${string}`,
      };

      await writeContractAsync(approveParams);

      toast({
        title: "Approval successful",
        description: `Approved ${amountIn} ${tokenIn.symbol} for swapping`,
      });
    } catch (error) {
      console.error("Approve error:", error);
      toast({
        title: "Approval failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to approve token. Please try again.",
        variant: "destructive",
      });
    } finally {
      setApproving(false);
    }
  };

  const needsApproval =
    tokenIn &&
    tokenIn.address !== "0x0000000000000000000000000000000000000000" &&
    tokenInAllowance !== undefined &&
    parseFloat(amountIn) > 0 &&
    tokenInAllowance < parseEther(amountIn);

  const isSwapDisabled =
    !wallet.isConnected || !amountIn || !tokenIn || !tokenOut || needsApproval;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Swap</h2>
          </div>

          <TokenAmountInput
            label="You pay"
            amount={amountIn}
            setAmount={setAmountIn}
            token={tokenIn}
            setToken={setTokenIn}
            otherToken={tokenOut}
            balance={tokenInBalance}
            availableTokens={getNetworkTokens()}
          />

          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10 bg-muted hover:bg-muted/80"
              onClick={handleSwapTokens}
            >
              <ArrowDown className="h-5 w-5" />
            </Button>
          </div>

          <TokenAmountInput
            label="You receive"
            amount={amountOut}
            setAmount={setAmountOut}
            token={tokenOut}
            setToken={setTokenOut}
            otherToken={tokenIn}
            readOnly={true}
            balance={tokenOutBalance}
            availableTokens={getNetworkTokens()}
          />

          <div className="text-sm text-muted-foreground">
            {tokenIn && tokenOut && amountIn && amountOut && (
              <div className="flex justify-between">
                <span>Rate</span>
                <span>
                  1 {tokenIn.symbol} ≈{" "}
                  {(parseFloat(amountOut) / parseFloat(amountIn)).toFixed(6)}{" "}
                  {tokenOut.symbol}
                </span>
              </div>
            )}
          </div>

          {needsApproval ? (
            <Button
              className="w-full rounded-xl h-14 text-base font-semibold"
              onClick={handleApprove}
              loading={approving}
            >
              Approve {tokenIn.symbol}
            </Button>
          ) : (
            <Button
              className="w-full rounded-xl h-14 text-base font-semibold"
              disabled={isSwapDisabled}
              onClick={handleSwap}
              loading={loading}
            >
              {!wallet.isConnected
                ? "Connect Wallet"
                : !amountIn
                ? "Enter an Amount"
                : "Swap"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
