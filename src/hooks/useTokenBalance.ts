import { useState, useEffect } from "react";
import { useAccount, useBalance, usePublicClient } from "wagmi";
import { Token } from "@/constants/tokens";

// ERC20 ABI for balanceOf function
const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

export function useTokenBalance(token: Token | null) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [balance, setBalance] = useState<string>("0");
  const [erc20Balance, setErc20Balance] = useState<bigint | undefined>();
  const [decimals, setDecimals] = useState<number | undefined>();

  // For native token balance
  const { data: nativeBalance } = useBalance({
    address,
    query: {
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // For ERC20 token balance and decimals
  useEffect(() => {
    const getTokenData = async () => {
      if (
        !token ||
        !address ||
        !publicClient ||
        token.address === "0x0000000000000000000000000000000000000000"
      ) {
        setErc20Balance(undefined);
        setDecimals(undefined);
        return;
      }

      try {
        // Get balance
        const balanceResult = await publicClient.readContract({
          address: token.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address as `0x${string}`],
        });
        setErc20Balance(balanceResult as bigint);

        // Get decimals
        const decimalsResult = await publicClient.readContract({
          address: token.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "decimals",
        });
        setDecimals(Number(decimalsResult));
      } catch (error) {
        console.error("Error getting token data:", error);
        setErc20Balance(undefined);
        setDecimals(undefined);
      }
    };

    getTokenData();
    // Set up interval for periodic updates
    const interval = setInterval(getTokenData, 10000);
    return () => clearInterval(interval);
  }, [token, address, publicClient]);

  useEffect(() => {
    if (!token || !isConnected || !address) {
      setBalance("0");
      return;
    }

    try {
      if (token.address === "0x0000000000000000000000000000000000000000") {
        // Native token (ETH/CFX)
        if (nativeBalance) {
          setBalance(nativeBalance.formatted);
        }
      } else {
        // ERC20 token
        if (erc20Balance !== undefined && decimals !== undefined) {
          const formattedBalance =
            Number(erc20Balance) / Math.pow(10, decimals);
          setBalance(formattedBalance.toString());
        }
      }
    } catch (error) {
      console.error("Error formatting token balance:", error);
      setBalance("0");
    }
  }, [token, isConnected, address, nativeBalance, erc20Balance, decimals]);

  return balance;
}
