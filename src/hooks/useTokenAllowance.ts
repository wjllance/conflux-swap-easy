import { useReadContract } from "wagmi";
import { Token } from "@/constants/tokens";
import { ROUTER_ADDRESSES } from "@/constants/contracts";
import { parseEther } from "viem";

// ERC20 ABI for allowance function
const ERC20_ABI = [
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export function useTokenAllowance(
  token: Token | null,
  walletAddress: string | undefined,
  chainId: number | undefined
) {
  const routerAddress = chainId ? ROUTER_ADDRESSES[chainId] : undefined;

  const { data: allowance } = useReadContract({
    address: token?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [walletAddress as `0x${string}`, routerAddress as `0x${string}`],
    query: {
      enabled:
        !!token &&
        !!walletAddress &&
        !!routerAddress &&
        token.address !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  return allowance;
}
