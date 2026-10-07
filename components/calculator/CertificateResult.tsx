"use client";

import { Award, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type { FinalScoreResult } from "@/types/scoring";
import type { ScoringRule } from "@/types/course";
import { cn } from "@/lib/utils";

interface CertificateResultProps {
  result: FinalScoreResult;
  rule: ScoringRule;
}

export function CertificateResult({ result, rule }: CertificateResultProps) {
  const { certificate, isEligible, failedRequirements, finalScore } = result;

  const certColor = getCertColor(certificate.name);

  return (
    <div className="space-y-3">
      {/* Main certificate card */}
      <div
        className={cn(
          "border rounded p-4",
          isEligible ? certColor.border : "border-gray-200"
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
              isEligible ? certColor.iconBg : "bg-gray-100"
            )}
          >
            {isEligible ? (
              <Award
                className={cn("w-5 h-5", certColor.iconColor)}
                aria-hidden="true"
              />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400" aria-hidden="true" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Certificate
              </span>
              <span
                className={cn(
                  "px-2 py-0.5 text-xs font-semibold rounded uppercase tracking-wide",
                  isEligible ? certColor.badge : "bg-gray-100 text-gray-500"
                )}
              >
                {certificate.name}
              </span>
            </div>
            <div className="mt-1 text-2xl font-bold text-gray-900 tabular-nums">
              {finalScore.toFixed(2)}
              <span className="text-base font-normal text-gray-400 ml-1">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <RequirementRow
          label="Assignment"
          passed={result.assignmentResult.meetsMinimum}
          required={rule.minimumAssignmentScore}
          actual={result.assignmentResult.average}
          unit="avg"
        />
        <RequirementRow
          label="Exam"
          passed={result.examResult.meetsMinimum}
          required={rule.minimumExamScore}
          actual={result.examResult.normalizedScore}
          unit="score"
        />
        <RequirementRow
          label="Final"
          passed={finalScore >= rule.minimumFinalScore}
          required={rule.minimumFinalScore}
          actual={finalScore}
          unit="score"
        />
      </div>

      {/* Failed requirement warnings */}
      {failedRequirements.length > 0 && (
        <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded text-sm">
          <AlertTriangle
            className="w-4 h-4 text-red-500 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <p className="font-medium text-red-700">
              Not eligible for a certificate
            </p>
            <ul className="mt-1 space-y-0.5">
              {failedRequirements.map((req) => (
                <li key={req.type} className="text-red-600">
                  {req.label}: {req.actual.toFixed(1)} / {req.required} required
                  (short by {req.shortfall.toFixed(1)})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Certificate scale */}
      <CertificateScale rule={rule} finalScore={finalScore} />
    </div>
  );
}

function RequirementRow({
  label,
  passed,
  required,
  actual,
  unit,
}: {
  label: string;
  passed: boolean;
  required: number;
  actual: number;
  unit: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 border rounded text-sm",
        passed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
      )}
    >
      {passed ? (
        <CheckCircle className="w-4 h-4 text-green-600 shrink-0" aria-hidden="true" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500 shrink-0" aria-hidden="true" />
      )}
      <div className="min-w-0">
        <div className="text-xs text-gray-500">{label} {unit}</div>
        <div
          className={cn(
            "font-medium",
            passed ? "text-green-700" : "text-red-700"
          )}
        >
          {actual.toFixed(1)} <span className="font-normal text-gray-400">/ {required}</span>
        </div>
      </div>
    </div>
  );
}

function CertificateScale({
  rule,
  finalScore,
}: {
  rule: ScoringRule;
  finalScore: number;
}) {
  const certs = [...rule.certificateRules].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
        Certificate thresholds
      </p>
      <div className="flex flex-col gap-1">
        {certs.map((cert) => {
          const active = finalScore >= cert.minimumFinalScore;
          return (
            <div
              key={cert.name}
              className={cn(
                "flex items-center justify-between px-3 py-2 border rounded text-sm",
                active
                  ? getCertColor(cert.name).border + " " + getCertColor(cert.name).rowBg
                  : "border-gray-100 bg-gray-50"
              )}
            >
              <span
                className={cn(
                  "font-medium",
                  active ? getCertColor(cert.name).text : "text-gray-400"
                )}
              >
                {cert.name}
              </span>
              <span className="text-xs text-gray-400">
                ≥ {cert.minimumFinalScore}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getCertColor(name: string) {
  if (name.includes("Gold")) {
    return {
      border: "border-yellow-300",
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
      badge: "bg-yellow-100 text-yellow-800",
      rowBg: "bg-yellow-50",
      text: "text-yellow-700",
    };
  }
  if (name.includes("Silver")) {
    return {
      border: "border-blue-200",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      badge: "bg-blue-100 text-blue-800",
      rowBg: "bg-blue-50",
      text: "text-blue-700",
    };
  }
  if (name.includes("Elite")) {
    return {
      border: "border-purple-200",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      badge: "bg-purple-100 text-purple-800",
      rowBg: "bg-purple-50",
      text: "text-purple-700",
    };
  }
  if (name.includes("Completed")) {
    return {
      border: "border-green-200",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      badge: "bg-green-100 text-green-800",
      rowBg: "bg-green-50",
      text: "text-green-700",
    };
  }
  return {
    border: "border-gray-200",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-500",
    badge: "bg-gray-100 text-gray-500",
    rowBg: "bg-gray-50",
    text: "text-gray-500",
  };
}
