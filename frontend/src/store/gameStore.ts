import { create } from "zustand";
import type { ActionType, PlayerStats } from "../lib/game-contract";

export type ActionStatus = "pending" | "confirmed" | "failed";

export interface ActionLogEntry {
  id: string;
  action: ActionType;
  status: ActionStatus;
  txHash?: string;
  error?: string;
  note?: string;
  createdAt: number;
}

interface GameState {
  profile: PlayerStats | null;
  pendingTransactions: number;
  actionLog: ActionLogEntry[];

  setProfile: (profile: PlayerStats | null) => void;
  updateProfile: (updates: Partial<PlayerStats>) => void;
  incrementPendingTx: () => void;
  decrementPendingTx: () => void;
  addActionEntry: (entry: ActionLogEntry) => void;
  updateActionEntry: (
    id: string,
    updates: Partial<Omit<ActionLogEntry, "id">>
  ) => void;
  clearActionLog: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  profile: null,
  pendingTransactions: 0,
  actionLog: [],

  setProfile: (profile) => set({ profile }),

  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : state.profile,
    })),

  incrementPendingTx: () =>
    set((state) => ({
      pendingTransactions: state.pendingTransactions + 1,
    })),

  decrementPendingTx: () =>
    set((state) => ({
      pendingTransactions: Math.max(0, state.pendingTransactions - 1),
    })),

  addActionEntry: (entry) =>
    set((state) => ({
      actionLog: [entry, ...state.actionLog].slice(0, 25),
    })),

  updateActionEntry: (id, updates) =>
    set((state) => ({
      actionLog: state.actionLog.map((entry) =>
        entry.id === id ? { ...entry, ...updates } : entry
      ),
    })),

  clearActionLog: () => set({ actionLog: [] }),
}));

