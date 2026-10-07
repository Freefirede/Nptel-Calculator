/**
 * Exam score simulator.
 *
 * Generates a table showing how different exam scores affect the final
 * score and certificate category.
 */

import type { ScoringRule } from "@/types/course";
import type { SimulationEntry } from "@/types/scoring";
import { calculateCertificate } from "./certificate";

const DEFAULT_EXAM_STEPS = [10, 20, 30, 40, 50, 60, 70, 75, 80, 85, 90, 95, 100];

/**
 * Simulate final scores for a range of exam scores.
 *
 * @param rule             - Course scoring rule
 * @param assignmentAvg    - Student's current assignment average (0–100)
 * @param examScores       - Array of exam scores to simulate (defaults to common thresholds)
 */
export function simulateExamScores(
  rule: ScoringRule,
  assignmentAvg: number,
  examScores: number[] = DEFAULT_EXAM_STEPS
): SimulationEntry[] {
  const assignmentContrib = assignmentAvg * rule.assignmentWeight;
  const meetsAssignmentMin = assignmentAvg >= rule.minimumAssignmentScore;

  return examScores.map((examScore) => {
    const finalScore = round2(
      assignmentContrib + examScore * rule.examWeight
    );
    const meetsExamMin = examScore >= rule.minimumExamScore;
    const meetsFinalMin = finalScore >= rule.minimumFinalScore;
    const meetsMinimums = meetsAssignmentMin && meetsExamMin && meetsFinalMin;

    const cert = calculateCertificate(
      finalScore,
      assignmentAvg,
      examScore,
      rule.certificateRules,
      meetsMinimums
    );

    return {
      examScore,
      finalScore,
      certificate: cert.name,
      isEligible: cert.isEligible,
    };
  });
}

/**
 * Simulate a single exam score — used for the live what-if slider.
 */
export function simulateSingleExamScore(
  rule: ScoringRule,
  assignmentAvg: number,
  examScore: number
): SimulationEntry {
  const [result] = simulateExamScores(rule, assignmentAvg, [examScore]);
  return result;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
