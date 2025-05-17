export interface Token {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  logoURI: string;
}

export const CONFLUX_TOKENS: Token[] = [
  {
    name: "Conflux",
    symbol: "CFX",
    address: "0x0000000000000000000000000000000000000000", // Native token
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/conflux-cfx-logo.png",
  },
  {
    name: "Wrapped Conflux",
    symbol: "WCFX",
    address: "0x14b2D3bC65e74DAE1030EAFd8ac30c533c976A9b", // Example address
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/conflux-cfx-logo.png",
  },
  {
    name: "Flux Token",
    symbol: "FLUX",
    address: "0x0000000000000000000000000000000000000000", // Example address
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/zcash-zec-logo.png",
  },
  {
    name: "cUSDT",
    symbol: "cUSDT",
    address: "0xfe97E85d13ABD9c1c33384E796F10B73905637cE", // Example address
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/tether-usdt-logo.png",
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
export const CONFLUX_CHAIN_ID = 1030;
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
    rpcUrls: ["https://evm.confluxrpc.com"],
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
