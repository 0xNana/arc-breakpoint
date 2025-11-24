import { useCallback, useRef, useEffect, useState } from "react";
import { stringToHex, type Address, type Hex } from "viem";
import { useWalletStore } from "../store/walletStore";
import { useGameStore } from "../store/gameStore";
import {
  EMPTY_METADATA,
  ZERO_ADDRESS,
  encodePerformAction,
  getPlayerStats,
} from "../lib/game-contract";
import { CONTRACT_ADDRESSES } from "../config/chain";
import { isSessionKeyValid } from "../lib/session-keys";
import { logger, logBatch, logTransaction, logSession } from "../lib/logger";

function toMetadataHex(message?: string): Hex {
  if (!message) {
    return EMPTY_METADATA;
  }

  return stringToHex(message);
}

interface QueuedAction {
  entryId: string;
  note?: string;
  referrer?: Address;
  createdAt: number;
}

export function useGameTransactions() {
  const { bundlerClient, publicClient, address, smartAccount, sessionKey, sessionEnabled, batchSize } = useWalletStore();
  const { setProfile, incrementPendingTx, decrementPendingTx } = useGameStore();

  const isRequestInProgressRef = useRef(false);
  const actionQueueRef = useRef<QueuedAction[]>([]);
  
  // Real-time click tracking for UI
  const [totalClicks, setTotalClicks] = useState(0);
  const [queuedActions, setQueuedActions] = useState(0);

  const refreshProfile = useCallback(async () => {
    if (!publicClient || !address) return;
    try {
      const stats = await getPlayerStats(publicClient, address);
      setProfile({
        ...stats,
      });
    } catch (error) {
      logger.error("Failed to refresh player stats", error);
    }
  }, [publicClient, address, setProfile]);

  const checkSessionActive = useCallback(() => {
    return sessionEnabled && sessionKey && isSessionKeyValid(sessionKey);
  }, [sessionEnabled, sessionKey]);

  const sendBatch = useCallback(async () => {
    if (actionQueueRef.current.length === 0 || isRequestInProgressRef.current) {
      return;
    }

    if (!bundlerClient || !smartAccount || !address) {
      actionQueueRef.current = [];
      return;
    }

    const MAX_BATCH_CHUNK = 50;
    const allActions = [...actionQueueRef.current];
    actionQueueRef.current = [];
    setQueuedActions(0); // Clear UI queue count
    
    logBatch.start(allActions.length);
    isRequestInProgressRef.current = true;
    
    for (let i = 0; i < allActions.length; i += MAX_BATCH_CHUNK) {
      const batch = allActions.slice(i, i + MAX_BATCH_CHUNK);

      isRequestInProgressRef.current = true;
      incrementPendingTx();

      try {
        const calls = batch.map((queued) => {
          const metadata = toMetadataHex(queued.note);
          const referrerAddress = queued.referrer || ZERO_ADDRESS;
          return {
            to: CONTRACT_ADDRESSES.GAME as Address,
            data: encodePerformAction(0, metadata, referrerAddress),
          };
        });

        const chunkNumber = Math.floor(i / MAX_BATCH_CHUNK) + 1;
        const totalChunks = Math.ceil(allActions.length / MAX_BATCH_CHUNK);
        logBatch.chunk(chunkNumber, totalChunks, batch.length);

        const userOpHash = await bundlerClient.sendUserOperation({
          account: smartAccount,
          calls,
          paymaster: true,
        });

        await bundlerClient.waitForUserOperationReceipt({
          hash: userOpHash,
        });

        logBatch.success(batch.length);
        
        if (i + MAX_BATCH_CHUNK < allActions.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        logBatch.error(error, batch.length);
        actionQueueRef.current.push(...batch);
        setQueuedActions(actionQueueRef.current.length); // Update UI queue count
        isRequestInProgressRef.current = false;
        decrementPendingTx();
        throw error;
      } finally {
        decrementPendingTx();
      }
    }
    
    isRequestInProgressRef.current = false;
    await refreshProfile();
  }, [
    bundlerClient,
    smartAccount,
    address,
    refreshProfile,
    incrementPendingTx,
    decrementPendingTx,
  ]);


  const performAction = useCallback(
    async ({
      note,
      referrer,
    }: {
      note?: string;
      referrer?: Address;
    }) => {
      if (!bundlerClient || !smartAccount || !address) {
        throw new Error("Wallet not connected");
      }

      const entryId = `${Date.now()}-${Math.random()}`;

      // Always increment total clicks for real-time UI feedback
      setTotalClicks(prev => prev + 1);

      const isActive = checkSessionActive();
      
      if (isActive) {
        logTransaction.queue(actionQueueRef.current.length + 1, batchSize);
        actionQueueRef.current.push({
          entryId,
          note,
          referrer,
          createdAt: Date.now(),
        });
        
        // Update UI queue count
        setQueuedActions(actionQueueRef.current.length);

        if (actionQueueRef.current.length >= batchSize) {
          logger.info(`Batch size reached (${batchSize}), sending batch...`);
          await sendBatch();
        }

        return;
      } else {
        logTransaction.immediate();
      }

      if (isRequestInProgressRef.current) {
        throw new Error("Another transaction is still awaiting signature");
      }

      const metadata = toMetadataHex(note);
      const referrerAddress = referrer || ZERO_ADDRESS;

      isRequestInProgressRef.current = true;
      incrementPendingTx();
      try {
        const userOpHash = await bundlerClient.sendUserOperation({
          account: smartAccount,
          calls: [
            {
              to: CONTRACT_ADDRESSES.GAME as Address,
              data: encodePerformAction(0, metadata, referrerAddress),
            },
          ],
          paymaster: true,
        });

        await bundlerClient.waitForUserOperationReceipt({
          hash: userOpHash,
        });

        logTransaction.success();
        await refreshProfile();
      } catch (error) {
        logTransaction.error(error);
        throw error;
      } finally {
        isRequestInProgressRef.current = false;
        decrementPendingTx();
      }
    },
    [
      bundlerClient,
      smartAccount,
      address,
      checkSessionActive,
      batchSize,
      refreshProfile,
      incrementPendingTx,
      decrementPendingTx,
      sendBatch,
    ]
  );

  useEffect(() => {
    const isActive = checkSessionActive();
    if (!isActive && actionQueueRef.current.length > 0) {
      logSession.flush(actionQueueRef.current.length);
      sendBatch();
    }
  }, [sessionEnabled, sessionKey, checkSessionActive, sendBatch]);

  return {
    performAction,
    refreshProfile,
    totalClicks,
    queuedActions,
  };
}

