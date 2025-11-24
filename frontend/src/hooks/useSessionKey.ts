import { useEffect, useCallback, useState } from "react";
import { useWalletStore } from "../store/walletStore";
import {
  createSessionKey,
  saveSessionKey,
  loadSessionKey,
  clearSessionKey,
  isSessionKeyValid,
  getRemainingSessionTime,
  getSessionDurationPreference,
  saveSessionDurationPreference,
} from "../lib/session-keys";

export function useSessionKey() {
  const {
    sessionKey,
    sessionEnabled,
    sessionDuration,
    setSessionKey,
    setSessionDuration,
    smartAccount,
    address,
  } = useWalletStore();

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    const savedDuration = getSessionDurationPreference();
    setSessionDuration(savedDuration);
  }, [setSessionDuration]);

  useEffect(() => {
    if (sessionEnabled && !sessionKey) {
      const loaded = loadSessionKey();
      if (loaded && isSessionKeyValid(loaded)) {
        setSessionKey(loaded);
      } else if (loaded) {
        clearSessionKey();
      }
    }
  }, [sessionEnabled, sessionKey, setSessionKey]);

  useEffect(() => {
    if (!sessionKey || !sessionEnabled) {
      setRemainingTime(0);
      return;
    }

    const updateTime = () => {
      const remaining = getRemainingSessionTime(sessionKey);
      setRemainingTime(remaining);
      
      if (remaining === 0) {
        clearSessionKey();
        setSessionKey(null);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [sessionKey, sessionEnabled, setSessionKey]);

  const createNewSessionKey = useCallback(async () => {
    if (!smartAccount || !address) {
      throw new Error("Wallet not connected");
    }

    setIsCreating(true);
    setError(null);

    try {
      const newSessionKey = createSessionKey(sessionDuration);

      saveSessionKey(newSessionKey);
      setSessionKey(newSessionKey);

      console.log("Session key created:", {
        address: newSessionKey.address,
        validUntil: new Date(newSessionKey.validUntil * 1000).toISOString(),
        duration: sessionDuration,
      });

      return newSessionKey;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create session key";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  }, [smartAccount, address, sessionDuration, setSessionKey]);

  const endSession = useCallback(() => {
    clearSessionKey();
    setSessionKey(null);
    setError(null);
  }, [setSessionKey]);

  const updateSessionDuration = useCallback(
    (duration: number) => {
      const clamped = Math.max(1, Math.min(60, duration));
      saveSessionDurationPreference(clamped);
      setSessionDuration(clamped);
    },
    [setSessionDuration]
  );

  const isActive = sessionEnabled && sessionKey && isSessionKeyValid(sessionKey);

  return {
    sessionKey: isActive ? sessionKey : null,
    isActive,
    isCreating,
    error,
    remainingTime,
    createNewSessionKey,
    endSession,
    updateSessionDuration,
  };
}

