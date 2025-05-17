import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { useToast } from "@/components/ui/use-toast";
import { NETWORKS } from "@/constants/tokens";

export function useWallet() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { toast } = useToast();

  const connectWallet = async (targetChainId?: number) => {
    try {
      if (!connectors[0]) {
        toast({
          title: "Wallet not found",
          description: "Please install MetaMask to use this application",
          variant: "destructive",
        });
        return;
      }

      await connect({ connector: connectors[0] });

      if (targetChainId && chainId !== targetChainId) {
        await switchChain({ chainId: targetChainId });
      }

      toast({
        title: "Wallet connected",
        description: `Connected to ${
          NETWORKS[chainId || 0]?.name || "network"
        }`,
      });
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const disconnectWallet = () => {
    disconnect();
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  return {
    wallet: {
      isConnected,
      address,
      chainId,
    },
    connectWallet,
    disconnectWallet,
    switchChain,
  };
}
