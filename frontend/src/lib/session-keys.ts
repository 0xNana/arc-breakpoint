import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { ARC_TESTNET } from "../config/chain";
import type { Address, Hex } from "viem";

export interface SessionKey {
  address: Address;
  privateKey: Hex;
  validAfter: number; 
  validUntil: number; 
  createdAt: number;
}

const SESSION_KEY_STORAGE_KEY = "arc-breakpoint-session-key";

export function generateSessionKey(): { address: Address; privateKey: Hex } {
  const privateKey = `0x${Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("")}` as Hex;

  const account = privateKeyToAccount(privateKey);
  return {
    address: account.address,
    privateKey,
  };
}

export function createSessionKey(durationMinutes: number): SessionKey {
  const now = Math.floor(Date.now() / 1000);
  const { address, privateKey } = generateSessionKey();

  return {
    address,
    privateKey,
    validAfter: now,
    validUntil: now + durationMinutes * 60,
    createdAt: now,
  };
}

export function saveSessionKey(sessionKey: SessionKey): void {
  try {
    localStorage.setItem(SESSION_KEY_STORAGE_KEY, JSON.stringify(sessionKey));
  } catch (error) {
    console.error("Failed to save session key:", error);
  }
}

export function loadSessionKey(): SessionKey | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY_STORAGE_KEY);
    if (!stored) return null;

    const sessionKey = JSON.parse(stored) as SessionKey;
    
    const now = Math.floor(Date.now() / 1000);
    if (now >= sessionKey.validUntil) {
      clearSessionKey();
      return null;
    }

    return sessionKey;
  } catch (error) {
    console.error("Failed to load session key:", error);
    return null;
  }
}

export function clearSessionKey(): void {
  try {
    localStorage.removeItem(SESSION_KEY_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear session key:", error);
  }
}

export function isSessionKeyValid(sessionKey: SessionKey | null): boolean {
  if (!sessionKey) return false;
  
  const now = Math.floor(Date.now() / 1000);
  return now >= sessionKey.validAfter && now < sessionKey.validUntil;
}

export function getRemainingSessionTime(sessionKey: SessionKey | null): number {
  if (!sessionKey) return 0;
  
  const now = Math.floor(Date.now() / 1000);
  const remaining = sessionKey.validUntil - now;
  return Math.max(0, remaining);
}

export function createSessionKeyWallet(sessionKey: SessionKey) {
  const account = privateKeyToAccount(sessionKey.privateKey);
  
  return createWalletClient({
    account,
    chain: ARC_TESTNET,
    transport: http(), 
  });
}

export function getSessionDurationPreference(): number {
  try {
    const stored = localStorage.getItem("arc-breakpoint-session-duration");
    if (stored) {
      const duration = parseInt(stored, 10);
      if (duration >= 1 && duration <= 60) {
        return duration;
      }
    }
  } catch (error) {
    console.error("Failed to load session duration preference:", error);
  }
  return 10; 
}

export function saveSessionDurationPreference(durationMinutes: number): void {
  try {
    const clamped = Math.max(1, Math.min(60, durationMinutes));
    localStorage.setItem("arc-breakpoint-session-duration", clamped.toString());
  } catch (error) {
    console.error("Failed to save session duration preference:", error);
  }
}

