/**
 * Assignment score calculation engine.
 *
 * Handles:
 *  - Normalizing raw scores to 0–100
 *  - Best-N selection
 *  - Average calculation
 *  - Weighted contribution
 *  - Minimum requirement check
 */

import type { ScoringRule } from "@/types/course";
import type {
  AssignmentScoreEntry,
  AssignmentScoreInput,
  AssignmentScoreResult,
} from "@/types/scoring";

/**
 * Normalize a raw score to 0–100 based on the assignment's maximum marks.
 */
export function normalizeScore(
  rawScore: number,
  maxScore: number
): number {
  if (maxScore <= 0) return 0;
  return Math.min(100, Math.max(0, (rawScore / maxScore) * 100));
}

/**
 * Calculate assignment score using the course's scoring rule.
 *
 * Applies best-N selection and computes the weighted contribution.
 */
export function calculateAssignmentScore(
  rule: ScoringRule,
  inputs: AssignmentScoreInput[]
): AssignmentScoreResult {
  const maxScore = rule.assignmentMaxScore ?? 100;

  // Build entries with normalized scores
  const allEntries: AssignmentScoreEntry[] = inputs.map((input) => ({
    weekNumber: input.weekNumber,
    score: input.score,
    normalizedScore: normalizeScore(input.score, input.maxScore ?? maxScore),
    included: false,
  }));

  // Sort by normalized score descending to pick best N
  const sorted = [...allEntries].sort(
    (a, b) => b.normalizedScore - a.normalizedScore
  );

  const bestN = Math.min(rule.bestAssignments, sorted.length);

  // Mark the best N as included (preserve original week ordering after picking)
  const includedWeeks = new Set(
    sorted.slice(0, bestN).map((e) => e.weekNumber)
  );

  // Handle ties: if multiple entries have the same score at the cut-off, we
  // take the first N in sorted order (deterministic).
  const finalEntries: AssignmentScoreEntry[] = allEntries.map((e) => ({
    ...e,
    included: includedWeeks.has(e.weekNumber),
  }));

  const includedScores = finalEntries.filter((e) => e.included);
  const excludedScores = finalEntries.filter((e) => !e.included);

  // Average of included normalized scores
  const average =
    includedScores.length > 0
      ? includedScores.reduce((sum, e) => sum + e.normalizedScore, 0) /
        includedScores.length
      : 0;

  const weightedContribution = (average * rule.assignmentWeight * 100) / 100;

  const meetsMinimum = average >= rule.minimumAssignmentScore;

  return {
    rawScores: allEntries,
    includedScores,
    excludedScores,
    average: round2(average),
    weightedContribution: round2(weightedContribution),
    totalEntered: allEntries.length,
    includedCount: includedScores.length,
    meetsMinimum,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
