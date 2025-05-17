import { Card, CardContent } from "@/components/ui/card";
import { usePublicClient } from "wagmi";
import { useEffect, useState } from "react";
import { ROUTER_ADDRESSES, ROUTER_ABI } from "@/constants/contracts";
import { useWallet } from "@/hooks/useWallet";
import { formatEther } from "viem";
import { CONFLUX_TOKENS } from "@/constants/tokens";

const LP_ADDRESSES = [
  "0xc9931ef4a3e615c68f2cc500421933c42e289bf2",
  "0xb39998b456287e26af80c629f804c4e32f2df19d",
  "0x808678cb912d3f8719ea39a2db79b813e374ab0c",
  "0xf850b3b01e0effbc08113e19a108894e7bd416e8",
];

interface LpInfo {
  price: string;
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
}

const getTokenName = (address: string): string => {
  const token = CONFLUX_TOKENS.find(
    (t) => t.address.toLowerCase() === address.toLowerCase()
  );
  return token ? token.name : `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const getTokenSymbol = (address: string): string => {
  const token = CONFLUX_TOKENS.find(
    (t) => t.address.toLowerCase() === address.toLowerCase()
  );
  return token ? token.symbol : "???";
};

export function LpPriceCard() {
  const { wallet } = useWallet();
  const publicClient = usePublicClient();
  const [lpInfos, setLpInfos] = useState<{ [key: string]: LpInfo }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLpInfo = async () => {
      if (!wallet.chainId || !ROUTER_ADDRESSES[wallet.chainId]) return;

      const routerAddress = ROUTER_ADDRESSES[wallet.chainId];
      const newLpInfos: { [key: string]: LpInfo } = {};

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

          newLpInfos[lpAddress] = {
            price: formatEther(price as bigint),
            token0: pairTokens[0],
            token1: pairTokens[1],
            reserve0: formatEther(reserves[0][0]),
            reserve1: formatEther(reserves[0][1]),
          };
        }
        setLpInfos(newLpInfos);
      } catch (error) {
        console.error("Error fetching LP info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLpInfo();
    const interval = setInterval(fetchLpInfo, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [wallet.chainId, publicClient]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">LP Token Info</h2>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="space-y-4">
              {LP_ADDRESSES.map((address) => {
                const info = lpInfos[address];
                const token0Symbol = getTokenSymbol(info?.token0 || "");
                const token1Symbol = getTokenSymbol(info?.token1 || "");
                return (
                  <div
                    key={address}
                    className="p-4 rounded-lg bg-secondary/50 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        LP: {address.slice(0, 6)}...{address.slice(-4)}
                      </span>
                      <span className="font-semibold">
                        {info?.price
                          ? `${parseFloat(info.price).toFixed(
                              4
                            )} ${token1Symbol}/${token0Symbol}`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Token 0:</span>
                        <span>{getTokenName(info?.token0 || "")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Token 1:</span>
                        <span>{getTokenName(info?.token1 || "")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Reserve 0:
                        </span>
                        <span>{info?.reserve0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Reserve 1:
                        </span>
                        <span>{info?.reserve1}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
