import { create } from "zustand";
import type { PublicClient, Address } from "viem";
import type { SmartAccount, BundlerClient } from "viem/account-abstraction";

interface WalletState {
  isConnected: boolean;
  smartAccount: SmartAccount | null;
  bundlerClient: BundlerClient | null;
  publicClient: PublicClient | null;
  address: Address | null;
  username: string | null;

  // Actions
  connect: (
    smartAccount: SmartAccount,
    bundlerClient: BundlerClient,
    publicClient: PublicClient,
    address: Address,
    username: string
  ) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  smartAccount: null,
  bundlerClient: null,
  publicClient: null,
  address: null,
  username: null,

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
    }),
}));

