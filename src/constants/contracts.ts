import { CONFLUX_CHAIN_ID, BASE_CHAIN_ID } from "./tokens";

// Router contract addresses
export const ROUTER_ADDRESSES = {
  [CONFLUX_CHAIN_ID]: "0x14b2D3bC65e74DAE1030EAFd8ac30c533c976A9b", // Conflux router address
  [BASE_CHAIN_ID]: "0x327Df1E6de05895d2ab08513aaDD9313Fe505D86", // Base router address
} as const;

// Router contract ABI
export const ROUTER_ABI = [
  {
    name: "xexchange",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokens", type: "address[]" },
      { name: "amountIn", type: "uint256" },
      { name: "amountOut", type: "uint256" },
      { name: "limits", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
