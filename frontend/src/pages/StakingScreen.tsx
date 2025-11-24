import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { stringToHex, type Address } from "viem";
import { useWalletStore } from "../store/walletStore";
import { useGameStore } from "../store/gameStore";
import { useStakingMultiplier } from "../hooks/useStakingMultiplier";
import {
  STAKING_TIERS,
  encodeStake,
  encodeUnstake,
} from "../lib/staking-contract";
import { encodeApprove } from "../lib/erc20";
import { CONTRACT_ADDRESSES } from "../config/chain";
import {
  ActionType,
  ZERO_ADDRESS,
  encodePerformAction,
} from "../lib/game-contract";
import { useGameTransactions } from "../hooks/useGameTransactions";

type TxState = { type: "stake" | "unstake"; amount?: bigint } | null;

export function StakingScreen() {
  const navigate = useNavigate();
  const { bundlerClient, smartAccount } = useWalletStore();
  const { incrementPendingTx, decrementPendingTx } = useGameStore();
  const { multiplier } = useStakingMultiplier();
  const { refreshProfile } = useGameTransactions();

  const [txState, setTxState] = useState<TxState>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleStake = async (amount: bigint) => {
    if (!bundlerClient || !smartAccount) {
      setError("Connect your passkey wallet first.");
      return;
    }
    if (!CONTRACT_ADDRESSES.STAKING || !CONTRACT_ADDRESSES.USDC || !CONTRACT_ADDRESSES.GAME) {
      setError("Missing contract addresses. Check your .env config.");
      return;
    }

    setError(null);
    setSuccess(null);
    setTxState({ type: "stake", amount });
    incrementPendingTx();
    try {
      const calls = [
        {
          to: CONTRACT_ADDRESSES.USDC as Address,
          data: encodeApprove(CONTRACT_ADDRESSES.STAKING as Address, amount),
        },
        {
          to: CONTRACT_ADDRESSES.STAKING as Address,
          data: encodeStake(amount),
        },
        {
          to: CONTRACT_ADDRESSES.GAME as Address,
          data: encodePerformAction(
            ActionType.BOOST,
            stringToHex(`stake:${amount.toString()}`),
            ZERO_ADDRESS
          ),
        },
      ];

      const userOpHash = await bundlerClient.sendUserOperation({
        account: smartAccount,
        calls,
        paymaster: true,
      });

      const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });

      setSuccess(`Stake confirmed in tx ${receipt.transactionHash}`);
      await refreshProfile();
    } catch (err) {
      console.error("Stake failed", err);
      setError(
        err instanceof Error ? err.message : "Failed to send staking transaction."
      );
    } finally {
      setTxState(null);
      decrementPendingTx();
    }
  };

  const handleUnstake = async () => {
    if (!bundlerClient || !smartAccount) {
      setError("Connect your passkey wallet first.");
      return;
    }
    if (!CONTRACT_ADDRESSES.STAKING) {
      setError("Missing staking contract address.");
      return;
    }

    setError(null);
    setSuccess(null);
    setTxState({ type: "unstake" });
    incrementPendingTx();
    try {
      const userOpHash = await bundlerClient.sendUserOperation({
        account: smartAccount,
        calls: [
          {
            to: CONTRACT_ADDRESSES.STAKING as Address,
            data: encodeUnstake(),
          },
        ],
        paymaster: true,
      });

      const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });

      setSuccess(`Unstake confirmed in tx ${receipt.transactionHash}`);
      await refreshProfile();
    } catch (err) {
      console.error("Unstake failed", err);
      setError(
        err instanceof Error ? err.message : "Failed to send unstake transaction."
      );
    } finally {
      setTxState(null);
      decrementPendingTx();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#04050f",
        color: "white",
        padding: "2rem 1rem",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <button
          onClick={() => navigate("/game")}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.2)",
            padding: "0.25rem 0.75rem",
            borderRadius: "999px",
            color: "rgba(255,255,255,0.7)",
            width: "fit-content",
          }}
        >
          ← Back to Clicker
        </button>

        <h1 style={{ margin: 0 }}>Stake USDC for Boosts</h1>
        <p style={{ color: "rgba(255,255,255,0.7)", margin: 0 }}>
          Circle smart accounts pay gas in USDC. Stake once and your XP multiplier updates
          on-chain instantly.
        </p>

        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: "16px",
            padding: "1.25rem",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "rgba(255,255,255,0.6)" }}>
              Current Multiplier
            </p>
            <strong style={{ fontSize: "2.5rem" }}>
              {(Number(multiplier) / 1e18).toFixed(2)}x
            </strong>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0 }}>Stake tiers:</p>
            <ul style={{ margin: "0.25rem 0 0", paddingLeft: "1.25rem" }}>
              <li>25 USDC → 1.2x</li>
              <li>50 USDC → 1.5x</li>
              <li>100 USDC → 2.0x</li>
            </ul>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(248,113,113,0.15)",
              border: "1px solid rgba(248,113,113,0.3)",
              borderRadius: "12px",
              padding: "0.75rem 1rem",
              color: "#fecaca",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              background: "rgba(74,222,128,0.15)",
              border: "1px solid rgba(74,222,128,0.3)",
              borderRadius: "12px",
              padding: "0.75rem 1rem",
              color: "#bbf7d0",
            }}
          >
            {success}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {STAKING_TIERS.map((tier) => (
            <button
              key={tier.label}
              onClick={() => handleStake(tier.amount)}
              disabled={!!txState}
              style={{
                border: "none",
                borderRadius: "16px",
                padding: "1.25rem",
                cursor: txState ? "not-allowed" : "pointer",
                background: "rgba(255,255,255,0.05)",
                color: "white",
              }}
            >
              <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600 }}>
                {tier.label}
              </p>
              <p style={{ margin: "0.5rem 0 0", color: "rgba(255,255,255,0.6)" }}>
                Logs boost + staking tx in one passkey signature.
              </p>
            </button>
          ))}
        </div>

        <button
          onClick={handleUnstake}
          disabled={!!txState}
          style={{
            marginTop: "1rem",
            padding: "1rem",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "transparent",
            color: "white",
            cursor: txState ? "not-allowed" : "pointer",
          }}
        >
          Unstake (after boost expires)
        </button>

        {txState && (
          <p style={{ color: "#facc15" }}>
            Signing {txState.type === "stake" ? "stake" : "unstake"} transaction...
          </p>
        )}
      </div>
    </div>
  );
}

