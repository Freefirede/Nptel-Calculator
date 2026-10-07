"use client";

import type { ScoringRule } from "@/types/course";
import { cn } from "@/lib/utils";

interface ExamInputProps {
  rule: ScoringRule;
  value: number;
  onChange: (score: number) => void;
  error?: string;
}

export function ExamInput({ rule, value, onChange, error }: ExamInputProps) {
  const max = rule.examMaxScore;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <label
          htmlFor="exam-score-input"
          className="text-sm font-medium text-gray-700"
        >
          Exam Score
        </label>
        <span className="text-xs text-gray-400">
          Weight: {Math.round(rule.examWeight * 100)}% · Min: {rule.minimumExamScore} / {max}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <input
          id="exam-score-input"
          type="number"
          inputMode="decimal"
          min={0}
          max={max}
          step={0.5}
          value={value === 0 ? "" : value}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            onChange(isNaN(v) ? 0 : Math.min(max, Math.max(0, v)));
          }}
          placeholder={`0 – ${max}`}
          aria-label={`Exam score out of ${max}`}
          aria-describedby={error ? "exam-score-error" : undefined}
          className={cn(
            "w-full max-w-xs px-3 py-2 text-sm border rounded",
            "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-1",
            error ? "border-red-400 bg-red-50" : "border-gray-300"
          )}
        />
        <span className="text-sm text-gray-400 shrink-0">/ {max}</span>
      </div>

      {error && (
        <p id="exam-score-error" className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      <p className="mt-1.5 text-xs text-gray-400">
        Proctored exam score. Minimum passing mark: {rule.minimumExamScore} / {max}.
      </p>
    </div>
  );
}
