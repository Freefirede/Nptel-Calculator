// Scoring engine input/output type definitions

export type AssignmentScoreScale = 25 | 100;

export interface AssignmentScoreInput {
  weekNumber: number;
  score: number;
  maxScore?: number;
}

export interface AssignmentScoreResult {
  /** Raw scores entered by user */
  rawScores: AssignmentScoreEntry[];
  /** The best-N scores that were selected */
  includedScores: AssignmentScoreEntry[];
  /** Scores excluded (below the best N) */
  excludedScores: AssignmentScoreEntry[];
  /** Average of included scores (0–100 scale) */
  average: number;
  /** Weighted contribution to final score */
  weightedContribution: number;
  /** Total count entered */
  totalEntered: number;
  /** How many are included */
  includedCount: number;
  /** Whether the minimum assignment requirement is met */
  meetsMinimum: boolean;
}

export interface AssignmentScoreEntry {
  weekNumber: number;
  score: number;
  normalizedScore: number; // 0–100
  included: boolean;
}

export interface ExamScoreResult {
  score: number;
  normalizedScore: number; // 0–100
  weightedContribution: number;
  meetsMinimum: boolean;
}

export interface FinalScoreResult {
  assignmentResult: AssignmentScoreResult;
  examResult: ExamScoreResult;
  /** Total final score (0–100) */
  finalScore: number;
  /** Whether all minimum requirements are met */
  isEligible: boolean;
  /** The certificate earned */
  certificate: CertificateResult;
  /** List of unmet requirements */
  failedRequirements: FailedRequirement[];
}

export interface CertificateResult {
  name: string;
  isEligible: boolean;
  displayOrder: number;
}

export interface FailedRequirement {
  type: "assignment" | "exam" | "final";
  label: string;
  required: number;
  actual: number;
  shortfall: number;
}

// Required exam score types

export interface RequiredExamScoreInput {
  assignmentAverage: number;
  targetCertificate: string;
}

export interface RequiredExamScoreResult {
  targetCertificate: string;
  currentAssignmentContribution: number;
  requiredExamScore: number | null;
  requiredFinalScore: number;
  maxPossibleFinalScore: number;
  isAchievable: boolean;
  notAchievableReason?: string;
}

// Simulator types

export interface SimulationEntry {
  examScore: number;
  finalScore: number;
  certificate: string;
  isEligible: boolean;
}

// Performance analysis types

export interface PerformanceAnalysis {
  average: number;
  median: number;
  highest: number;
  highestWeek: number;
  lowest: number;
  lowestWeek: number;
  standardDeviation: number;
  recentAverage: number;
  trend: "improving" | "declining" | "stable" | "insufficient_data";
  consistencyLabel: "excellent" | "good" | "fair" | "poor";
  consistencyScore: number;
  improvementRate: number;
  performanceLabel: string;
}
