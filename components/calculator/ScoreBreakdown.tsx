"use client";

import type { FinalScoreResult } from "@/types/scoring";
import type { ScoringRule } from "@/types/course";
import { cn } from "@/lib/utils";

interface ScoreBreakdownProps {
  result: FinalScoreResult;
  rule: ScoringRule;
}

export function ScoreBreakdown({ result, rule }: ScoreBreakdownProps) {
  const { assignmentResult, examResult } = result;

  return (
    <div className="space-y-3">
      {/* Assignment breakdown */}
      <div className="border border-gray-200 rounded overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-700">
            Assignment Breakdown
          </h3>
        </div>

        <div className="divide-y divide-gray-50">
          {/* Included */}
          {assignmentResult.includedScores.length > 0 && (
            <div className="px-4 py-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Included (Best {rule.bestAssignments})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                {assignmentResult.includedScores.map((entry) => (
                  <div
                    key={entry.weekNumber}
                    className="flex items-center justify-between px-2.5 py-1.5 bg-green-50 border border-green-100 rounded text-sm"
                  >
                    <span className="text-gray-600">W{entry.weekNumber}</span>
                    <span className="font-medium text-green-700">
                      {entry.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Excluded */}
          {assignmentResult.excludedScores.length > 0 && (
            <div className="px-4 py-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Excluded
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                {assignmentResult.excludedScores.map((entry) => (
                  <div
                    key={entry.weekNumber}
                    className="flex items-center justify-between px-2.5 py-1.5 bg-gray-50 border border-gray-100 rounded text-sm"
                  >
                    <span className="text-gray-400">W{entry.weekNumber}</span>
                    <span className="text-gray-400">{entry.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary row */}
          <div className="px-4 py-3 bg-gray-50 flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
            <div>
              <span className="text-gray-500">Average</span>{" "}
              <span className="font-medium text-gray-800">
                {assignmentResult.average.toFixed(2)} / 100
              </span>
            </div>
            <div>
              <span className="text-gray-500">Contribution</span>{" "}
              <span className="font-medium text-gray-800">
                {assignmentResult.weightedContribution.toFixed(2)}{" "}
                <span className="text-gray-400 font-normal">
                  ({Math.round(rule.assignmentWeight * 100)}% × {assignmentResult.average.toFixed(2)})
                </span>
              </span>
            </div>
            <RequirementBadge
              label="Minimum"
              met={assignmentResult.meetsMinimum}
              required={rule.minimumAssignmentScore}
            />
          </div>
        </div>
      </div>

      {/* Exam breakdown */}
      <div className="border border-gray-200 rounded overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-700">
            Exam Breakdown
          </h3>
        </div>
        <div className="px-4 py-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
          <div>
            <span className="text-gray-500">Score</span>{" "}
            <span className="font-medium text-gray-800">
              {examResult.score} / {rule.examMaxScore}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Contribution</span>{" "}
            <span className="font-medium text-gray-800">
              {examResult.weightedContribution.toFixed(2)}{" "}
              <span className="text-gray-400 font-normal">
                ({Math.round(rule.examWeight * 100)}% × {examResult.normalizedScore.toFixed(2)})
              </span>
            </span>
          </div>
          <RequirementBadge
            label="Minimum"
            met={examResult.meetsMinimum}
            required={rule.minimumExamScore}
          />
        </div>
      </div>

      {/* Formula */}
      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
        <span className="text-gray-400">Final score = </span>
        <span className="font-mono">
          {assignmentResult.average.toFixed(2)} × {rule.assignmentWeight}
        </span>
        <span className="text-gray-400"> + </span>
        <span className="font-mono">
          {examResult.normalizedScore.toFixed(2)} × {rule.examWeight}
        </span>
        <span className="text-gray-400"> = </span>
        <span className="font-semibold text-gray-900">
          {result.finalScore.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function RequirementBadge({
  label,
  met,
  required,
}: {
  label: string;
  met: boolean;
  required: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-gray-500">{label}</span>
      <span
        className={cn(
          "px-1.5 py-0.5 text-xs font-medium rounded",
          met
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
        )}
      >
        {met ? `PASSED (≥ ${required})` : `FAILED (< ${required})`}
      </span>
    </div>
  );
}
