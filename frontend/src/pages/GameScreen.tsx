import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Address } from "viem";
import { useWalletStore } from "../store/walletStore";
import { useGameStore } from "../store/gameStore";
import { useGameTransactions } from "../hooks/useGameTransactions";
import { useStakingMultiplier } from "../hooks/useStakingMultiplier";
import { ActionType } from "../lib/game-contract";

interface ActionButtonConfig {
  type: ActionType;
  title: string;
  description: string;
  accent: string;
  note: string;
}

const ACTIONS: ActionButtonConfig[] = [
  {
    type: ActionType.COLLECT,
    title: "Collect ⭐",
    description: "Adds XP on-chain immediately with your current multiplier.",
    accent: "#facc15",
    note: "collect",
  },
  {
    type: ActionType.DODGE,
    title: "Dodge 💨",
    description: "Flex your reflexes and log a dodge streak for bonus XP.",
    accent: "#34d399",
    note: "dodge",
  },
  {
    type: ActionType.SCAN,
    title: "Scan 🔎",
    description: "Ping the chain for intel, perfect for logging activity bursts.",
    accent: "#60a5fa",
    note: "scan",
  },
  {
    type: ActionType.BOOST,
    title: "Boost 🚀",
    description: "Record that you juiced up your stake. Pair with USDC staking.",
    accent: "#a78bfa",
    note: "boost",
  },
  {
    type: ActionType.CLAIM,
    title: "Claim 💰",
    description: "Settles your current XP on-chain and resets the counter.",
    accent: "#f87171",
    note: "claim",
  },
];

function formatBigInt(value?: bigint) {
  if (value === undefined || value === null) return "0";
  return value.toString();
}

export function GameScreen() {
  const navigate = useNavigate();
  const { isConnected, username } = useWalletStore();
  const { profile, pendingTransactions, actionLog } = useGameStore();
  const { performAction, refreshProfile } = useGameTransactions();
  const { multiplier } = useStakingMultiplier();

  const [referrerInput, setReferrerInput] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<ActionType | null>(null);

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected, navigate]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const multiplierValue = useMemo(() => {
    return (Number(multiplier) / 1e18).toFixed(2);
  }, [multiplier]);

  const normalizedReferrer = useMemo(() => {
    if (!referrerInput) return undefined;
    const trimmed = referrerInput.trim();
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      return trimmed as Address;
    }
    return undefined;
  }, [referrerInput]);

  const handleAction = async (config: ActionButtonConfig) => {
    try {
      setActionError(null);
      setIsSubmitting(config.type);
      await performAction({
        action: config.type,
        note: config.note,
        referrer: normalizedReferrer,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Action failed. Please retry.";
      setActionError(message);
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050816",
        color: "white",
        padding: "2rem 1rem",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <header
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <button
            onClick={() => navigate("/")}
            style={{
              alignSelf: "flex-start",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.7)",
              padding: "0.25rem 0.75rem",
              borderRadius: "999px",
              cursor: "pointer",
            }}
          >
            ← Home
          </button>
          <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Arc StarShip — TX Clicker</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", margin: 0 }}>
            Every tap is a transaction. Passkeys + USDC gas = Arc stress test.
          </p>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          <StatCard label="XP" value={formatBigInt(profile?.xp)} accent="#facc15" />
          <StatCard
            label="Total Actions"
            value={formatBigInt(profile?.totalActions)}
            accent="#38bdf8"
          />
          <StatCard
            label="Dodges"
            value={formatBigInt(profile?.dodges)}
            accent="#34d399"
          />
          <StatCard
            label="Scans"
            value={formatBigInt(profile?.scans)}
            accent="#a78bfa"
          />
          <StatCard
            label="Claims"
            value={formatBigInt(profile?.claims)}
            accent="#f472b6"
          />
          <StatCard
            label="Boost Multiplier"
            value={`${multiplierValue}x`}
            accent="#fb7185"
          />
        </section>

        <section
          style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: "16px",
            padding: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p style={{ marginBottom: "0.25rem" }}>Referral address (optional)</p>
              <input
                placeholder="0x..."
                value={referrerInput}
                onChange={(e) => setReferrerInput(e.target.value)}
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(0,0,0,0.4)",
                  color: "white",
                  width: "260px",
                }}
              />
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                Referrals mint XP once and persist on-chain. Invalid addresses are ignored.
              </p>
              <button
                onClick={refreshProfile}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "transparent",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Refresh Stats
              </button>
            </div>
          </div>
        </section>

        {actionError && (
          <div
            style={{
              background: "rgba(248,113,113,0.15)",
              border: "1px solid rgba(248,113,113,0.3)",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              color: "#fecaca",
            }}
          >
            {actionError}
          </div>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {ACTIONS.map((action) => (
            <button
              key={action.type}
              onClick={() => handleAction(action)}
              disabled={isSubmitting !== null}
              style={{
                border: "none",
                borderRadius: "16px",
                padding: "1.25rem",
                textAlign: "left",
                cursor: "pointer",
                background: "rgba(255,255,255,0.04)",
                boxShadow:
                  isSubmitting === action.type
                    ? `0 0 0 2px ${action.accent}`
                    : "none",
                color: "white",
                opacity: isSubmitting && isSubmitting !== action.type ? 0.6 : 1,
              }}
            >
              <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600 }}>
                {action.title}
              </p>
              <p style={{ margin: "0.5rem 0 0", color: "rgba(255,255,255,0.7)" }}>
                {action.description}
              </p>
            </button>
          ))}
        </section>

        <section
          style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: "16px",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0 }}>Action Log</h2>
            {pendingTransactions > 0 && (
              <span style={{ color: "#facc15" }}>
                ⏳ {pendingTransactions} pending
              </span>
            )}
          </div>
          {actionLog.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.6)" }}>
              Tap an action to start generating on-chain noise.
            </p>
          ) : (
            actionLog.map((entry) => (
              <div
                key={entry.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  padding: "0.5rem 0",
                  fontSize: "0.95rem",
                }}
              >
                <span>
                  {ActionType[entry.action]}{" "}
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>
                    · {new Date(entry.createdAt).toLocaleTimeString()}
                  </span>
                </span>
                <span
                  style={{
                    color:
                      entry.status === "confirmed"
                        ? "#4ade80"
                        : entry.status === "failed"
                        ? "#f87171"
                        : "#facc15",
                  }}
                >
                  {entry.status}
                </span>
              </div>
            ))
          )}
        </section>

        <section
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <button
            onClick={() => navigate("/staking")}
            style={{
              flex: "1 1 280px",
              padding: "1rem",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg, #f97316, #ec4899)",
              color: "white",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Stake USDC for Boosts
          </button>
        </section>

        <footer style={{ textAlign: "center", color: "rgba(255,255,255,0.5)" }}>
          Connected as {username || "anon"} • Passkeys secured • USDC gas via Circle
        </footer>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        borderRadius: "16px",
        padding: "1rem",
        minHeight: "120px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderLeft: `4px solid ${accent}`,
      }}
    >
      <span style={{ color: "rgba(255,255,255,0.6)" }}>{label}</span>
      <strong style={{ fontSize: "1.8rem" }}>{value}</strong>
    </div>
  );
}

