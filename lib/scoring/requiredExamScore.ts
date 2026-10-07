/**
 * Required exam score calculator.
 *
 * Given the student's current assignment score and a target certificate,
 * calculate the minimum exam score needed.
 */

import type { CertificateRule, ScoringRule } from "@/types/course";
import type { RequiredExamScoreResult } from "@/types/scoring";

const EXAM_MAX = 100;

/**
 * Calculate the required exam score to achieve a target certificate.
 *
 * @param rule               - Course scoring rule
 * @param assignmentAverage  - Current assignment average (0–100)
 * @param targetCertName     - Name of the target certificate
 */
export function calculateRequiredExamScore(
  rule: ScoringRule,
  assignmentAverage: number,
  targetCertName: string
): RequiredExamScoreResult {
  const certRule = rule.certificateRules.find(
    (r) => r.name === targetCertName
  );

  if (!certRule) {
    return {
      targetCertificate: targetCertName,
      currentAssignmentContribution: round2(
        assignmentAverage * rule.assignmentWeight
      ),
      requiredExamScore: null,
      requiredFinalScore: 0,
      maxPossibleFinalScore: round2(
        assignmentAverage * rule.assignmentWeight +
          EXAM_MAX * rule.examWeight
      ),
      isAchievable: false,
      notAchievableReason: "Certificate type not found for this course.",
    };
  }

  const assignmentContrib = round2(
    assignmentAverage * rule.assignmentWeight
  );

  const maxPossibleFinalScore = round2(
    assignmentContrib + EXAM_MAX * rule.examWeight
  );

  // Required final score from the certificate rule
  const requiredFinal = certRule.minimumFinalScore;

  // Also consider the exam-specific minimum for this certificate
  const certExamMin = certRule.minimumExamScore ?? 0;
  // Global exam minimum from scoring rule
  const globalExamMin = rule.minimumExamScore;

  // Solve: assignmentContrib + examScore * examWeight = requiredFinal
  // => examScore = (requiredFinal - assignmentContrib) / examWeight
  const requiredFromFinal =
    rule.examWeight > 0
      ? (requiredFinal - assignmentContrib) / rule.examWeight
      : EXAM_MAX + 1;

  // The required exam score must satisfy all constraints
  const requiredExamScore = Math.max(
    requiredFromFinal,
    certExamMin,
    globalExamMin
  );

  // Also check assignment minimums
  const assignmentMeetsGlobal =
    assignmentAverage >= rule.minimumAssignmentScore;
  const assignmentMeetsCert =
    certRule.minimumAssignmentScore === undefined ||
    assignmentAverage >= certRule.minimumAssignmentScore;

  if (!assignmentMeetsGlobal) {
    return {
      targetCertificate: targetCertName,
      currentAssignmentContribution: assignmentContrib,
      requiredExamScore: null,
      requiredFinalScore: requiredFinal,
      maxPossibleFinalScore,
      isAchievable: false,
      notAchievableReason: `Your assignment average (${round2(assignmentAverage)}) does not meet the minimum requirement of ${rule.minimumAssignmentScore}. This target cannot be achieved.`,
    };
  }

  if (!assignmentMeetsCert) {
    return {
      targetCertificate: targetCertName,
      currentAssignmentContribution: assignmentContrib,
      requiredExamScore: null,
      requiredFinalScore: requiredFinal,
      maxPossibleFinalScore,
      isAchievable: false,
      notAchievableReason: `Your assignment average (${round2(assignmentAverage)}) does not meet the minimum of ${certRule.minimumAssignmentScore} required for ${targetCertName}.`,
    };
  }

  if (requiredExamScore > EXAM_MAX) {
    return {
      targetCertificate: targetCertName,
      currentAssignmentContribution: assignmentContrib,
      requiredExamScore: null,
      requiredFinalScore: requiredFinal,
      maxPossibleFinalScore,
      isAchievable: false,
      notAchievableReason: `This target is not achievable with your current assignment score. Even a perfect exam score (100) would only give you ${round2(maxPossibleFinalScore)} / 100.`,
    };
  }

  return {
    targetCertificate: targetCertName,
    currentAssignmentContribution: assignmentContrib,
    requiredExamScore: Math.ceil(requiredExamScore), // round up for safety
    requiredFinalScore: requiredFinal,
    maxPossibleFinalScore,
    isAchievable: true,
  };
}

/**
 * Get results for all certificate targets at once.
 */
export function calculateAllRequiredScores(
  rule: ScoringRule,
  assignmentAverage: number
): RequiredExamScoreResult[] {
  return rule.certificateRules
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((cert) =>
      calculateRequiredExamScore(rule, assignmentAverage, cert.name)
    );
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
