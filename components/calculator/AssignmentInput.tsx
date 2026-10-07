"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ScoringRule } from "@/types/course";
import type { AssignmentScoreInput, AssignmentScoreScale } from "@/types/scoring";
import { cn } from "@/lib/utils";

interface AssignmentInputProps {
  rule: ScoringRule;
  scores: AssignmentScoreInput[];
  onChange: (scores: AssignmentScoreInput[]) => void;
  errors?: Record<number, string>;
  scoreScale?: AssignmentScoreScale;
}

export function AssignmentInput({
  rule,
  scores,
  onChange,
  errors = {},
  scoreScale = 100,
}: AssignmentInputProps) {
  const maxRows = rule.totalAssignments;

  function handleScoreChange(index: number, value: string) {
    const parsed = value === "" ? 0 : parseFloat(value);
    const updated = scores.map((s, i) =>
      i === index ? { ...s, score: isNaN(parsed) ? 0 : parsed } : s
    );
    onChange(updated);
  }

  function addRow() {
    if (scores.length >= maxRows) return;
    const nextWeek =
      scores.length > 0 ? Math.max(...scores.map((s) => s.weekNumber)) + 1 : 1;
    onChange([
      ...scores,
      {
        weekNumber: nextWeek,
        score: 0,
        maxScore: scoreScale,
      },
    ]);
  }

  function removeRow(index: number) {
    if (scores.length <= 1) return;
    onChange(scores.filter((_, i) => i !== index));
  }

  const bestN = rule.bestAssignments;
  const totalMax = rule.totalAssignments;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">
          Assignment Scores
        </label>
        <span className="text-xs text-gray-400">
          Best {bestN} of {totalMax} count · Max {scoreScale} per assignment
        </span>
      </div>

      <div className="border border-gray-200 rounded overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[80px_1fr_80px_36px] bg-gray-50 px-3 py-2 border-b border-gray-100">
          <span className="text-xs font-medium text-gray-500">Week</span>
          <span className="text-xs font-medium text-gray-500">Score</span>
          <span className="text-xs font-medium text-gray-500 text-right">
            / {scoreScale}
          </span>
          <span />
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {scores.map((entry, idx) => (
            <div
              key={idx}
              className={cn(
                "grid grid-cols-[80px_1fr_80px_36px] items-center px-3 py-1.5 gap-2",
                errors[idx] && "bg-red-50"
              )}
            >
              {/* Week label */}
              <span className="text-sm text-gray-500">Week {entry.weekNumber}</span>

              {/* Score input */}
              <div>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={entry.maxScore ?? scoreScale}
                  step={0.5}
                  value={entry.score === 0 && !errors[idx] ? "" : entry.score}
                  onChange={(e) => handleScoreChange(idx, e.target.value)}
                  placeholder="0"
                  aria-label={`Week ${entry.weekNumber} score`}
                  className={cn(
                    "w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]",
                    errors[idx]
                      ? "border-red-400 bg-white"
                      : "border-gray-200 focus:border-[hsl(var(--primary))]"
                  )}
                />
                {errors[idx] && (
                  <p className="text-xs text-red-500 mt-0.5" role="alert">
                    {errors[idx]}
                  </p>
                )}
              </div>

              {/* Max score display */}
              <span className="text-xs text-gray-400 text-right">
                {entry.maxScore ?? scoreScale}
              </span>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeRow(idx)}
                disabled={scores.length <= 1}
                className="flex items-center justify-center w-7 h-7 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                aria-label={`Remove week ${entry.weekNumber}`}
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add row */}
      {scores.length < maxRows && (
        <button
          type="button"
          onClick={addRow}
          className="mt-2 flex items-center gap-1.5 text-sm text-[hsl(var(--primary))] hover:opacity-80 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          Add week {scores.length > 0 ? Math.max(...scores.map((s) => s.weekNumber)) + 1 : 1}
        </button>
      )}

      <p className="mt-2 text-xs text-gray-400">
        Enter scores out of {scoreScale}. Only the best {bestN} will count.
      </p>
    </div>
  );
}
