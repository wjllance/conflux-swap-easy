import { useState, useEffect } from "react";
import { useAccount, useBalance, useReadContract } from "wagmi";
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
  const [balance, setBalance] = useState<string>("0");

  // For native token balance
  const { data: nativeBalance } = useBalance({
    address,
    query: {
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // For ERC20 token balance
  const { data: erc20Balance } = useReadContract({
    address: token?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: {
      enabled:
        !!token &&
        !!address &&
        token.address !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // For token decimals
  const { data: decimals } = useReadContract({
    address: token?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "decimals",
    query: {
      enabled:
        !!token &&
        token.address !== "0x0000000000000000000000000000000000000000",
    },
  });

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
        if (erc20Balance && decimals) {
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
