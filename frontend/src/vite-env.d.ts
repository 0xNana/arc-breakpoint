/// <reference types="vite/client" />

declare module "vite/client" {
  interface ImportMetaEnv {
    readonly VITE_CLIENT_KEY: string;
    readonly VITE_CLIENT_URL: string;
    readonly VITE_ARC_RPC_URL: string;
    readonly VITE_ARC_CHAIN_ID: string;
    readonly VITE_ARC_EXPLORER_URL?: string;
    readonly VITE_GAME_CONTRACT_ADDRESS: string;
    readonly VITE_STAKING_CONTRACT_ADDRESS: string;
    readonly VITE_USDC_CONTRACT_ADDRESS: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

