import { CONFLUX_CHAIN_ID, BASE_CHAIN_ID } from "./tokens";

// Router contract addresses
export const ROUTER_ADDRESSES = {
  [CONFLUX_CHAIN_ID]: "0xd2a4a0b69B4ecB1926750BA6D170B907f2dcbEb8", // Conflux router address
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
  {
    name: "exchangeEstimate",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "tokenInput", type: "address" },
      { name: "tokenOutput", type: "address" },
      { name: "amountIn", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
