
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TokenAmountInput } from "@/components/TokenAmountInput";
import { useToast } from "@/components/ui/use-toast";
import { CONFLUX_TOKENS, Token } from "@/constants/tokens";
import { useWallet } from "@/hooks/useWallet";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";

export function LiquidityCard() {
  const { wallet, connectWallet } = useWallet();
  const { toast } = useToast();
  
  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize with default tokens
  useEffect(() => {
    if (CONFLUX_TOKENS.length > 0 && !tokenA) {
      setTokenA(CONFLUX_TOKENS[0]);
    }
    if (CONFLUX_TOKENS.length > 1 && !tokenB) {
      setTokenB(CONFLUX_TOKENS[1]);
    }
  }, [tokenA, tokenB]);

  // Simulate getting a quote for token B based on token A amount
  useEffect(() => {
    if (amountA && tokenA && tokenB) {
      // Simulate price calculation
      const mockRate = tokenA.symbol === "CFX" ? 25.5 : 0.039;
      const calculatedAmount = parseFloat(amountA) * mockRate;
      setAmountB(calculatedAmount.toFixed(6));
    }
  }, [amountA, tokenA, tokenB]);

  const handleAddLiquidity = async () => {
    if (!wallet.isConnected) {
      connectWallet();
      return;
    }
    
    if (!tokenA || !tokenB || !amountA || !amountB || 
        parseFloat(amountA) <= 0 || parseFloat(amountB) <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter valid amounts for both tokens",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Liquidity added",
        description: `Added ${amountA} ${tokenA.symbol} and ${amountB} ${tokenB.symbol} to the pool`,
      });
      
      // Reset form
      setAmountA("");
      setAmountB("");
    } catch (error) {
      console.error("Add liquidity error:", error);
      toast({
        title: "Transaction failed",
        description: "Failed to add liquidity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isAddDisabled = !wallet.isConnected || !amountA || !amountB || !tokenA || !tokenB;

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
            balance="10.0" // Replace with actual balance
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
            balance="250.0" // Replace with actual balance
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
                    1 {tokenA.symbol} = {(parseFloat(amountB) / parseFloat(amountA)).toFixed(6)} {tokenB.symbol}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <Button
            className="w-full rounded-xl h-14 text-base font-semibold"
            disabled={isAddDisabled}
            onClick={handleAddLiquidity}
            loading={loading}
          >
            {!wallet.isConnected
              ? "Connect Wallet"
              : !amountA || !amountB
              ? "Enter Amounts"
              : "Add Liquidity"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
