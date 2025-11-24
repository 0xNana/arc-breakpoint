import {
  toModularTransport,
  toCircleSmartAccount,
  WebAuthnMode,
} from "@circle-fin/modular-wallets-core";
import { createPublicClient, type PublicClient, type Transport } from "viem";
import {
  createBundlerClient,
  toWebAuthnAccount,
  type BundlerClient,
  type SmartAccount,
} from "viem/account-abstraction";
import { ARC_TESTNET, CLIENT_CONFIG } from "../config/chain";
import { passkeyManager, type PasskeyAuthResult } from "./passkey-manager";

// Re-export WebAuthnMode and passkey manager for convenience
export { WebAuthnMode, passkeyManager };
export type { PasskeyAuthResult };

export interface WalletState {
  isConnected: boolean;
  smartAccount: SmartAccount | null;
  bundlerClient: BundlerClient | null;
  publicClient: PublicClient | null;
  address: string | null;
}

/**
 * Authenticate with passkey (robust implementation)
 * Automatically handles login/register logic
 */
export async function authenticatePasskey(
  username: string,
  preferMode: "login" | "register" | "auto" = "auto"
): Promise<PasskeyAuthResult> {
  return await passkeyManager.authenticate({
    username,
    preferMode,
    retryOnFailure: true,
    maxRetries: 2,
  });
}

/**
 * Create modular transport for Arc Testnet
 */
export function createModularTransport() {
  if (!CLIENT_CONFIG.CLIENT_KEY) {
    throw new Error("VITE_CLIENT_KEY is not set in environment variables");
  }
  if (!CLIENT_CONFIG.CLIENT_URL) {
    throw new Error("VITE_CLIENT_URL is not set in environment variables");
  }

  // Ensure URL has protocol
  // Use http:// for localhost, https:// for others
  let clientUrl = CLIENT_CONFIG.CLIENT_URL;
  if (!clientUrl.startsWith("http")) {
    const isLocalhost = 
      clientUrl.includes("localhost") || 
      clientUrl.includes("127.0.0.1") ||
      clientUrl.startsWith("localhost") ||
      clientUrl.startsWith("127.0.0.1");
    
    clientUrl = isLocalhost 
      ? `http://${clientUrl}` 
      : `https://${clientUrl}`;
  }

  return toModularTransport(
    `${clientUrl}/arcTestnet`,
    CLIENT_CONFIG.CLIENT_KEY
  );
}

/**
 * Create public client for Arc Testnet
 */
export function createArcPublicClient() {
  const transport = createModularTransport();
  
  return createPublicClient({
    chain: ARC_TESTNET,
    transport: transport as Transport,
  }) as PublicClient;
}

/**
 * Create Circle Smart Account and Bundler Client
 * Following Circle Modular Wallets documentation pattern
 */
export async function createSmartAccount(
  authResult: PasskeyAuthResult
): Promise<{
  smartAccount: SmartAccount;
  bundlerClient: BundlerClient;
  publicClient: PublicClient;
  address: `0x${string}`;
}> {
  try {
    // Step 1: Create public client (following docs pattern)
    const publicClient = createArcPublicClient();

    // Step 2: Create Circle Smart Account with passkey credential
    // Following: toCircleSmartAccount({ client, owner: toWebAuthnAccount({ credential }) })
    const smartAccount = await toCircleSmartAccount({
      client: publicClient,
      owner: toWebAuthnAccount({
        credential: authResult.credential,
      }),
    });

    // Step 3: Create bundler client
    // Following the working example: createBundlerClient({ chain, transport })
    // The account is passed explicitly when calling sendUserOperation
    const bundlerClient = createBundlerClient({
      chain: ARC_TESTNET,
      transport: createModularTransport() as Transport,
    });

    return {
      smartAccount,
      bundlerClient,
      publicClient,
      address: smartAccount.address,
    };
  } catch (error) {
    console.error("Failed to create smart account:", error);
    
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      
      if (errorMsg.includes("network") || errorMsg.includes("fetch")) {
        throw new Error(
          "Network error while creating smart account. Please check your connection and CLIENT_URL."
        );
      }
      
      if (errorMsg.includes("invalid") || errorMsg.includes("credential")) {
        throw new Error(
          "Invalid passkey credential. Please try authenticating again."
        );
      }
    }
    
    throw error;
  }
}

