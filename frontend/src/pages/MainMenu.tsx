import { useNavigate } from "react-router-dom";
import { useWalletStore } from "../store/walletStore";
import { authenticatePasskey, createSmartAccount } from "../lib/wallet";
import { PasskeyManager } from "../lib/passkey-manager";
import { testServerConnection } from "../lib/wallet-test";
import { useState, useEffect } from "react";

export function MainMenu() {
  const navigate = useNavigate();
  const { connect, isConnected, username } = useWalletStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>("");
  const [isWebAuthnSupported, setIsWebAuthnSupported] = useState(true);
  const [showAuthOptions, setShowAuthOptions] = useState(false);

  // Check configuration and WebAuthn support on mount
  useEffect(() => {
    // Check WebAuthn support
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


    // Test server connection in development
    if (import.meta.env.DEV) {
      testServerConnection().then((result) => {
        if (!result.success) {
          console.warn("⚠️ Server connection test failed:", result.error);
          console.log("Server details:", result.details);
        } else {
          console.log("✅ Server connection test passed:", result.details);
        }
      });
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
      // Get username with validation
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

      // Validate username format
      if (!/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
        alert(
          "Invalid username format.\n\n" +
          "Username must be 3-30 characters and contain only:\n" +
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

      // Authenticate with specified mode
      const authResult = await authenticatePasskey(username, mode);

      setConnectionStatus(
        authResult.mode === "register"
          ? "Creating smart account..."
          : "Loading smart account..."
      );

      // Create smart account following Circle docs pattern
      const { smartAccount, bundlerClient, publicClient, address } =
        await createSmartAccount(authResult);

      setConnectionStatus("Connected!");

      // Store connection
      connect(smartAccount, bundlerClient, publicClient, address, username);

      // Show success message
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

      // Show user-friendly error
      alert(`Failed to ${mode === "register" ? "create account" : "sign in"}:\n\n${errorMessage}`);

      setConnectionStatus("Connection failed");
    } finally {
      setIsConnecting(false);
      // Clear status after a delay
      setTimeout(() => setConnectionStatus(""), 3000);
    }
  };

  const handleConnect = () => {
    setShowAuthOptions(true);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: "2rem",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚡ ARC STARSHIP</h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
        The First GameFi on ARC
      </p>

      {configError && (
        <div
          style={{
            padding: "1rem",
            background: "#ff4444",
            color: "white",
            borderRadius: "8px",
            marginBottom: "1rem",
            maxWidth: "600px",
            textAlign: "center",
          }}
        >
          <strong>Configuration Error:</strong>
          <pre style={{ marginTop: "0.5rem", fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>
            {configError}
          </pre>
          <p style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
            Please check your .env file and ensure all required variables are set.
          </p>
        </div>
      )}

      {connectionStatus && (
        <div
          style={{
            padding: "0.75rem 1.5rem",
            background: "rgba(255, 255, 255, 0.2)",
            color: "white",
            borderRadius: "8px",
            fontSize: "0.95rem",
          }}
        >
          {connectionStatus}
        </div>
      )}

      {!isConnected ? (
        showAuthOptions ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              Choose an option:
            </p>
            <button
              onClick={() => handleAuth("register")}
              disabled={isConnecting || !!configError || !isWebAuthnSupported}
              style={{
                padding: "1rem 2rem",
                fontSize: "1.2rem",
                background: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor:
                  isConnecting || configError || !isWebAuthnSupported
                    ? "not-allowed"
                    : "pointer",
                opacity: isConnecting ? 0.7 : 1,
                minWidth: "200px",
              }}
            >
              {isConnecting ? "Creating..." : "Create Account"}
            </button>
            <button
              onClick={() => handleAuth("login")}
              disabled={isConnecting || !!configError || !isWebAuthnSupported}
              style={{
                padding: "1rem 2rem",
                fontSize: "1.2rem",
                background: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor:
                  isConnecting || configError || !isWebAuthnSupported
                    ? "not-allowed"
                    : "pointer",
                opacity: isConnecting ? 0.7 : 1,
                minWidth: "200px",
              }}
            >
              {isConnecting ? "Signing in..." : "Sign In"}
            </button>
            <button
              onClick={() => setShowAuthOptions(false)}
              disabled={isConnecting}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.9rem",
                background: "transparent",
                color: "white",
                border: "1px solid white",
                borderRadius: "8px",
                cursor: isConnecting ? "not-allowed" : "pointer",
                marginTop: "0.5rem",
              }}
            >
              Back
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isConnecting || !!configError || !isWebAuthnSupported}
            style={{
              padding: "1rem 2rem",
              fontSize: "1.2rem",
              background:
                configError || !isWebAuthnSupported ? "#999" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor:
                isConnecting || configError || !isWebAuthnSupported
                  ? "not-allowed"
                  : "pointer",
              opacity: isConnecting ? 0.7 : 1,
            }}
          >
            {isConnecting
              ? "Connecting..."
              : !isWebAuthnSupported
              ? "Passkeys Not Supported"
              : "Connect Wallet"}
          </button>
        )
      ) : (
        <>
          <p>Welcome, {username}!</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <button
              onClick={() => {
                navigate("/game");
              }}
              style={{
                padding: "1rem 2rem",
                fontSize: "1.2rem",
                background: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Start Game
            </button>
            <button
              onClick={() => navigate("/staking")}
              style={{
                padding: "1rem 2rem",
                fontSize: "1.2rem",
                background: "#FF9800",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Stake USDC for Boosts ⛽
            </button>
          </div>
        </>
      )}
    </div>
  );
}

