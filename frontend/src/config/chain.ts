import { defineChain } from "viem";

/**
 * Arc Testnet Configuration
 * ChainId: 5042002 (as per Circle Modular Wallets)
 */
export const ARC_TESTNET = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        import.meta.env.VITE_ARC_RPC_URL || "https://rpc.testnet.arc.network",
        "https://rpc.quicknode.testnet.arc.network",
        "https://rpc.blockdaemon.testnet.arc.network",
      ],
      webSocket: [
        "wss://rpc.testnet.arc.network",
        "wss://rpc.quicknode.testnet.arc.network",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "ArcScan",
      url: import.meta.env.VITE_ARC_EXPLORER_URL || "https://testnet.arcscan.app",
      apiUrl: "https://testnet.arcscan.app/api",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 0,
    },
  },
  testnet: true,
});

export const CONTRACT_ADDRESSES = {
  GAME: import.meta.env.VITE_GAME_CONTRACT_ADDRESS || "",
  STAKING: import.meta.env.VITE_STAKING_CONTRACT_ADDRESS || "",
  USDC: import.meta.env.VITE_USDC_TOKEN_ADDRESS || "",
} as const;

export const CLIENT_CONFIG = {
  CLIENT_KEY: import.meta.env.VITE_CLIENT_KEY || "",
  CLIENT_URL: import.meta.env.VITE_CLIENT_URL || "https://modular-sdk.circle.com/v1/rpc/w3s/buidl",
} as const;

