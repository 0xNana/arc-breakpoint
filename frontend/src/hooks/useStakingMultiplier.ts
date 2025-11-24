import { useEffect, useState } from "react";
import { useWalletStore } from "../store/walletStore";
import { getCurrentMultiplier } from "../lib/staking-contract";

/**
 * Hook to fetch and cache staking multiplier
 */
export function useStakingMultiplier() {
  const { publicClient, address } = useWalletStore();
  const [multiplier, setMultiplier] = useState<bigint>(BigInt(1e18)); // 1x default
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!publicClient || !address) {
      setMultiplier(BigInt(1e18));
      return;
    }

    const fetchMultiplier = async () => {
      setIsLoading(true);
      try {
        const mult = await getCurrentMultiplier(publicClient, address);
        setMultiplier(mult);
      } catch (error) {
        console.error("Failed to fetch multiplier:", error);
        setMultiplier(BigInt(1e18));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMultiplier();

    // Refresh every 30 seconds
    const interval = setInterval(fetchMultiplier, 30000);

    return () => clearInterval(interval);
  }, [publicClient, address]);

  return { multiplier, isLoading };
}

