
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { CONFLUX_CHAIN_ID } from '@/constants/tokens';

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
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest']
        });
        
        setWallet({
          isConnected: true,
          address: accounts[0],
          chainId: parseInt(chainId, 16),
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

  const connectWallet = useCallback(async () => {
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
      const parsedChainId = parseInt(chainId, 16);
      
      if (parsedChainId !== CONFLUX_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${CONFLUX_CHAIN_ID.toString(16)}` }],
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${CONFLUX_CHAIN_ID.toString(16)}`,
                  chainName: 'Conflux eSpace',
                  nativeCurrency: {
                    name: 'Conflux',
                    symbol: 'CFX',
                    decimals: 18,
                  },
                  rpcUrls: ['https://evm.confluxrpc.com'],
                  blockExplorerUrls: ['https://evm.confluxscan.io'],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }
      
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
      });
      
      setWallet({
        isConnected: true,
        address: accounts[0],
        chainId: CONFLUX_CHAIN_ID,
        balance: parseInt(balance, 16).toString()
      });
      
      toast({
        title: "Wallet connected",
        description: "Your wallet has been connected successfully",
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
    disconnectWallet
  };
}
