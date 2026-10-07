/**
 * Main scoring orchestrator.
 *
 * Combines assignment score, exam score, and certificate determination
 * into a single FinalScoreResult.
 */

import type { Course } from "@/types/course";
import type {
  AssignmentScoreInput,
  ExamScoreResult,
  FailedRequirement,
  FinalScoreResult,
} from "@/types/scoring";
import { calculateAssignmentScore } from "./assignmentScore";
import { calculateCertificate } from "./certificate";

/**
 * Calculate the complete final score for a student.
 *
 * @param course       - The NPTEL course (contains scoring rule)
 * @param assignments  - Array of assignment scores entered by the user
 * @param examScore    - Raw exam score (0–examMaxScore)
 */
export function calculateScore(
  course: Course,
  assignments: AssignmentScoreInput[],
  examScore: number
): FinalScoreResult {
  const rule = course.scoringRule;
  const examMaxScore = rule.examMaxScore ?? 100;

  // 1. Calculate assignment component
  const assignmentResult = calculateAssignmentScore(rule, assignments);

  // 2. Normalize exam score to 0–100
  const normalizedExam = Math.min(
    100,
    Math.max(0, (examScore / examMaxScore) * 100)
  );
  const examWeightedContrib = round2(normalizedExam * rule.examWeight);
  const meetsExamMin = normalizedExam >= rule.minimumExamScore;

  const examResult: ExamScoreResult = {
    score: examScore,
    normalizedScore: round2(normalizedExam),
    weightedContribution: examWeightedContrib,
    meetsMinimum: meetsExamMin,
  };

  // 3. Calculate final score
  const finalScore = round2(
    assignmentResult.weightedContribution + examWeightedContrib
  );

  // 4. Check all minimum requirements
  const failedRequirements: FailedRequirement[] = [];

  if (!assignmentResult.meetsMinimum) {
    failedRequirements.push({
      type: "assignment",
      label: "Assignment Minimum",
      required: rule.minimumAssignmentScore,
      actual: assignmentResult.average,
      shortfall: round2(rule.minimumAssignmentScore - assignmentResult.average),
    });
  }

  if (!meetsExamMin) {
    failedRequirements.push({
      type: "exam",
      label: "Exam Minimum",
      required: rule.minimumExamScore,
      actual: normalizedExam,
      shortfall: round2(rule.minimumExamScore - normalizedExam),
    });
  }

  const meetsFinalMin = finalScore >= rule.minimumFinalScore;
  if (!meetsFinalMin) {
    failedRequirements.push({
      type: "final",
      label: "Final Score Minimum",
      required: rule.minimumFinalScore,
      actual: finalScore,
      shortfall: round2(rule.minimumFinalScore - finalScore),
    });
  }

  const isEligible = failedRequirements.length === 0;

  // 5. Determine certificate
  const certificate = calculateCertificate(
    finalScore,
    assignmentResult.average,
    normalizedExam,
    rule.certificateRules,
    isEligible
  );

  return {
    assignmentResult,
    examResult,
    finalScore,
    isEligible,
    certificate,
    failedRequirements,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
