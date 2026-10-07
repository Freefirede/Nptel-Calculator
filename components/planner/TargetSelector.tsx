"use client";

import type { CertificateRule } from "@/types/course";
import { cn } from "@/lib/utils";

interface TargetSelectorProps {
  rules: CertificateRule[];
  value: string;
  onChange: (target: string) => void;
}

const CERT_ICONS: Record<string, string> = {
  "Elite + Gold": "🥇",
  "Elite + Silver": "🥈",
  "Elite": "⭐",
  "Successfully Completed": "✓",
};

export function TargetSelector({ rules, value, onChange }: TargetSelectorProps) {
  const sorted = [...rules].sort((a, b) => b.displayOrder - a.displayOrder);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Target Certificate
      </label>
      <div className="flex flex-col gap-2" role="radiogroup" aria-label="Target certificate">
        {sorted.map((rule) => {
          const selected = value === rule.name;
          return (
            <button
              key={rule.name}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(rule.name)}
              className={cn(
                "flex items-center justify-between px-4 py-3 border rounded text-sm text-left transition-colors",
                selected
                  ? "border-[hsl(var(--primary))] bg-red-50 text-[hsl(var(--primary))]"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
              )}
            >
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="text-base">
                  {CERT_ICONS[rule.name] ?? "○"}
                </span>
                <span className="font-medium">{rule.name}</span>
              </div>
              <span className="text-xs text-gray-400">
                Final ≥ {rule.minimumFinalScore}
                {rule.minimumExamScore !== undefined &&
                  ` · Exam ≥ ${rule.minimumExamScore}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
