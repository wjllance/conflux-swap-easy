
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { NETWORKS } from '@/constants/tokens';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null;
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    balance: null
  });
  const { toast } = useToast();

  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      if (!window.ethereum) {
        toast({
          title: "MetaMask not found",
          description: "Please install MetaMask to use this application",
          variant: "destructive",
        });
        return false;
      }

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length > 0) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const chainIdDecimal = parseInt(chainId, 16);
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest']
        });
        
        setWallet({
          isConnected: true,
          address: accounts[0],
          chainId: chainIdDecimal,
          balance: parseInt(balance, 16).toString()
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      return false;
    }
  }, [toast]);

  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum) return false;

    const network = NETWORKS[targetChainId];
    if (!network) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainIdHex }],
      });
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: network.chainIdHex,
                chainName: network.name,
                nativeCurrency: network.nativeCurrency,
                rpcUrls: network.rpcUrls,
                blockExplorerUrls: network.blockExplorerUrls,
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error("Error adding network:", addError);
          return false;
        }
      } else {
        console.error("Error switching network:", switchError);
        return false;
      }
    }
  };

  const connectWallet = useCallback(async (targetChainId?: number) => {
    try {
      if (!window.ethereum) {
        toast({
          title: "MetaMask not found",
          description: "Please install MetaMask to use this application",
          variant: "destructive",
        });
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainId, 16);
      
      // If a specific chain is requested and we're not on it, switch
      if (targetChainId && currentChainId !== targetChainId) {
        const switched = await switchNetwork(targetChainId);
        if (!switched) {
          toast({
            title: "Network switch failed",
            description: `Could not switch to ${NETWORKS[targetChainId]?.name || 'requested network'}`,
            variant: "destructive",
          });
          return;
        }
      }
      
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
      });
      
      // Get the current chain ID again in case we switched
      const newChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const finalChainId = parseInt(newChainId, 16);
      
      setWallet({
        isConnected: true,
        address: accounts[0],
        chainId: finalChainId,
        balance: parseInt(balance, 16).toString()
      });
      
      toast({
        title: "Wallet connected",
        description: `Connected to ${NETWORKS[finalChainId]?.name || 'network'}`,
      });
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  }, [toast]);

  const disconnectWallet = useCallback(() => {
    setWallet({
      isConnected: false,
      address: null,
      chainId: null,
      balance: null
    });
    
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    });
  }, [toast]);

  useEffect(() => {
    checkIfWalletIsConnected();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        checkIfWalletIsConnected();
      });
      
      window.ethereum.on('chainChanged', () => {
        checkIfWalletIsConnected();
      });
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', checkIfWalletIsConnected);
        window.ethereum.removeListener('chainChanged', checkIfWalletIsConnected);
      }
    };
  }, [checkIfWalletIsConnected]);

  return {
    wallet,
    connectWallet,
    disconnectWallet,
    switchNetwork
  };
}
