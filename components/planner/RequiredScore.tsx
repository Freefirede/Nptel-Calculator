"use client";

import { AlertTriangle, CheckCircle, XCircle, Target } from "lucide-react";
import type { RequiredExamScoreResult } from "@/types/scoring";
import { cn } from "@/lib/utils";

interface RequiredScoreProps {
  results: RequiredExamScoreResult[];
  currentTarget?: string;
  assignmentWeightPercent?: number;
}

export function RequiredScore({
  results,
  currentTarget,
  assignmentWeightPercent = 25,
}: RequiredScoreProps) {
  if (results.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Required Exam Scores
      </h3>
      <div className="flex flex-col gap-2">
        {results.map((r) => {
          const isTarget = r.targetCertificate === currentTarget;
          return (
            <RequiredScoreCard
              key={r.targetCertificate}
              result={r}
              isTarget={isTarget}
              assignmentWeight={assignmentWeightPercent}
            />
          );
        })}
      </div>
    </div>
  );
}

function RequiredScoreCard({
  result,
  isTarget,
  assignmentWeight,
}: {
  result: RequiredExamScoreResult;
  isTarget: boolean;
  assignmentWeight: number;
}) {
  const { isAchievable, requiredExamScore, targetCertificate, notAchievableReason } =
    result;

  return (
    <div
      className={cn(
        "border rounded p-3",
        isTarget
          ? "border-[hsl(var(--primary))] bg-red-50"
          : isAchievable
          ? "border-gray-200"
          : "border-gray-100 bg-gray-50"
      )}
      aria-current={isTarget ? "true" : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {isTarget ? (
            <Target
              className="w-4 h-4 text-[hsl(var(--primary))] shrink-0"
              aria-hidden="true"
            />
          ) : isAchievable ? (
            <CheckCircle
              className="w-4 h-4 text-green-500 shrink-0"
              aria-hidden="true"
            />
          ) : (
            <XCircle
              className="w-4 h-4 text-gray-300 shrink-0"
              aria-hidden="true"
            />
          )}
          <span
            className={cn(
              "text-sm font-medium",
              isTarget
                ? "text-[hsl(var(--primary))]"
                : isAchievable
                ? "text-gray-800"
                : "text-gray-400"
            )}
          >
            {targetCertificate}
          </span>
        </div>

        {/* Required score badge */}
        <div className="shrink-0 text-right">
          {isAchievable && requiredExamScore !== null ? (
            <div>
              <span
                className={cn(
                  "text-xl font-bold tabular-nums",
                  isTarget
                    ? "text-[hsl(var(--primary))]"
                    : "text-gray-800"
                )}
              >
                {requiredExamScore}
              </span>
              <span className="text-xs text-gray-400 ml-1">/ 100</span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">Not achievable</span>
          )}
        </div>
      </div>

      {/* Sub info */}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <span>
          Assignment contribution:{" "}
          <strong className="text-gray-700">
            {result.currentAssignmentContribution.toFixed(2)}
          </strong>
          / {assignmentWeight}
        </span>
        <span>
          Max possible:{" "}
          <strong className="text-gray-700">
            {result.maxPossibleFinalScore.toFixed(2)}
          </strong>
        </span>
      </div>

      {/* Failure reason */}
      {!isAchievable && notAchievableReason && (
        <div className="mt-2 flex items-start gap-1.5 text-xs text-gray-500">
          <AlertTriangle
            className="w-3.5 h-3.5 shrink-0 mt-0.5 text-orange-400"
            aria-hidden="true"
          />
          <span>{notAchievableReason}</span>
        </div>
      )}
    </div>
  );
}
