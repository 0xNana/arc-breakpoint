import {
  toPasskeyTransport,
  toWebAuthnCredential,
  WebAuthnMode,
  type WebAuthnCredential,
} from "@circle-fin/modular-wallets-core";
import { CLIENT_CONFIG } from "../config/chain";

export interface PasskeyAuthResult {
  credential: WebAuthnCredential;
  mode: "register" | "login";
  username: string;
}

export interface PasskeyAuthOptions {
  username: string;
  preferMode?: "login" | "register" | "auto";
  retryOnFailure?: boolean;
  maxRetries?: number;
}

export class PasskeyManager {
  private static instance: PasskeyManager | null = null;

  private constructor() {}

  static getInstance(): PasskeyManager {
    if (!PasskeyManager.instance) {
      PasskeyManager.instance = new PasskeyManager();
    }
    return PasskeyManager.instance;
  }

  private normalizeClientUrl(): string {
    if (!CLIENT_CONFIG.CLIENT_URL) {
      throw new Error(
        "VITE_CLIENT_URL is not set.\n\n" +
        "CLIENT_URL should be Circle's API endpoint from their console.\n" +
        "Get it from: Circle Modular Wallet Console Setup page\n" +
        "It should NOT be your frontend dev server URL (localhost:3000, localhost:5173)"
      );
    }

    let clientUrl = CLIENT_CONFIG.CLIENT_URL.trim();

    if (
      (clientUrl.includes("localhost:3000") || clientUrl.includes("localhost:5173") || clientUrl.includes("localhost:5174")) &&
      !clientUrl.includes("modular-sdk.circle.com")
    ) {
      console.error(
        "⚠️ ERROR: CLIENT_URL appears to be a frontend dev server!\n" +
        "CLIENT_URL must be Circle's API endpoint.\n" +
        "Expected format: https://modular-sdk.circle.com/v1/rpc/w3s/buidl\n" +
        "Get it from Circle's Modular Wallet Console.\n" +
        "Current CLIENT_URL:", clientUrl
      );
    }

    if (!clientUrl.startsWith("http")) {
      const isLocalhost =
        clientUrl.includes("localhost") ||
        clientUrl.includes("127.0.0.1") ||
        clientUrl.startsWith("localhost") ||
        clientUrl.startsWith("127.0.0.1");

      clientUrl = isLocalhost ? `http://${clientUrl}` : `https://${clientUrl}`;
    }

    try {
      new URL(clientUrl);
    } catch {
      throw new Error(
        `Invalid CLIENT_URL format: ${CLIENT_CONFIG.CLIENT_URL}\n\n` +
        "CLIENT_URL should be a valid URL pointing to Circle's API endpoint."
      );
    }

    return clientUrl;
  }

  private createPasskeyTransport() {
    if (!CLIENT_CONFIG.CLIENT_KEY) {
      throw new Error("VITE_CLIENT_KEY is not set in environment variables");
    }

    const clientUrl = this.normalizeClientUrl();

    if (
      clientUrl.includes("localhost:3000") ||
      clientUrl.includes("localhost:5173") ||
      clientUrl.includes("localhost:5174")
    ) {
      console.warn(
        "⚠️ CLIENT_URL appears to be a frontend dev server.\n" +
          "CLIENT_URL should point to your Circle API backend server, not the Vite dev server."
      );
    }

    return toPasskeyTransport(clientUrl, CLIENT_CONFIG.CLIENT_KEY);
  }

  private async attemptAuth(
    mode: WebAuthnMode,
    username: string
  ): Promise<WebAuthnCredential> {
    if (!username || username.trim() === "") {
      throw new Error("Username is required");
    }

    const normalizedUsername = username.trim();

    if (!/^[a-zA-Z0-9_-]{5,30}$/.test(normalizedUsername)) {
      throw new Error(
        "Username must be 5-30 characters and contain only letters, numbers, underscores, or hyphens"
      );
    }

    const passkeyTransport = this.createPasskeyTransport();

    try {
      const credential = await toWebAuthnCredential({
        transport: passkeyTransport,
        mode,
        username: normalizedUsername,
      });

      return credential;
    } catch (error) {
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();

        if (
          errorMsg.includes("notallowed") ||
          errorMsg.includes("timeout") ||
          errorMsg.includes("abort")
        ) {
          throw new Error("Passkey authentication was cancelled or timed out");
        }

        if (errorMsg.includes("invalid") && mode === WebAuthnMode.Login) {
          throw new Error(
            "No passkey found for this username.\n\n" +
            "If you're a new user, please use 'Create Account' instead."
          );
        }

        if (
          (errorMsg.includes("already exists") ||
            errorMsg.includes("duplicate") ||
            errorMsg.includes("user exists") ||
            errorMsg.includes("409")) &&
          mode === WebAuthnMode.Register
        ) {
          throw new Error(
            "A passkey already exists for this username.\n\n" +
            "Please use 'Sign In' instead, or choose a different username."
          );
        }

        if (
          errorMsg.includes("failed to fetch") ||
          errorMsg.includes("network")
        ) {
          throw new Error(
            "Network error: Unable to reach the authentication server. Please check your connection."
          );
        }

        if (errorMsg.includes("json") || errorMsg.includes("unexpected end")) {
          throw new Error(
            "Server error: Invalid response from authentication server. Please try again later."
          );
        }

        if (errorMsg.includes("404") || errorMsg.includes("not found")) {
          throw new Error(
            "Server endpoint not found. Please verify CLIENT_URL is correct."
          );
        }
      }

      throw error;
    }
  }

  async authenticate(
    options: PasskeyAuthOptions
  ): Promise<PasskeyAuthResult> {
    const { username, preferMode = "auto", retryOnFailure = true, maxRetries = 2 } = options;

    let lastError: Error | null = null;

    if (preferMode === "auto") {
      try {
        const credential = await this.attemptAuth(
          WebAuthnMode.Register,
          username
        );
        return {
          credential,
          mode: "register",
          username: username.trim(),
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (
          lastError.message.includes("already exists") ||
          lastError.message.includes("duplicate") ||
          lastError.message.includes("user exists")
        ) {
          console.log("User already exists, attempting login...");
        } else {
          console.log("Registration failed, trying login...");
        }
      }
    }

    if (preferMode === "login" || (preferMode === "auto" && lastError)) {
      try {
        const credential = await this.attemptAuth(
          WebAuthnMode.Login,
          username
        );
        return {
          credential,
          mode: "login",
          username: username.trim(),
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (preferMode === "auto") {
          throw new Error(
            "Unable to authenticate. Please try:\n" +
            "• 'Create Account' if you're new\n" +
            "• 'Sign In' if you already have an account"
          );
        }
        
        if (!retryOnFailure) {
          throw lastError;
        }
      }
    }

    if (preferMode === "register") {
      let attempts = 0;
      while (attempts < maxRetries) {
        try {
          const credential = await this.attemptAuth(
            WebAuthnMode.Register,
            username
          );
          return {
            credential,
            mode: "register",
            username: username.trim(),
          };
        } catch (error) {
          attempts++;
          lastError = error instanceof Error ? error : new Error(String(error));

          if (
            lastError.message.includes("cancelled") ||
            lastError.message.includes("timeout")
          ) {
            throw lastError;
          }

          if (attempts < maxRetries && retryOnFailure) {
            const delay = Math.min(1000 * attempts, 3000);
            console.log(`Retrying registration in ${delay}ms... (attempt ${attempts}/${maxRetries})`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }

          throw lastError;
        }
      }
    }

    throw lastError || new Error("Authentication failed");
  }

  static isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      typeof window.PublicKeyCredential !== "undefined" &&
      typeof navigator !== "undefined" &&
      typeof navigator.credentials !== "undefined" &&
      typeof navigator.credentials.create !== "undefined"
    );
  }

  static getSupportInfo(): {
    supported: boolean;
    platform: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let supported = true;
    let platform = false;

    if (typeof window === "undefined") {
      supported = false;
      reasons.push("Not running in a browser environment");
      return { supported, platform, reasons };
    }

    if (typeof window.PublicKeyCredential === "undefined") {
      supported = false;
      reasons.push("PublicKeyCredential API not available");
    }

    if (typeof navigator === "undefined" || !navigator.credentials) {
      supported = false;
      reasons.push("Credentials API not available");
    }

    if (supported && window.PublicKeyCredential) {
      try {
        if (
          typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable ===
          "function"
        ) {
          platform = true;
        }
      } catch {
      }
    }

    return { supported, platform, reasons };
  }
}

export const passkeyManager = PasskeyManager.getInstance();

