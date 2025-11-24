export interface ArtLevel {
  level: number;
  artFile: string;
  txThreshold: number;
  label: string;
}

export const ART_LEVELS: ArtLevel[] = [
  { level: 1, artFile: "a.webp", txThreshold: 10_000, label: "Initiate" },
  { level: 2, artFile: "b.webp", txThreshold: 25_000, label: "Cadre" },
  { level: 3, artFile: "c.webp", txThreshold: 50_000, label: "Voyager" },
  { level: 4, artFile: "d.webp", txThreshold: 80_000, label: "Navigator" },
  { level: 5, artFile: "e.webp", txThreshold: 120_000, label: "Stellar Pilot" },
  { level: 6, artFile: "f.webp", txThreshold: 180_000, label: "Sector Commander" },
  { level: 7, artFile: "g.webp", txThreshold: 260_000, label: "Cosmic Sentinel" },
  { level: 8, artFile: "h.webp", txThreshold: 360_000, label: "Nebula Warden" },
  { level: 9, artFile: "i.webp", txThreshold: 520_000, label: "Arc Vanguard" },
  { level: 10, artFile: "j.webp", txThreshold: 1_000_000, label: "Chainbreaker Prime" },
];

export function getCurrentLevel(totalActions: bigint | number): number {
  const txCount = typeof totalActions === "bigint" ? Number(totalActions) : totalActions;
  
  for (let i = ART_LEVELS.length - 1; i >= 0; i--) {
    if (txCount >= ART_LEVELS[i].txThreshold) {
      return ART_LEVELS[i].level;
    }
  }
  
  return 0;
}

export function getLevelProgress(
  level: number,
  totalActions: bigint | number
): number {
  const txCount = typeof totalActions === "bigint" ? Number(totalActions) : totalActions;
  const levelData = ART_LEVELS.find((l) => l.level === level);
  
  if (!levelData) return 0;
  
  const prevLevel = ART_LEVELS.find((l) => l.level === level - 1);
  const prevThreshold = prevLevel?.txThreshold || 0;
  
  const levelRange = levelData.txThreshold - prevThreshold;
  const progressInLevel = Math.max(0, txCount - prevThreshold);
  
  const percentage = Math.min(100, (progressInLevel / levelRange) * 100);
  
  return Math.round(percentage);
}

export function getUnlockedLevels(totalActions: bigint | number): number[] {
  const txCount = typeof totalActions === "bigint" ? Number(totalActions) : totalActions;
  
  return ART_LEVELS.filter((level) => txCount >= level.txThreshold).map((l) => l.level);
}

export function getNextLevel(totalActions: bigint | number): ArtLevel | null {
  const currentLevel = getCurrentLevel(totalActions);
  
  if (currentLevel >= ART_LEVELS.length) {
    return null;
  }
  
  if (currentLevel === 0) {
    return ART_LEVELS[0];
  }
  
  if (currentLevel < ART_LEVELS.length) {
    return ART_LEVELS[currentLevel];
  }
  
  return null;
}

export function getArtPath(artFile: string): string {
  return `/art/${artFile}`;
}

