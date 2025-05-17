
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
    logoURI: "https://cryptologos.cc/logos/conflux-cfx-logo.png"
  },
  {
    name: "Wrapped Conflux",
    symbol: "WCFX",
    address: "0x14b2D3bC65e74DAE1030EAFd8ac30c533c976A9b", // Example address
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/conflux-cfx-logo.png"
  },
  {
    name: "Flux Token",
    symbol: "FLUX",
    address: "0x0000000000000000000000000000000000000000", // Example address
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/zcash-zec-logo.png"
  },
  {
    name: "cUSDT",
    symbol: "cUSDT",
    address: "0xfe97E85d13ABD9c1c33384E796F10B73905637cE", // Example address
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/tether-usdt-logo.png"
  }
];

export const CONFLUX_CHAIN_ID = 1030;
