"use client";

import type { AssignmentScoreScale } from "@/types/scoring";

interface ScoreScaleSelectorProps {
  value: AssignmentScoreScale;
  onChange: (value: AssignmentScoreScale) => void;
}

export function ScoreScaleSelector({
  value,
  onChange,
}: ScoreScaleSelectorProps) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-xs font-medium text-gray-600">
        Enter assignment marks out of
      </legend>
      <div className="grid grid-cols-2 gap-2">
        {[25, 100].map((scale) => (
          <button
            key={scale}
            type="button"
            onClick={() => onChange(scale as AssignmentScoreScale)}
            aria-pressed={value === scale}
            className={`rounded border px-3 py-2 text-xs ${
              value === scale
                ? "border-[hsl(var(--primary))] bg-red-50 text-[hsl(var(--primary))]"
                : "border-gray-200 text-gray-600"
            }`}
          >
            {scale} marks
          </button>
        ))}
      </div>
    </fieldset>
  );
}
