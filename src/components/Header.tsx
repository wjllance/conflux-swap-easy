
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { formatAddress } from "@/utils/formatters";
import { Link } from "react-router-dom";

export function Header() {
  const { wallet, connectWallet, disconnectWallet } = useWallet();

  return (
    <header className="w-full py-4 px-4 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-2xl font-bold text-primary">
            ConfluxSwap
          </Link>
          
          <nav className="hidden md:flex space-x-4">
            <Link 
              to="/" 
              className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
            >
              Swap
            </Link>
            <Link 
              to="/liquidity" 
              className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
            >
              Liquidity
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {wallet.isConnected ? (
            <div className="flex items-center space-x-3">
              <span className="hidden md:inline text-sm text-muted-foreground">
                Conflux eSpace
              </span>
              <Button 
                variant="outline" 
                className="rounded-full" 
                onClick={disconnectWallet}
              >
                {formatAddress(wallet.address || '')}
              </Button>
            </div>
          ) : (
            <Button
              className="rounded-full"
              onClick={connectWallet}
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
