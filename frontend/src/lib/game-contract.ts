import {
  encodeFunctionData,
  type Address,
  type Hex,
  type PublicClient,
} from "viem";
import { CONTRACT_ADDRESSES } from "../config/chain";

export interface PlayerStats {
  xp: bigint;
  totalActions: bigint;
  dodges: bigint;
  scans: bigint;
  boosts: bigint;
  claims: bigint;
  referralXp: bigint;
  totalClaimedXp: bigint;
  lastActionBlock: bigint;
}

export enum ActionType {
  COLLECT = 0,
  DODGE = 1,
  SCAN = 2,
  BOOST = 3,
  CLAIM = 4,
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;
export const EMPTY_METADATA = "0x" as Hex;

export const GAME_ABI = [
  {
    inputs: [
      { internalType: "uint8", name: "action", type: "uint8" },
      { internalType: "bytes", name: "metadata", type: "bytes" },
      { internalType: "address", name: "referrer", type: "address" },
    ],
    name: "performAction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "player", type: "address" }],
    name: "getPlayerStats",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "xp", type: "uint256" },
          { internalType: "uint256", name: "totalActions", type: "uint256" },
          { internalType: "uint256", name: "dodges", type: "uint256" },
          { internalType: "uint256", name: "scans", type: "uint256" },
          { internalType: "uint256", name: "boosts", type: "uint256" },
          { internalType: "uint256", name: "claims", type: "uint256" },
          { internalType: "uint256", name: "referralXp", type: "uint256" },
          { internalType: "uint256", name: "totalClaimedXp", type: "uint256" },
          { internalType: "uint256", name: "lastActionBlock", type: "uint256" },
        ],
        internalType: "struct ArcStarShip.PlayerStats",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "referrerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function encodePerformAction(
  action: ActionType,
  metadata: Hex,
  referrer: Address
) {
  return encodeFunctionData({
    abi: GAME_ABI,
    functionName: "performAction",
    args: [action, metadata, referrer],
  });
}

export async function getPlayerStats(
  publicClient: PublicClient,
  playerAddress: Address
): Promise<PlayerStats> {
  const stats = (await publicClient.readContract({
    address: CONTRACT_ADDRESSES.GAME as Address,
    abi: GAME_ABI,
    functionName: "getPlayerStats",
    args: [playerAddress],
  })) as PlayerStats;

  return stats;
}

