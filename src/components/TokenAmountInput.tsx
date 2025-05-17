
import { Input } from "@/components/ui/input";
import { TokenSelector } from "@/components/TokenSelector";
import { Token, CONFLUX_TOKENS } from "@/constants/tokens";
import { formatCurrency } from "@/utils/formatters";

interface TokenAmountInputProps {
  label?: string;
  amount: string;
  setAmount: (value: string) => void;
  token: Token | null;
  setToken: (token: Token) => void;
  otherToken?: Token | null;
  balance?: string;
  readOnly?: boolean;
  availableTokens?: Token[];
}

export function TokenAmountInput({
  label,
  amount,
  setAmount,
  token,
  setToken,
  otherToken,
  balance,
  readOnly = false,
  availableTokens = CONFLUX_TOKENS,
}: TokenAmountInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (value === "" || /^[0-9]*[.]?[0-9]*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSetMax = () => {
    if (balance) {
      setAmount(balance);
    }
  };

  return (
    <div className="rounded-xl border p-4 bg-card">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">{label || "Amount"}</span>
        {balance && (
          <div className="text-sm text-muted-foreground">
            Balance: {formatCurrency(balance)}
            {!readOnly && (
              <button
                onClick={handleSetMax}
                className="ml-1 text-xs text-primary hover:text-primary/80"
              >
                MAX
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="flex space-x-2 items-center">
        <div className="flex-1">
          <Input
            type="text"
            value={amount}
            onChange={handleChange}
            className="text-2xl border-none h-12 p-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="0.0"
            readOnly={readOnly}
          />
        </div>
        
        <TokenSelector
          selectedToken={token}
          onSelectToken={setToken}
          otherSelectedToken={otherToken}
          availableTokens={availableTokens}
        />
      </div>
    </div>
  );
}
