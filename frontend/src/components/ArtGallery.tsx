import { useMemo } from "react";
import { useGameStore } from "../store/gameStore";
import {
  ART_LEVELS,
  getCurrentLevel,
  getLevelProgress,
  getUnlockedLevels,
  getNextLevel,
  getArtPath,
  type ArtLevel,
} from "../lib/art-levels";

interface ArtCardProps {
  level: ArtLevel;
  progress: number;
  isUnlocked: boolean;
  isCurrent: boolean;
}

function ArtCard({ level, progress, isUnlocked, isCurrent }: ArtCardProps) {
  const revealPercentage = isUnlocked ? 100 : progress;
  const blurAmount = Math.max(0, 20 - (revealPercentage / 100) * 20); // 20px blur at 0%, 0px at 100%
  const opacity = Math.max(0.3, 0.3 + (revealPercentage / 100) * 0.7); // 0.3 at 0%, 1.0 at 100%

  return (
    <div
      style={{
        position: "relative",
        borderRadius: "16px",
        overflow: "hidden",
        background: "rgba(255,255,255,0.03)",
        border: isCurrent
          ? "2px solid #facc15"
          : isUnlocked
          ? "2px solid #10b981"
          : "2px solid rgba(255,255,255,0.1)",
        aspectRatio: "1",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Art Image with Progressive Reveal */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <img
          src={getArtPath(level.artFile)}
          alt={level.label}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: `blur(${blurAmount}px)`,
            opacity,
            transition: "filter 0.3s ease, opacity 0.3s ease",
          }}
        />
        
        {/* Progress Overlay */}
        {!isUnlocked && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(to top, rgba(0,0,0,0.8) ${100 - revealPercentage}%, transparent ${100 - revealPercentage}%)`,
              display: "flex",
              alignItems: "flex-end",
              padding: "1rem",
            }}
          >
            <div style={{ width: "100%" }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  height: "8px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "linear-gradient(90deg, #facc15, #f59e0b)",
                    height: "100%",
                    width: `${revealPercentage}%`,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <p
                style={{
                  margin: "0.5rem 0 0",
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.9)",
                  textAlign: "center",
                }}
              >
                {revealPercentage}% revealed
              </p>
            </div>
          </div>
        )}

        {/* Unlocked Badge */}
        {isUnlocked && (
          <div
            style={{
              position: "absolute",
              top: "0.5rem",
              right: "0.5rem",
              background: "rgba(16,185,129,0.9)",
              color: "white",
              padding: "0.25rem 0.5rem",
              borderRadius: "8px",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            ✓ Unlocked
          </div>
        )}

        {/* Current Level Badge */}
        {isCurrent && !isUnlocked && (
          <div
            style={{
              position: "absolute",
              top: "0.5rem",
              left: "0.5rem",
              background: "rgba(250,204,21,0.9)",
              color: "#000",
              padding: "0.25rem 0.5rem",
              borderRadius: "8px",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            Level {level.level}
          </div>
        )}
      </div>

      {/* Level Info */}
      <div
        style={{
          padding: "0.75rem",
          background: "rgba(0,0,0,0.4)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "white",
          }}
        >
          {level.label}
        </p>
        <p
          style={{
            margin: "0.25rem 0 0",
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {isUnlocked
            ? `Unlocked at ${level.txThreshold} TXs`
            : `${level.txThreshold} TXs to unlock`}
        </p>
      </div>
    </div>
  );
}

export function ArtGallery() {
  const { profile } = useGameStore();

  const totalActions = profile?.totalActions || 0n;
  const currentLevel = useMemo(
    () => getCurrentLevel(totalActions),
    [totalActions]
  );
  const unlockedLevels = useMemo(
    () => getUnlockedLevels(totalActions),
    [totalActions]
  );
  const nextLevel = useMemo(
    () => getNextLevel(totalActions),
    [totalActions]
  );

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        borderRadius: "16px",
        padding: "1.5rem",
        border: "1px solid rgba(255,255,255,0.1)",
        minHeight: "400px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Art Gallery</h2>
          <p
            style={{
              margin: "0.25rem 0 0",
              fontSize: "0.9rem",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            Unlock art by making transactions. Each click reveals more!
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600 }}>
            Level {currentLevel} / {ART_LEVELS.length}
          </p>
          <p
            style={{
              margin: "0.25rem 0 0",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            {Number(totalActions)} total transactions
          </p>
        </div>
      </div>

      {nextLevel && (
        <div
          style={{
            background: "rgba(250,204,21,0.15)",
            border: "1px solid rgba(250,204,21,0.3)",
            borderRadius: "12px",
            padding: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#facc15" }}>
            🎯 Next: <strong>{nextLevel.label}</strong> —{" "}
            {nextLevel.txThreshold - Number(totalActions)} more transactions
            needed
          </p>
        </div>
      )}

      <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "1.25rem",
        paddingBottom: "1rem",
      }}
      >
        {ART_LEVELS.map((level) => {
          const progress = getLevelProgress(level.level, totalActions);
          const isUnlocked = unlockedLevels.includes(level.level);
          const isCurrent = level.level === currentLevel + 1;

          return (
            <ArtCard
              key={level.level}
              level={level}
              progress={progress}
              isUnlocked={isUnlocked}
              isCurrent={isCurrent}
            />
          );
        })}
      </div>
    </div>
  );
}

