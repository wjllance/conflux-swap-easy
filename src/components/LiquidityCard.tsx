import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TokenAmountInput } from "@/components/TokenAmountInput";
import { useToast } from "@/components/ui/use-toast";
import { Token, NETWORKS } from "@/constants/tokens";
import { useWallet } from "@/hooks/useWallet";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import useXWriteContract from "@/components/useXWriteContract";
import { parseEther } from "viem";
import { base } from "wagmi/chains";
import { config } from "@/config/wagmi";
import { ROUTER_ADDRESSES, ROUTER_ABI } from "@/constants/contracts";
import { usePublicClient } from "wagmi";
import { useTokenAllowance } from "@/hooks/useTokenAllowance";
import { useTokenBalance } from "@/hooks/useTokenBalance";

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

export function LiquidityCard() {
  const { wallet, connectWallet } = useWallet();
  const { toast } = useToast();
  const publicClient = usePublicClient();

  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);

  // Get token balances
  const tokenABalance = useTokenBalance(tokenA);
  const tokenBBalance = useTokenBalance(tokenB);

  // Check token allowances
  const tokenAAllowance = useTokenAllowance(
    tokenA,
    wallet.address,
    wallet.chainId
  );
  const tokenBAllowance = useTokenAllowance(
    tokenB,
    wallet.address,
    wallet.chainId
  );

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
      (!tokenA || !tokens.some((t) => t.address === tokenA.address))
    ) {
      setTokenA(tokens[0]);
    }
    if (
      tokens.length > 1 &&
      (!tokenB || !tokens.some((t) => t.address === tokenB.address))
    ) {
      setTokenB(tokens[1]);
    }
  }, [wallet.chainId, tokenA, tokenB]);

  // Simulate getting a quote for token B based on token A amount
  useEffect(() => {
    if (amountA && tokenA && tokenB) {
      // Simulate price calculation
      let mockRate;
      if (wallet.chainId === 71) {
        // Conflux
        mockRate = 1;
      } else {
        // Base or other
        mockRate =
          tokenA.symbol === "ETH"
            ? 2000
            : tokenA.symbol === "USDC"
            ? 1
            : 0.0005;
      }
      const calculatedAmount = parseFloat(amountA) * mockRate;
      setAmountB(calculatedAmount.toFixed(6));
    }
  }, [amountA, tokenA, tokenB, wallet.chainId]);

  const { writeContractAsync } = useXWriteContract({
    onSubmitted: (hash) => {
      toast({
        title: "Transaction submitted",
        description: `Transaction hash: ${hash}`,
      });
    },
    onSuccess: () => {
      toast({
        title: "Liquidity added",
        description: `Added ${amountA} ${tokenA.symbol} and ${amountB} ${tokenB.symbol} to the pool`,
      });
      // Reset form
      setAmountA("");
      setAmountB("");
    },
    onError: (error) => {
      toast({
        title: "Transaction failed",
        description:
          error.message || "Failed to add liquidity. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = async (token: Token, amount: string) => {
    if (!wallet.isConnected || !token || !amount) {
      return;
    }

    setApproving(true);

    try {
      const routerAddress = ROUTER_ADDRESSES[wallet.chainId];
      if (!routerAddress) {
        throw new Error("Router contract not found for this network");
      }

      const approveParams = {
        address: token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve" as const,
        args: [routerAddress as `0x${string}`, parseEther(amount)] as const,
        chain: wallet.chainId === 71 ? config.chains[0] : base,
        account: wallet.address as `0x${string}`,
      };

      await writeContractAsync(approveParams);

      toast({
        title: "Approval successful",
        description: `Approved ${amount} ${token.symbol} for adding liquidity`,
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

  const handleAddLiquidity = async () => {
    if (!wallet.isConnected) {
      connectWallet();
      return;
    }

    if (
      !tokenA ||
      !tokenB ||
      !amountA ||
      !amountB ||
      parseFloat(amountA) <= 0 ||
      parseFloat(amountB) <= 0
    ) {
      toast({
        title: "Invalid input",
        description: "Please enter valid amounts for both tokens",
        variant: "destructive",
      });
      return;
    }

    // Check if approvals are needed
    const needsTokenAApproval =
      tokenA.address !== "0x0000000000000000000000000000000000000000" &&
      tokenAAllowance !== undefined &&
      parseFloat(amountA) > 0 &&
      tokenAAllowance < parseEther(amountA);

    const needsTokenBApproval =
      tokenB.address !== "0x0000000000000000000000000000000000000000" &&
      tokenBAllowance !== undefined &&
      parseFloat(amountB) > 0 &&
      tokenBAllowance < parseEther(amountB);

    if (needsTokenAApproval) {
      await handleApprove(tokenA, amountA);
      return;
    }

    if (needsTokenBApproval) {
      await handleApprove(tokenB, amountB);
      return;
    }

    setLoading(true);

    try {
      const routerAddress = ROUTER_ADDRESSES[wallet.chainId];
      if (!routerAddress) {
        throw new Error("Router contract not found for this network");
      }

      // Get LP pair address
      const lpPair = await publicClient.readContract({
        address: routerAddress as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: "getPair",
        args: [
          tokenA.address as `0x${string}`,
          tokenB.address as `0x${string}`,
        ],
      });

      if (!lpPair || lpPair === "0x0000000000000000000000000000000000000000") {
        throw new Error("Liquidity pool does not exist for this token pair");
      }

      // Add liquidity
      const addLiquidityParams = {
        address: routerAddress as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: "xLpSubscribe" as const,
        args: [
          lpPair as `0x${string}`,
          [parseEther(amountA), parseEther(amountB)],
        ] as const,
        chain: wallet.chainId === 71 ? config.chains[0] : base,
        account: wallet.address as `0x${string}`,
      };

      await writeContractAsync(addLiquidityParams);
    } catch (error) {
      console.error("Add liquidity error:", error);
      toast({
        title: "Transaction failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to add liquidity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isAddDisabled =
    !wallet.isConnected || !amountA || !amountB || !tokenA || !tokenB;

  // Check if approvals are needed
  const needsTokenAApproval =
    tokenA &&
    tokenA.address !== "0x0000000000000000000000000000000000000000" &&
    tokenAAllowance !== undefined &&
    parseFloat(amountA) > 0 &&
    tokenAAllowance < parseEther(amountA);

  const needsTokenBApproval =
    tokenB &&
    tokenB.address !== "0x0000000000000000000000000000000000000000" &&
    tokenBAllowance !== undefined &&
    parseFloat(amountB) > 0 &&
    tokenBAllowance < parseEther(amountB);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Add Liquidity</h2>
          </div>

          <TokenAmountInput
            label="Token A"
            amount={amountA}
            setAmount={setAmountA}
            token={tokenA}
            setToken={setTokenA}
            otherToken={tokenB}
            balance={tokenABalance}
            availableTokens={getNetworkTokens()}
          />

          <div className="flex justify-center">
            <div className="rounded-full h-10 w-10 bg-muted flex items-center justify-center">
              <Plus className="h-5 w-5" />
            </div>
          </div>

          <TokenAmountInput
            label="Token B"
            amount={amountB}
            setAmount={setAmountB}
            token={tokenB}
            setToken={setTokenB}
            otherToken={tokenA}
            balance={tokenBBalance}
            availableTokens={getNetworkTokens()}
          />

          <div className="p-4 rounded-lg bg-secondary/50 mt-4">
            <h3 className="font-semibold mb-2">LP Token Info</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pool Share</span>
                <span>~0.01%</span>
              </div>
              {tokenA && tokenB && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate</span>
                  <span>
                    1 {tokenA.symbol} ={" "}
                    {(parseFloat(amountB) / parseFloat(amountA)).toFixed(6)}{" "}
                    {tokenB.symbol}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Button
            className="w-full rounded-xl h-14 text-base font-semibold"
            disabled={isAddDisabled}
            onClick={handleAddLiquidity}
            loading={loading || approving}
          >
            {!wallet.isConnected
              ? "Connect Wallet"
              : needsTokenAApproval
              ? `Approve ${tokenA.symbol}`
              : needsTokenBApproval
              ? `Approve ${tokenB.symbol}`
              : !amountA || !amountB
              ? "Enter Amounts"
              : "Add Liquidity"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
