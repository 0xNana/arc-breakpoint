import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletStore } from "../store/walletStore";
import { useGameStore } from "../store/gameStore";
import { useGameTransactions } from "../hooks/useGameTransactions";
import { useSessionKey } from "../hooks/useSessionKey";
import { ArtGallery } from "../components/ArtGallery";
import {
  getCurrentLevel,
  getLevelProgress,
  getNextLevel
} from "../lib/art-levels";

export function ClickerScreen() {
  const navigate = useNavigate();
  const {
    isConnected,
    username,
    sessionEnabled,
    setSessionEnabled,
    sessionDuration,
    setSessionDuration,
    batchSize,
    setBatchSize,
  } = useWalletStore();
  const { profile, pendingTransactions } = useGameStore();
  const { performAction, refreshProfile, pendingClicks, queuedActions } = useGameTransactions();
  const {
    isActive: isSessionActive,
    isCreating: isCreatingSession,
    error: sessionError,
    remainingTime,
    createNewSessionKey,
    endSession,
    updateSessionDuration,
  } = useSessionKey();

  const [isClicking, setIsClicking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected, navigate]);

  useEffect(() => {
    refreshProfile();
    const interval = setInterval(refreshProfile, 5000);
    return () => clearInterval(interval);
  }, [refreshProfile]);

  // Use pending clicks for immediate UI feedback (resets when transactions confirm)
  const totalActions = BigInt(Number(profile?.totalActions || 0n) + pendingClicks);
  const txCount = Number(totalActions);
  const currentLevel = useMemo(() => {
    try {
      return getCurrentLevel(totalActions);
    } catch (error) {
      console.error("Error calculating current level:", error);
      return 0;
    }
  }, [totalActions]);
  
  const nextLevel = useMemo(() => {
    try {
      return getNextLevel(totalActions);
    } catch (error) {
      console.error("Error calculating next level:", error);
      return null;
    }
  }, [totalActions]);
  
  const currentLevelProgress = useMemo(() => {
    try {
      if (!nextLevel) return 100;
      return getLevelProgress(nextLevel.level, totalActions);
    } catch (error) {
      console.error("Error calculating progress:", error);
      return 0;
    }
  }, [nextLevel, totalActions]);

  const handleClick = async () => {
    if (isClicking) return;

    try {
      setError(null);
      setIsClicking(true);
      
      await performAction({
        note: "click",
      });
      
      if (!isSessionActive) {
        setTimeout(() => refreshProfile(), 1000);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Click failed. Please retry.";
      setError(message);
    } finally {
      setIsClicking(false);
    }
  };

  // No longer needed - queuedActions is managed in useGameTransactions

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#050816",
        color: "white",
        padding: "2rem 1rem",
        paddingBottom: "4rem",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          paddingBottom: "4rem",
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
          <h1 style={{ fontSize: "2.5rem", margin: 0 }}> Arc BreakPoint</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", margin: 0 }}>
            Stress testing Arc Testnet • Every click = One transaction
          </p>
        </header>

        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: "16px",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                Current Level
              </p>
              <p style={{ margin: "0.5rem 0 0", fontSize: "2.5rem", fontWeight: 700 }}>
                {currentLevel}
              </p>
            </div>

            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                Total Transactions
              </p>
              <p style={{ margin: "0.5rem 0 0", fontSize: "2.5rem", fontWeight: 700 }}>
                {txCount.toLocaleString()}
              </p>
            </div>

            {nextLevel && (
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.9rem",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  Progress to Level {nextLevel.level}
                </p>
                <p style={{ margin: "0.5rem 0 0", fontSize: "2.5rem", fontWeight: 700 }}>
                  {currentLevelProgress}%
                </p>
                <div
                  style={{
                    marginTop: "0.5rem",
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    height: "8px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      background: "linear-gradient(90deg, #facc15, #f59e0b)",
                      height: "100%",
                      width: `${currentLevelProgress}%`,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            )}

            {pendingTransactions > 0 && (
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.9rem",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  Pending
                </p>
                <p
                  style={{
                    margin: "0.5rem 0 0",
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    color: "#facc15",
                  }}
                >
                  {pendingTransactions}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleClick}
            disabled={isClicking}
            className={isClicking ? "click-button-pulsing" : "click-button"}
            style={{
              width: "100%",
              padding: "2rem",
              borderRadius: "16px",
              border: "none",
              background: isClicking
                ? "rgba(250,204,21,0.5)"
                : "linear-gradient(135deg, #facc15, #f59e0b)",
              color: "#000",
              fontSize: "1.5rem",
              fontWeight: 700,
              cursor: isClicking ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: isClicking
                ? "none"
                : "0 8px 32px rgba(250,204,21,0.3)",
              position: "relative",
              transform: "scale(1)",
            }}
            onMouseDown={(e) => {
              if (!isClicking) {
                e.currentTarget.style.transform = "scale(0.98)";
              }
            }}
            onMouseUp={(e) => {
              if (!isClicking) {
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isClicking) {
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          >
            {isClicking ? (
              <span style={{ display: "inline-block", animation: "pulse 1s ease-in-out infinite" }}>
                Processing...
              </span>
            ) : (
              <>
                <span style={{ display: "inline-block" }}>⚡</span>{" "}
                <span style={{ display: "inline-block", animation: "glow 2s ease-in-out infinite" }}>
                  CLICK TO TX
                </span>
              </>
            )}
            {isSessionActive && queuedActions > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "0.5rem",
                  right: "0.5rem",
                  background: "rgba(0,0,0,0.3)",
                  color: "#000",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                Queued: {queuedActions}
              </span>
            )}
          </button>

          {error && (
            <div
              style={{
                background: "rgba(248,113,113,0.15)",
                border: "1px solid rgba(248,113,113,0.3)",
                padding: "0.75rem 1rem",
                borderRadius: "12px",
                color: "#fecaca",
              }}
            >
              {error}
            </div>
          )}
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: "16px",
            padding: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Auto Session</h3>
              <p
                style={{
                  margin: "0.25rem 0 0",
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                Batch clicks to reduce passkey prompts
              </p>
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={sessionEnabled}
                onChange={(e) => setSessionEnabled(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>{sessionEnabled ? "Enabled" : "Disabled"}</span>
            </label>
          </div>

          {sessionEnabled && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1 1 200px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.25rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    Session Duration: {sessionDuration} minutes
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={sessionDuration}
                    onChange={(e) => {
                      const newDuration = parseInt(e.target.value, 10);
                      setSessionDuration(newDuration);
                      updateSessionDuration(newDuration);
                    }}
                    style={{ width: "100%", cursor: "pointer" }}
                  />
                </div>

                <div style={{ flex: "1 1 200px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.25rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    Batch Size: {batchSize} clicks
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={batchSize}
                    onChange={(e) => {
                      const newSize = parseInt(e.target.value, 10);
                      setBatchSize(newSize);
                    }}
                    style={{ width: "100%", cursor: "pointer" }}
                  />
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>
                    Transactions will batch after {batchSize} clicks (max 50 to avoid RPC limits)
                  </p>
                </div>

                {!isSessionActive ? (
                  <button
                    onClick={createNewSessionKey}
                    disabled={isCreatingSession}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      border: "none",
                      background: isCreatingSession
                        ? "rgba(255,255,255,0.2)"
                        : "linear-gradient(135deg, #10b981, #059669)",
                      color: "white",
                      cursor: isCreatingSession ? "not-allowed" : "pointer",
                      fontWeight: 500,
                    }}
                  >
                    {isCreatingSession ? "Creating..." : "Start Session"}
                  </button>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      alignItems: "flex-end",
                    }}
                  >
                    <div style={{ fontSize: "0.9rem", color: "#10b981" }}>
                      ⏱️ {Math.floor(remainingTime / 60)}:
                      {(remainingTime % 60).toString().padStart(2, "0")} remaining
                    </div>
                    <button
                      onClick={endSession}
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.2)",
                        background: "transparent",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                      }}
                    >
                      End Session
                    </button>
                  </div>
                )}
              </div>

              {sessionError && (
                <div
                  style={{
                    padding: "0.5rem",
                    background: "rgba(248,113,113,0.15)",
                    borderRadius: "8px",
                    color: "#fecaca",
                    fontSize: "0.85rem",
                  }}
                >
                  {sessionError}
                </div>
              )}

              {sessionEnabled && !isSessionActive && (
                <div
                  style={{
                    padding: "0.75rem",
                    background: "rgba(250,204,21,0.15)",
                    border: "1px solid rgba(250,204,21,0.3)",
                    borderRadius: "8px",
                    color: "#facc15",
                    fontSize: "0.85rem",
                  }}
                >
                  Session enabled but not started. Click "Start Session" to enable batching.
                </div>
              )}
              {isSessionActive && (
                <div
                  style={{
                    padding: "0.75rem",
                    background: "rgba(16,185,129,0.15)",
                    border: "1px solid rgba(16,185,129,0.3)",
                    borderRadius: "8px",
                    color: "#6ee7b7",
                    fontSize: "0.85rem",
                  }}
                >
                  ✅ Session active! Clicks will be batched after {batchSize} clicks.
                  {queuedActions > 0 && (
                    <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", opacity: 0.9 }}>
                      {queuedActions} action{queuedActions !== 1 ? "s" : ""} queued - waiting for batch...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <section
          style={{
            width: "100%",
            scrollMarginTop: "2rem",
          }}
        >
          <ArtGallery />
        </section>

        <footer
          style={{
            marginTop: "4rem",
            paddingTop: "3rem",
            paddingBottom: "2rem",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
            }}
          >
            {/* Main Footer Content */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "2rem",
              }}
            >
              {/* Brand Section */}
              <div>
                <h3
                  style={{
                    margin: 0,
                    marginBottom: "0.75rem",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  Arc BreakPoint
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.6,
                  }}
                >
                  Passkey Authentication & Chain TPS Testing Platform
                </p>
              </div>

              {/* Status Section */}
              <div>
                <h3
                  style={{
                    margin: 0,
                    marginBottom: "0.75rem",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  Connection
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: "rgba(255,255,255,0.8)" }}>{username || "anon"}</strong>
                  <br />
                  Passkeys secured • USDC gas via Circle
                </p>
              </div>

              {/* Links Section */}
              <div>
                <h3
                  style={{
                    margin: 0,
                    marginBottom: "0.75rem",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  Links
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <a
                    href="https://x.com/0xelegant"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      textDecoration: "none",
                      fontSize: "0.85rem",
                      transition: "all 0.2s ease",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "rgba(255,255,255,1)";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    <span>𝕏</span>
                    <span>x.com/0xelegant</span>
                  </a>
                  <a
                    href="https://github.com/0xnana/arc-breakpoint"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      textDecoration: "none",
                      fontSize: "0.85rem",
                      transition: "all 0.2s ease",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "rgba(255,255,255,1)";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    <span></span>
                    <span>GitHub</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div
              style={{
                paddingTop: "2rem",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                Built for Arc Testnet • This is purely experimental and educational purpose and no promise of financial rewards
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                © 2025 Arc BreakPoint
              </p>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(0.98);
          }
        }

        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 10px rgba(250, 204, 21, 0.5);
          }
          50% {
            text-shadow: 0 0 20px rgba(250, 204, 21, 0.8), 0 0 30px rgba(250, 204, 21, 0.4);
          }
        }

        .click-button:hover:not(:disabled) {
          transform: scale(1.02) !important;
          box-shadow: 0 12px 40px rgba(250, 204, 21, 0.4) !important;
        }

        .click-button-pulsing {
          animation: pulse 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

