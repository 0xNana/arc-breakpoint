import { useCallback, useRef } from "react";
import { stringToHex, type Address, type Hex } from "viem";
import { useWalletStore } from "../store/walletStore";
import { useGameStore } from "../store/gameStore";
import {
  ActionType,
  EMPTY_METADATA,
  ZERO_ADDRESS,
  encodePerformAction,
  getPlayerStats,
} from "../lib/game-contract";
import { CONTRACT_ADDRESSES } from "../config/chain";

function toMetadataHex(message?: string): Hex {
  if (!message) {
    return EMPTY_METADATA;
  }

  return stringToHex(message);
}

/**
 * Handles high-frequency TX clicker calls along with UI bookkeeping
 */
export function useGameTransactions() {
  const { bundlerClient, publicClient, address, smartAccount } = useWalletStore();
  const {
    addActionEntry,
    updateActionEntry,
    setProfile,
    incrementPendingTx,
    decrementPendingTx,
  } = useGameStore();

  const isRequestInProgressRef = useRef(false);

  const refreshProfile = useCallback(async () => {
    if (!publicClient || !address) return;
    try {
      const stats = await getPlayerStats(publicClient, address);
      setProfile({
        ...stats,
      });
    } catch (error) {
      console.error("Failed to refresh player stats", error);
    }
  }, [publicClient, address, setProfile]);

  const performAction = useCallback(
    async ({
      action,
      note,
      referrer,
    }: {
      action: ActionType;
      note?: string;
      referrer?: Address;
    }) => {
      if (!bundlerClient || !smartAccount || !address) {
        throw new Error("Wallet not connected");
      }

      if (isRequestInProgressRef.current) {
        throw new Error("Another transaction is still awaiting signature");
      }

      const entryId = `${Date.now()}-${action}`;
      addActionEntry({
        id: entryId,
        action,
        status: "pending",
        createdAt: Date.now(),
        note,
      });

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
              data: encodePerformAction(action, metadata, referrerAddress),
            },
          ],
          paymaster: true,
        });

        const { receipt } = await bundlerClient.waitForUserOperationReceipt({
          hash: userOpHash,
        });

        updateActionEntry(entryId, {
          status: "confirmed",
          txHash: receipt.transactionHash,
        });

        await refreshProfile();
      } catch (error) {
        console.error("performAction failed", error);
        updateActionEntry(entryId, {
          status: "failed",
          error:
            error instanceof Error ? error.message : "Unknown transaction error",
        });
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
      addActionEntry,
      updateActionEntry,
      refreshProfile,
      incrementPendingTx,
      decrementPendingTx,
    ]
  );

  return {
    performAction,
    refreshProfile,
  };
}

