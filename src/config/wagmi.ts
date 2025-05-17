import { http, createConfig } from "wagmi";
import { mainnet, base } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { NETWORKS } from "@/constants/tokens";

// Create custom chain for Conflux
const conflux = {
  id: 1030,
  name: "Conflux eSpace",
  network: "conflux",
  nativeCurrency: {
    name: "Conflux",
    symbol: "CFX",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://evm.confluxrpc.com"] },
    public: { http: ["https://evm.confluxrpc.com"] },
  },
  blockExplorers: {
    default: { name: "ConfluxScan", url: "https://evm.confluxscan.io" },
  },
} as const;

export const config = createConfig({
  chains: [conflux, base],
  connectors: [injected()],
  transports: {
    [conflux.id]: http(),
    [base.id]: http(),
  },
});
