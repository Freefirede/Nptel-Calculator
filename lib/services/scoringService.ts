/**
 * Scoring Service — public API for the scoring domain.
 *
 * This service wraps the raw scoring engine functions and provides
 * a clean interface for UI components and API routes.
 */

import type { Course } from "@/types/course";
import type {
  AssignmentScoreInput,
  AssignmentScoreResult,
  FinalScoreResult,
  PerformanceAnalysis,
  RequiredExamScoreResult,
  SimulationEntry,
} from "@/types/scoring";

import { calculateAssignmentScore } from "@/lib/scoring/assignmentScore";
import { calculateScore } from "@/lib/scoring/calculateScore";
import { calculateAllRequiredScores, calculateRequiredExamScore } from "@/lib/scoring/requiredExamScore";
import { simulateExamScores, simulateSingleExamScore } from "@/lib/scoring/simulator";
import { analyzePerformance } from "@/lib/scoring/performance";

export const scoringService = {
  /**
   * Calculate assignment score only (no exam score).
   */
  calculateAssignments(
    course: Course,
    assignments: AssignmentScoreInput[]
  ): AssignmentScoreResult {
    return calculateAssignmentScore(course.scoringRule, assignments);
  },

  /**
   * Calculate full final score (assignment + exam → final → certificate).
   */
  calculateFinalScore(
    course: Course,
    assignments: AssignmentScoreInput[],
    examScore: number
  ): FinalScoreResult {
    return calculateScore(course, assignments, examScore);
  },

  /**
   * Calculate the required exam score for a specific certificate target.
   */
  getRequiredExamScore(
    course: Course,
    assignmentAverage: number,
    targetCertificate: string
  ): RequiredExamScoreResult {
    return calculateRequiredExamScore(
      course.scoringRule,
      assignmentAverage,
      targetCertificate
    );
  },

  /**
   * Get required exam scores for all certificate levels at once.
   */
  getAllRequiredExamScores(
    course: Course,
    assignmentAverage: number
  ): RequiredExamScoreResult[] {
    return calculateAllRequiredScores(course.scoringRule, assignmentAverage);
  },

  /**
   * Simulate final scores for an array of exam scores.
   */
  simulateExamScores(
    course: Course,
    assignmentAverage: number,
    examScores?: number[]
  ): SimulationEntry[] {
    return simulateExamScores(
      course.scoringRule,
      assignmentAverage,
      examScores
    );
  },

  /**
   * Simulate a single exam score (for the live what-if slider).
   */
  simulateSingle(
    course: Course,
    assignmentAverage: number,
    examScore: number
  ): SimulationEntry {
    return simulateSingleExamScore(
      course.scoringRule,
      assignmentAverage,
      examScore
    );
  },

  /**
   * Analyze assignment performance for a set of scores.
   */
  analyzePerformance(
    assignmentResult: AssignmentScoreResult
  ): PerformanceAnalysis {
    return analyzePerformance(assignmentResult.rawScores);
  },
};
