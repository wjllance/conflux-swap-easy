import { useWallet } from "@/hooks/useWallet";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { usePublicClient } from "wagmi";
import { ROUTER_ADDRESSES, ROUTER_ABI } from "@/constants/contracts";
import { formatEther } from "viem";

interface LpInfo {
  price: string;
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
  lastPrice?: string;
  priceChange?: number;
}

interface LpInfoContextType {
  lpInfos: { [key: string]: LpInfo };
  loading: boolean;
  setLpInfos: (infos: { [key: string]: LpInfo }) => void;
}

const LpInfoContext = createContext<LpInfoContextType | undefined>(undefined);

const LP_ADDRESSES = [
  "0xc9931ef4a3e615c68f2cc500421933c42e289bf2",
  "0xb39998b456287e26af80c629f804c4e32f2df19d",
  "0x808678cb912d3f8719ea39a2db79b813e374ab0c",
  "0xf850b3b01e0effbc08113e19a108894e7bd416e8",
];

export function LpInfoProvider({ children }: { children: ReactNode }) {
  const [lpInfos, setLpInfos] = useState<{ [key: string]: LpInfo }>({});

  const { wallet } = useWallet();
  const publicClient = usePublicClient();
  const [loading, setLoading] = useState(true);

  const updateLpInfo = useCallback((address: string, info: LpInfo) => {
    setLpInfos((prev) => ({
      ...prev,
      [address]: info,
    }));
  }, []);

  useEffect(() => {
    const fetchLpInfo = async () => {
      if (!wallet.chainId || !ROUTER_ADDRESSES[wallet.chainId]) return;

      const routerAddress = ROUTER_ADDRESSES[wallet.chainId];

      try {
        for (const lpAddress of LP_ADDRESSES) {
          // Get LP price
          const price = await publicClient.readContract({
            address: routerAddress as `0x${string}`,
            abi: ROUTER_ABI,
            functionName: "getLpPrice",
            args: [lpAddress as `0x${string}`],
          });

          // Get LP pair tokens
          const pairTokens = (await publicClient.readContract({
            address: routerAddress as `0x${string}`,
            abi: ROUTER_ABI,
            functionName: "getLpPair",
            args: [lpAddress as `0x${string}`],
          })) as [`0x${string}`, `0x${string}`];

          // Get LP reserves
          const reserves = (await publicClient.readContract({
            address: routerAddress as `0x${string}`,
            abi: ROUTER_ABI,
            functionName: "getLpReserve",
            args: [lpAddress as `0x${string}`],
          })) as [[bigint, bigint], [bigint, bigint], bigint];

          const currentPrice = formatEther(price as bigint);
          const lastPrice = lpInfos[lpAddress]?.price;
          const priceChange = lastPrice
            ? calculatePriceChange(currentPrice, lastPrice)
            : 0;

          if (!lastPrice || currentPrice !== lastPrice) {
            updateLpInfo(lpAddress, {
              price: currentPrice,
              token0: pairTokens[0],
              token1: pairTokens[1],
              reserve0: formatEther(reserves[0][0]),
              reserve1: formatEther(reserves[0][1]),
              lastPrice: lastPrice,
              priceChange,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching LP info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLpInfo();
    const interval = setInterval(fetchLpInfo, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [wallet.chainId, publicClient, lpInfos, updateLpInfo]);

  return (
    <LpInfoContext.Provider value={{ lpInfos, loading, setLpInfos }}>
      {children}
    </LpInfoContext.Provider>
  );
}

export function useLpInfo() {
  const context = useContext(LpInfoContext);
  if (context === undefined) {
    throw new Error("useLpInfo must be used within a LpInfoProvider");
  }
  return context;
}

const calculatePriceChange = (
  currentPrice: string,
  lastPrice: string
): number => {
  const current = parseFloat(currentPrice);
  const last = parseFloat(lastPrice);
  return current - last;
};
