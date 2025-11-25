import { useNavigate } from "react-router-dom";
import { useWalletStore } from "../store/walletStore";
import { authenticatePasskey, createSmartAccount } from "../lib/wallet";
import { PasskeyManager } from "../lib/passkey-manager";
import { useState, useEffect } from "react";

export function MainMenu() {
  const navigate = useNavigate();
  const { connect, isConnected, username } = useWalletStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>("");
  const [isWebAuthnSupported, setIsWebAuthnSupported] = useState(true);
  const [showAuthOptions, setShowAuthOptions] = useState(false);

  useEffect(() => {
    const supportInfo = PasskeyManager.getSupportInfo();
    setIsWebAuthnSupported(supportInfo.supported);
    
    if (!supportInfo.supported) {
      setConfigError(
        "WebAuthn/Passkeys not supported in this browser.\n\n" +
        `Reasons: ${supportInfo.reasons.join(", ")}\n\n` +
        "Please use a modern browser that supports WebAuthn (Chrome, Firefox, Safari, Edge)."
      );
      return;
    }
  }, []);

  const handleAuth = async (mode: "register" | "login") => {
    if (!isWebAuthnSupported) {
      alert("WebAuthn/Passkeys are not supported in this browser.");
      return;
    }

    setIsConnecting(true);
    setShowAuthOptions(false);
    setConnectionStatus("Requesting username...");

    try {
      const action = mode === "register" ? "Create Account" : "Sign In";
      const usernameInput = prompt(
        `${action}\n\nEnter your username:\n\n` +
        "Requirements:\n" +
        "• 3-30 characters\n" +
        "• Letters, numbers, underscores, or hyphens only"
      );

      if (!usernameInput || usernameInput.trim() === "") {
        setConnectionStatus("");
        return;
      }

      const username = usernameInput.trim();

      if (!/^[a-zA-Z0-9_-]{5,30}$/.test(username)) {
        alert(
          "Invalid username format.\n\n" +
          "Username must be 5-30 characters and contain only:\n" +
          "• Letters (a-z, A-Z)\n" +
          "• Numbers (0-9)\n" +
          "• Underscores (_)\n" +
          "• Hyphens (-)"
        );
        setConnectionStatus("");
        return;
      }

      setConnectionStatus(
        mode === "register"
          ? "Creating your passkey..."
          : "Authenticating with passkey..."
      );

      const authResult = await authenticatePasskey(username, mode);

      setConnectionStatus(
        authResult.mode === "register"
          ? "Creating smart account..."
          : "Loading smart account..."
      );

      const { smartAccount, bundlerClient, publicClient, address } =
        await createSmartAccount(authResult);

      setConnectionStatus("Connected!");

      connect(smartAccount, bundlerClient, publicClient, address, username);

      if (authResult.mode === "register") {
        console.log(
          `✅ New passkey registered for ${username}. Smart account: ${address}`
        );
      } else {
        console.log(
          `✅ Logged in as ${username}. Smart account: ${address}`
        );
      }
    } catch (error) {
      console.error("Connection failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      alert(`Failed to ${mode === "register" ? "create account" : "sign in"}:\n\n${errorMessage}`);

      setConnectionStatus("Connection failed");
    } finally {
      setIsConnecting(false);
      setTimeout(() => setConnectionStatus(""), 3000);
    }
  };

  const handleConnect = () => {
    setShowAuthOptions(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1e 100%)",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated background elements */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background:
            "radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
          animation: "pulse 20s ease-in-out infinite",
        }}
      />

      <div
        style={{
          maxWidth: "900px",
          width: "100%",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "3rem",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              background: "rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              borderRadius: "999px",
              fontSize: "0.875rem",
              color: "#a5b4fc",
              marginBottom: "2rem",
            }}
          >
            <span></span>
            <span>Experimental and educational purpose</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 700,
              margin: 0,
              marginBottom: "1rem",
              background: "linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Arc BreakPoint
          </h1>

          <p
            style={{
              fontSize: "1.25rem",
              color: "rgba(255, 255, 255, 0.7)",
              margin: 0,
              marginBottom: "0.5rem",
              lineHeight: 1.6,
            }}
          >
          Passkey Authentication, USDC Gasless Transaction via Circle Paymaster & Chain TPS Testing
          </p>

          <p
            style={{
              fontSize: "1rem",
              color: "rgba(255, 255, 255, 0.5)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Stress testing Arc Testnet with every click as an on-chain transaction
          </p>
        </div>

        {/* Feature Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "1.5rem",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}></div>
            <h3 style={{ margin: 0, marginBottom: "0.5rem", fontSize: "1.1rem" }}>
              Passkey Auth
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "0.875rem",
                color: "rgba(255, 255, 255, 0.6)",
                lineHeight: 1.5,
              }}
            >
              WebAuthn-based authentication. No seed phrases, no passwords.
            </p>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "1.5rem",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}></div>
            <h3 style={{ margin: 0, marginBottom: "0.5rem", fontSize: "1.1rem" }}>
              TPS Testing
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "0.875rem",
                color: "rgba(255, 255, 255, 0.6)",
                lineHeight: 1.5,
              }}
            >
              Every click generates a real on-chain transaction. Measure throughput.
            </p>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "1.5rem",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}></div>
            <h3 style={{ margin: 0, marginBottom: "0.5rem", fontSize: "1.1rem" }}>
              Progressive Art
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "0.875rem",
                color: "rgba(255, 255, 255, 0.6)",
                lineHeight: 1.5,
              }}
            >
              Unlock 10 unique art pieces as you progress through 1M transactions.
            </p>
          </div>
        </div>

        {/* Error Display */}
        {configError && (
          <div
            style={{
              padding: "1rem 1.5rem",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "12px",
              color: "#fca5a5",
              fontSize: "0.875rem",
            }}
          >
            <strong>Configuration Error:</strong>
            <pre
              style={{
                marginTop: "0.5rem",
                fontSize: "0.875rem",
                whiteSpace: "pre-wrap",
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              {configError}
            </pre>
          </div>
        )}

        {/* Connection Status */}
        {connectionStatus && (
          <div
            style={{
              padding: "1rem 1.5rem",
              background: "rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              borderRadius: "12px",
              color: "#a5b4fc",
              fontSize: "0.875rem",
              textAlign: "center",
            }}
          >
            {connectionStatus}
          </div>
        )}

        {/* Auth Buttons */}
        {!isConnected ? (
          showAuthOptions ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                alignItems: "stretch",
              }}
            >
              <button
                onClick={() => handleAuth("register")}
                disabled={isConnecting || !!configError || !isWebAuthnSupported}
                style={{
                  padding: "1rem 2rem",
                  fontSize: "1rem",
                  fontWeight: 600,
                  background:
                    isConnecting || configError || !isWebAuthnSupported
                      ? "rgba(255, 255, 255, 0.1)"
                      : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor:
                    isConnecting || configError || !isWebAuthnSupported
                      ? "not-allowed"
                      : "pointer",
                  opacity: isConnecting ? 0.7 : 1,
                  transition: "all 0.2s ease",
                  boxShadow:
                    isConnecting || configError || !isWebAuthnSupported
                      ? "none"
                      : "0 4px 20px rgba(99, 102, 241, 0.3)",
                }}
                onMouseEnter={(e) => {
                  if (!isConnecting && !configError && isWebAuthnSupported) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 24px rgba(99, 102, 241, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isConnecting && !configError && isWebAuthnSupported) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(99, 102, 241, 0.3)";
                  }
                }}
              >
                {isConnecting ? "Creating..." : "Create Account"}
              </button>
              <button
                onClick={() => handleAuth("login")}
                disabled={isConnecting || !!configError || !isWebAuthnSupported}
                style={{
                  padding: "1rem 2rem",
                  fontSize: "1rem",
                  fontWeight: 600,
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "white",
                  borderRadius: "12px",
                  cursor:
                    isConnecting || configError || !isWebAuthnSupported
                      ? "not-allowed"
                      : "pointer",
                  opacity: isConnecting ? 0.7 : 1,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isConnecting && !configError && isWebAuthnSupported) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isConnecting && !configError && isWebAuthnSupported) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                  }
                }}
              >
                {isConnecting ? "Signing in..." : "Sign In"}
              </button>
              <button
                onClick={() => setShowAuthOptions(false)}
                disabled={isConnecting}
                style={{
                  padding: "0.75rem 1.5rem",
                  fontSize: "0.875rem",
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "rgba(255, 255, 255, 0.7)",
                  borderRadius: "8px",
                  cursor: isConnecting ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isConnecting) {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.9)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isConnecting) {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                  }
                }}
              >
                ← Back
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting || !!configError || !isWebAuthnSupported}
              style={{
                padding: "1.25rem 3rem",
                fontSize: "1.125rem",
                fontWeight: 600,
                background:
                  configError || !isWebAuthnSupported
                    ? "rgba(255, 255, 255, 0.1)"
                    : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor:
                  isConnecting || configError || !isWebAuthnSupported
                    ? "not-allowed"
                    : "pointer",
                opacity: isConnecting ? 0.7 : 1,
                transition: "all 0.2s ease",
                boxShadow:
                  configError || !isWebAuthnSupported
                    ? "none"
                    : "0 4px 20px rgba(99, 102, 241, 0.3)",
              }}
              onMouseEnter={(e) => {
                if (!isConnecting && !configError && isWebAuthnSupported) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 24px rgba(99, 102, 241, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isConnecting && !configError && isWebAuthnSupported) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(99, 102, 241, 0.3)";
                }
              }}
            >
              {isConnecting
                ? "Connecting..."
                : !isWebAuthnSupported
                ? "Passkeys Not Supported"
                : "Connect with Passkey"}
            </button>
          )
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              alignItems: "stretch",
            }}
          >
            <div
              style={{
                padding: "1.5rem",
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <p style={{ margin: 0, marginBottom: "0.5rem", color: "#6ee7b7" }}>
                Connected as <strong>{username}</strong>
              </p>
            </div>
            <button
              onClick={() => navigate("/clicker")}
              style={{
                padding: "1.25rem 3rem",
                fontSize: "1.125rem",
                fontWeight: 600,
                background: "linear-gradient(135deg, #facc15 0%, #f59e0b 100%)",
                color: "#000",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 20px rgba(250, 204, 21, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 24px rgba(250, 204, 21, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(250, 204, 21, 0.3)";
              }}
            >
              ⚡ Start Testing
            </button>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            paddingTop: "2rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            color: "rgba(255, 255, 255, 0.4)",
            fontSize: "0.875rem",
          }}
        >
          <p style={{ margin: 0 }}>
            Built for Arc Testnet • Powered by Circle Wallet SDK • Gasless via USDC Paymaster
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
