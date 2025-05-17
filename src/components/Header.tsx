import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { formatAddress } from "@/utils/formatters";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NETWORKS, BASE_CHAIN_ID, CONFLUX_CHAIN_ID } from "@/constants/tokens";
import { ChevronDown } from "lucide-react";

export function Header() {
  const { wallet, connectWallet, disconnectWallet, switchChain } = useWallet();

  const handleNetworkSwitch = async (chainId: number) => {
    if (wallet.isConnected) {
      console.log("switching chain", chainId);
      await switchChain({ chainId });
    } else {
      await connectWallet(chainId);
    }
  };

  const getCurrentNetworkName = () => {
    if (!wallet.chainId || !NETWORKS[wallet.chainId]) {
      return "Select Network";
    }
    return NETWORKS[wallet.chainId].name;
  };

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                {getCurrentNetworkName()}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => handleNetworkSwitch(CONFLUX_CHAIN_ID)}
              >
                Conflux eSpace
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleNetworkSwitch(BASE_CHAIN_ID)}
              >
                Base
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {wallet.isConnected ? (
            <Button
              variant="outline"
              className="rounded-full"
              onClick={disconnectWallet}
            >
              {formatAddress(wallet.address || "")}
            </Button>
          ) : (
            <Button className="rounded-full" onClick={() => connectWallet()}>
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
