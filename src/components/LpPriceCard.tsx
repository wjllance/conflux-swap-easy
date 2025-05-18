import { Card, CardContent } from "@/components/ui/card";
import { CONFLUX_TOKENS } from "@/constants/tokens";
import { useLpInfo } from "@/contexts/LpInfoContext";

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
  lastPrice?: string;
  priceChange?: number;
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
  const { lpInfos, loading } = useLpInfo();

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
                const priceChange = info?.priceChange || 0;
                const priceChangeColor =
                  priceChange > 0
                    ? "text-green-500"
                    : priceChange < 0
                    ? "text-red-500"
                    : "text-gray-500";
                const priceChangePrefix = priceChange > 0 ? "+" : "";

                return (
                  <div
                    key={address}
                    className="p-4 rounded-lg bg-secondary/50 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        LP: {address.slice(0, 6)}...{address.slice(-4)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {info?.price
                            ? `${parseFloat(info.price).toFixed(
                                4
                              )} ${token1Symbol}/${token0Symbol}`
                            : "N/A"}
                        </span>
                        {info?.priceChange !== undefined &&
                          priceChange !== 0 && (
                            <span className={`text-sm ${priceChangeColor}`}>
                              {priceChangePrefix}
                              {priceChange.toFixed(4)}
                            </span>
                          )}
                      </div>
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
