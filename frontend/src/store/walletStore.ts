import { create } from "zustand";
import type { PublicClient, Address } from "viem";
import type { SmartAccount, BundlerClient } from "viem/account-abstraction";
import type { SessionKey } from "../lib/session-keys";

interface WalletState {
  isConnected: boolean;
  smartAccount: SmartAccount | null;
  bundlerClient: BundlerClient | null;
  publicClient: PublicClient | null;
  address: Address | null;
  username: string | null;
  
  sessionKey: SessionKey | null;
  sessionEnabled: boolean;
  sessionDuration: number; 
  batchSize: number;

  connect: (
    smartAccount: SmartAccount,
    bundlerClient: BundlerClient,
    publicClient: PublicClient,
    address: Address,
    username: string
  ) => void;
  disconnect: () => void;
  setSessionKey: (sessionKey: SessionKey | null) => void;
  setSessionEnabled: (enabled: boolean) => void;
  setSessionDuration: (duration: number) => void;
  setBatchSize: (size: number) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  smartAccount: null,
  bundlerClient: null,
  publicClient: null,
  address: null,
  username: null,
  sessionKey: null,
  sessionEnabled: true, 
  sessionDuration: 10, 
  batchSize: (() => {
    try {
      const stored = localStorage.getItem("arc-breakpoint-batch-size");
      if (stored) {
        const size = parseInt(stored, 10);
        if (size >= 1 && size <= 50) return size;
      }
    } catch (e) {
      console.error("Failed to load batch size preference:", e);
    }
    return 10;
  })(),

  connect: (smartAccount, bundlerClient, publicClient, address, username) =>
    set({
      isConnected: true,
      smartAccount,
      bundlerClient,
      publicClient,
      address,
      username,
    }),

  disconnect: () =>
    set({
      isConnected: false,
      smartAccount: null,
      bundlerClient: null,
      publicClient: null,
      address: null,
      username: null,
      sessionKey: null, 
    }),
  
  setSessionKey: (sessionKey) => set({ sessionKey }),
  setSessionEnabled: (enabled) => set({ sessionEnabled: enabled }),
  setSessionDuration: (duration) => set({ sessionDuration: duration }),
  setBatchSize: (size) => {
    const clamped = Math.max(1, Math.min(50, size));
    try {
      localStorage.setItem("arc-breakpoint-batch-size", clamped.toString());
    } catch (e) {
      console.error("Failed to save batch size preference:", e);
    }
    set({ batchSize: clamped });
  },
}));

