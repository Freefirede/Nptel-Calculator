/**
 * Certificate eligibility calculation engine.
 *
 * Certificate rules are per-course and fully configurable.
 * No global hard-coded thresholds.
 */

import type { CertificateRule } from "@/types/course";
import type { CertificateResult } from "@/types/scoring";

const NOT_ELIGIBLE: CertificateResult = {
  name: "Not Eligible",
  isEligible: false,
  displayOrder: 0,
};

/**
 * Determine which certificate category the student has earned.
 *
 * Evaluates all certificate rules sorted by displayOrder descending
 * (highest award first) and returns the first one the student qualifies for.
 *
 * @param finalScore     - The student's final weighted score (0–100)
 * @param assignmentAvg  - The student's assignment average (0–100)
 * @param examScore      - The student's exam score (0–100)
 * @param rules          - Course-specific certificate rules
 * @param meetsMinimums  - Whether assignment/exam minimums were met
 */
export function calculateCertificate(
  finalScore: number,
  assignmentAvg: number,
  examScore: number,
  rules: CertificateRule[],
  meetsMinimums: boolean
): CertificateResult {
  if (!meetsMinimums) return NOT_ELIGIBLE;

  // Sort highest award first
  const sorted = [...rules].sort(
    (a, b) => b.displayOrder - a.displayOrder
  );

  for (const rule of sorted) {
    if (!meetsRule(finalScore, assignmentAvg, examScore, rule)) continue;
    return {
      name: rule.name,
      isEligible: true,
      displayOrder: rule.displayOrder,
    };
  }

  return NOT_ELIGIBLE;
}

function meetsRule(
  finalScore: number,
  assignmentAvg: number,
  examScore: number,
  rule: CertificateRule
): boolean {
  if (finalScore < rule.minimumFinalScore) return false;
  if (
    rule.minimumAssignmentScore !== undefined &&
    assignmentAvg < rule.minimumAssignmentScore
  )
    return false;
  if (
    rule.minimumExamScore !== undefined &&
    examScore < rule.minimumExamScore
  )
    return false;
  return true;
}

/**
 * Get a sorted list of all certificate thresholds for display.
 * Returns rules ordered from lowest to highest award.
 */
export function getCertificateThresholds(
  rules: CertificateRule[]
): CertificateRule[] {
  return [...rules].sort((a, b) => a.displayOrder - b.displayOrder);
}
