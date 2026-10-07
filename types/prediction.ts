// Prediction engine type definitions

export interface PredictionInput {
  assignmentAverage: number;
  recentAssignmentAverage: number;
  assignmentConsistency: number; // 0–1
  mockTestScores?: number[];
  practiceScores?: number[];
  expectedExamScore?: number;
  weeksTaken: number;
  totalWeeks: number;
}

export type ConfidenceLevel = "high" | "medium" | "low" | "insufficient";

export interface PredictionResult {
  estimatedExamScore: number;
  estimatedFinalScore: number;
  estimatedRangeLow: number;
  estimatedRangeHigh: number;
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0–100
  reasoning: string[];
  disclaimer: string;
}

// Predictor interface — allows swapping rule-based for ML later
export interface ScorePredictor {
  predict(input: PredictionInput): Promise<PredictionResult>;
}
