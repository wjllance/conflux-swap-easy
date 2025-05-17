export interface Token {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  logoURI: string;
}

export const CONFLUX_TOKENS: Token[] = [
  {
    name: "USDT",
    symbol: "USDT",
    address: "0xAbE57fD58A7DC733F756B9661bA50b7fBBdf9bCC",
    decimals: 18,
    logoURI: "https://scroll-tech.github.io/token-list/data/USDT/logo.svg",
  },
  {
    name: "USDC",
    symbol: "USDC",
    address: "0x37f4aB810a460943534780e1ecca9b2779c31501",
    decimals: 18,
    logoURI: "https://ethereum-optimism.github.io/data/USDC/logo.png",
  },
  {
    name: "Bitcoin",
    symbol: "BTC",
    address: "0x3f2f29Ccf9898bad1A03e4e55299eb314e3effaB",
    decimals: 18,
    logoURI: "https://scroll-tech.github.io/token-list/data/WBTC/logo.svg",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    address: "0x4Ed3fF9d3779Af07Fc7c6592188E8bD29045988d",
    decimals: 18,
    logoURI: "/images/ethereum-eth-logo.png",
  },
];

export const BASE_TOKENS: Token[] = [
  {
    name: "Ethereum",
    symbol: "ETH",
    address: "0x0000000000000000000000000000000000000000", // Native token
    decimals: 18,
    logoURI: "/images/ethereum-eth-logo.png",
  },
  {
    name: "Wrapped Ethereum",
    symbol: "WETH",
    address: "0x4200000000000000000000000000000000000006", // Base WETH
    decimals: 18,
    logoURI: "https://ethereum-optimism.github.io/data/WETH/logo.png",
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base USDC
    decimals: 6,
    logoURI: "https://ethereum-optimism.github.io/data/USDC/logo.png",
  },
  {
    name: "DAI Stablecoin",
    symbol: "DAI",
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", // Base DAI
    decimals: 18,
    logoURI: "https://ethereum-optimism.github.io/data/DAI/logo.svg",
  },
];

// Network constants
export const CONFLUX_CHAIN_ID = 71;
export const BASE_CHAIN_ID = 8453;

export interface NetworkInfo {
  chainId: number;
  chainIdHex: string;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  tokens: Token[];
}

export const NETWORKS: Record<number, NetworkInfo> = {
  [CONFLUX_CHAIN_ID]: {
    chainId: CONFLUX_CHAIN_ID,
    chainIdHex: `0x${CONFLUX_CHAIN_ID.toString(16)}`,
    name: "Conflux eSpace",
    nativeCurrency: {
      name: "Conflux",
      symbol: "CFX",
      decimals: 18,
    },
    // rpcUrls: ["https://evm.confluxrpc.com"],
    rpcUrls: ["https://evmtestnet.confluxrpc.com"],
    blockExplorerUrls: ["https://evm.confluxscan.io"],
    tokens: CONFLUX_TOKENS,
  },
  [BASE_CHAIN_ID]: {
    chainId: BASE_CHAIN_ID,
    chainIdHex: `0x${BASE_CHAIN_ID.toString(16)}`,
    name: "Base",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrls: ["https://basescan.org"],
    tokens: BASE_TOKENS,
  },
};
