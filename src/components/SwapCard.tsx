import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TokenAmountInput } from "@/components/TokenAmountInput";
import { useToast } from "@/components/ui/use-toast";
import { CONFLUX_TOKENS, Token } from "@/constants/tokens";
import { useWallet } from "@/hooks/useWallet";
import { ArrowDown } from "lucide-react";
import { useState, useEffect } from "react";

export function SwapCard() {
  const { wallet, connectWallet } = useWallet();
  const { toast } = useToast();
  
  const [tokenIn, setTokenIn] = useState<Token | null>(null);
  const [tokenOut, setTokenOut] = useState<Token | null>(null);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize with default tokens
  useEffect(() => {
    if (CONFLUX_TOKENS.length > 0 && !tokenIn) {
      setTokenIn(CONFLUX_TOKENS[0]);
    }
    if (CONFLUX_TOKENS.length > 1 && !tokenOut) {
      setTokenOut(CONFLUX_TOKENS[1]);
    }
  }, [tokenIn, tokenOut]);

  // Simulate getting a quote
  useEffect(() => {
    if (amountIn && tokenIn && tokenOut) {
      // Simulate price calculation
      // In a real app, this would call a price oracle or router contract
      const mockRate = tokenIn.symbol === "CFX" ? 25.5 : 0.039;
      const calculatedAmount = parseFloat(amountIn) * mockRate;
      setAmountOut(calculatedAmount.toFixed(6));
    } else {
      setAmountOut("");
    }
  }, [amountIn, tokenIn, tokenOut]);

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
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Swap successful",
        description: `Swapped ${amountIn} ${tokenIn.symbol} for ${amountOut} ${tokenOut.symbol}`,
      });
      
      // Reset form
      setAmountIn("");
      setAmountOut("");
    } catch (error) {
      console.error("Swap error:", error);
      toast({
        title: "Swap failed",
        description: "Failed to execute swap. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isSwapDisabled = !wallet.isConnected || !amountIn || !tokenIn || !tokenOut;

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
            balance="10.0" // Replace with actual user balance
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
          />
          
          <div className="text-sm text-muted-foreground">
            {tokenIn && tokenOut && amountIn && amountOut && (
              <div className="flex justify-between">
                <span>Rate</span>
                <span>
                  1 {tokenIn.symbol} ≈ {(parseFloat(amountOut) / parseFloat(amountIn)).toFixed(6)} {tokenOut.symbol}
                </span>
              </div>
            )}
          </div>
          
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
        </div>
      </CardContent>
    </Card>
  );
}
