import { create } from "zustand";
import type { PlayerStats } from "../lib/game-contract";

interface GameState {
  profile: PlayerStats | null;
  pendingTransactions: number;

  setProfile: (profile: PlayerStats | null) => void;
  incrementPendingTx: () => void;
  decrementPendingTx: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  profile: null,
  pendingTransactions: 0,

  setProfile: (profile) => set({ profile }),

  incrementPendingTx: () =>
    set((state) => ({
      pendingTransactions: state.pendingTransactions + 1,
    })),

  decrementPendingTx: () =>
    set((state) => ({
      pendingTransactions: Math.max(0, state.pendingTransactions - 1),
    })),
}));

