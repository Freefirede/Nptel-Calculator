"use client";

import type { ConfidenceLevel } from "@/types/prediction";
import { cn } from "@/lib/utils";

interface ConfidenceIndicatorProps {
  level: ConfidenceLevel;
  score: number; // 0–100
}

const CONFIG: Record<
  ConfidenceLevel,
  { label: string; color: string; bg: string; border: string; bars: number }
> = {
  high: {
    label: "High",
    color: "text-green-700",
    bg: "bg-green-500",
    border: "border-green-200",
    bars: 4,
  },
  medium: {
    label: "Medium",
    color: "text-yellow-700",
    bg: "bg-yellow-400",
    border: "border-yellow-200",
    bars: 3,
  },
  low: {
    label: "Low",
    color: "text-orange-700",
    bg: "bg-orange-400",
    border: "border-orange-200",
    bars: 2,
  },
  insufficient: {
    label: "Insufficient Data",
    color: "text-gray-500",
    bg: "bg-gray-300",
    border: "border-gray-200",
    bars: 1,
  },
};

export function ConfidenceIndicator({ level, score }: ConfidenceIndicatorProps) {
  const config = CONFIG[level];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1.5 border rounded",
        config.border
      )}
      aria-label={`Confidence: ${config.label} (${score}%)`}
    >
      {/* Signal bars */}
      <div className="flex items-end gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={cn(
              "w-1.5 rounded-sm",
              bar <= config.bars ? config.bg : "bg-gray-200"
            )}
            style={{ height: `${bar * 4 + 4}px` }}
          />
        ))}
      </div>

      <span className={cn("text-xs font-medium", config.color)}>
        {config.label} confidence
      </span>

      <span className="text-xs text-gray-400">({score}%)</span>
    </div>
  );
}
