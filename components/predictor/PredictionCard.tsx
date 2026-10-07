"use client";

import { Info } from "lucide-react";
import type { PredictionResult } from "@/types/prediction";
import type { CertificateResult, RequiredExamScoreResult } from "@/types/scoring";
import type { ScoringRule } from "@/types/course";
import { ConfidenceIndicator } from "./ConfidenceIndicator";
import { cn } from "@/lib/utils";

interface PredictionCardProps {
  prediction: PredictionResult & { estimatedFinalScore: number };
  certificate: CertificateResult;
  assignmentAverage: number;
  scoringRule: ScoringRule;
  goalScores: RequiredExamScoreResult[];
}

export function PredictionCard({
  prediction,
  certificate,
  assignmentAverage,
  scoringRule,
  goalScores,
}: PredictionCardProps) {
  const {
    estimatedExamScore,
    estimatedFinalScore,
    estimatedRangeLow,
    estimatedRangeHigh,
    confidence,
    confidenceScore,
    reasoning,
    disclaimer,
  } = prediction;

  return (
    <section aria-label="Predicted scores" className="space-y-4">
      {/* Estimated performance banner */}
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded text-sm">
        <Info className="w-4 h-4 text-blue-500 shrink-0" aria-hidden="true" />
        <span className="text-blue-700 font-medium">Predicted Scores</span>
        <span className="text-blue-600 text-xs">— not an official NPTEL result</span>
      </div>

      <div className="border border-green-200 bg-green-50 rounded p-4">
        <div className="text-xs text-green-700">Likely certificate at the predicted score</div>
        <div className="mt-1 text-lg font-semibold text-green-800">
          {certificate.isEligible ? certificate.name : "Not eligible yet"}
        </div>
        <p className="mt-1 text-xs text-green-700">
          Based on an assignment average of {assignmentAverage.toFixed(1)}/100 and
          a predicted exam score of {estimatedExamScore}/100.
        </p>
      </div>

      <div className="border border-gray-200 rounded p-4">
        <h4 className="text-sm font-medium text-gray-700">
          Exam score needed for each goal
        </h4>
        <p className="mt-1 text-xs text-gray-500">
          Based on your current assignment average. Exam scores are out of {scoringRule.examMaxScore}.
        </p>
        <div className="mt-3 divide-y divide-gray-100">
          {goalScores.map((goal) => (
            <div
              key={goal.targetCertificate}
              className="flex items-center justify-between gap-3 py-2 text-sm"
            >
              <span className="text-gray-700">{goal.targetCertificate}</span>
              {goal.isAchievable && goal.requiredExamScore !== null ? (
                <span className="font-semibold tabular-nums text-gray-900">
                  {goal.requiredExamScore} / {scoringRule.examMaxScore}
                </span>
              ) : (
                <span className="text-xs text-gray-400">Not achievable</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Score estimates */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <EstimateCard
          label="Estimated Exam Score"
          value={`${estimatedExamScore}`}
          unit="/ 100"
          primary
        />
        <EstimateCard
          label="Estimated Final Score"
          value={estimatedFinalScore.toFixed(1)}
          unit="/ 100"
          primary
        />
        <EstimateCard
          label="Estimated Range"
          value={`${estimatedRangeLow}–${estimatedRangeHigh}`}
          unit=""
        />
        <div className="border border-gray-200 rounded p-3 flex flex-col gap-1.5">
          <div className="text-xs text-gray-500">Confidence</div>
          <ConfidenceIndicator level={confidence} score={confidenceScore} />
        </div>
      </div>

      {/*       How these scores were predicted */}
      {reasoning.length > 0 && (
        <div className="border border-gray-100 rounded p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            How this was estimated
          </h4>
          <ul className="space-y-1.5">
            {reasoning.map((r, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <span
                  className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0"
                  aria-hidden="true"
                />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-3">
        {disclaimer}
      </p>
    </section>
  );
}

function EstimateCard({
  label,
  value,
  unit,
  primary,
}: {
  label: string;
  value: string;
  unit: string;
  primary?: boolean;
}) {
  return (
    <div
      className={cn(
        "border rounded p-3",
        primary ? "border-blue-200 bg-blue-50" : "border-gray-200"
      )}
    >
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div
        className={cn(
          "text-xl font-bold tabular-nums",
          primary ? "text-blue-700" : "text-gray-800"
        )}
      >
        {value}
        {unit && (
          <span className="text-xs font-normal text-gray-400 ml-1">{unit}</span>
        )}
      </div>
    </div>
  );
}
