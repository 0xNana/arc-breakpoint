import {
  encodeFunctionData,
  type Address,
  type PublicClient,
} from "viem";
import { CONTRACT_ADDRESSES } from "../config/chain";

export const STAKING_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unstake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getCurrentMultiplier",
    outputs: [{ internalType: "uint256", name: "multiplier", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "hasActiveBoost",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export enum StakingTier {
  TIER_1 = 25_000_000, // 25 USDC (6 decimals)
  TIER_2 = 50_000_000, // 50 USDC
  TIER_3 = 100_000_000, // 100 USDC
}

export const STAKING_TIERS: Array<{ label: string; amount: bigint }> = [
  { label: "25 USDC · 1.2x", amount: BigInt(StakingTier.TIER_1) },
  { label: "50 USDC · 1.5x", amount: BigInt(StakingTier.TIER_2) },
  { label: "100 USDC · 2.0x", amount: BigInt(StakingTier.TIER_3) },
];

export function encodeStake(amount: bigint) {
  return encodeFunctionData({
    abi: STAKING_ABI,
    functionName: "stake",
    args: [amount],
  });
}

export function encodeUnstake() {
  return encodeFunctionData({
    abi: STAKING_ABI,
    functionName: "unstake",
    args: [],
  });
}

export async function getCurrentMultiplier(
  publicClient: PublicClient,
  userAddress: Address
): Promise<bigint> {
  if (!CONTRACT_ADDRESSES.STAKING) {
    return BigInt(1e18);
  }

  try {
    const multiplier = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.STAKING as Address,
      abi: STAKING_ABI,
      functionName: "getCurrentMultiplier",
      args: [userAddress],
    });

    return multiplier as bigint;
  } catch (error) {
    console.error("Failed to get multiplier:", error);
    return BigInt(1e18);
  }
}

