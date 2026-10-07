/**
 * Prediction Service — rule-based score prediction.
 *
 * Uses statistical heuristics to estimate exam and final scores.
 * Designed so an ML model can replace the implementation later
 * without changing the calling interface.
 */

import type { PredictionInput, PredictionResult, ScorePredictor } from "@/types/prediction";

// ─── Rule-based predictor ─────────────────────────────────────────────────────

class RuleBasedPredictor implements ScorePredictor {
  async predict(input: PredictionInput): Promise<PredictionResult> {
    const {
      assignmentAverage,
      recentAssignmentAverage,
      assignmentConsistency,
      mockTestScores = [],
      practiceScores = [],
      expectedExamScore,
      weeksTaken,
      totalWeeks,
    } = input;

    const reasoning: string[] = [];

    // Use the student's closest exam-like evidence first. Without mock scores,
    // assignment history remains the best available proxy.
    let baseEstimate: number;
    if (mockTestScores.length > 0) {
      const mockAvg =
        mockTestScores.reduce((a, b) => a + b, 0) / mockTestScores.length;
      baseEstimate =
        mockAvg * 0.7 + assignmentAverage * 0.2 + recentAssignmentAverage * 0.1;
      reasoning.push(
        `Weighted ${mockTestScores.length} mock test score(s) most heavily because they are closest to the real exam (average: ${mockAvg.toFixed(1)}).`
      );
    } else {
      baseEstimate = assignmentAverage * 0.7 + recentAssignmentAverage * 0.3;
      reasoning.push(
        `Estimated from assignment average (${assignmentAverage.toFixed(1)}) and recent average (${recentAssignmentAverage.toFixed(1)}); no mock-test history was provided.`
      );
    }

    if (practiceScores.length > 0) {
      const practiceAvg =
        practiceScores.reduce((a, b) => a + b, 0) / practiceScores.length;
      baseEstimate = baseEstimate * 0.85 + practiceAvg * 0.15;
      reasoning.push(
        `Added a small adjustment from ${practiceScores.length} practice score(s), average: ${practiceAvg.toFixed(1)}.`
      );
    }

    if (expectedExamScore !== undefined) {
      baseEstimate = baseEstimate * 0.75 + expectedExamScore * 0.25;
      reasoning.push(
        `Included your own exam estimate (${expectedExamScore}) with a 25% weight.`
      );
    }

    // Clamp to valid range
    const estimatedExamScore = Math.round(
      Math.min(100, Math.max(0, baseEstimate))
    );

    // ── Course completion adjustment ────────────────────────────────────────
    const completionRatio = totalWeeks > 0 ? weeksTaken / totalWeeks : 0;
    if (completionRatio < 0.5) {
      reasoning.push(
        `Only ${Math.round(completionRatio * 100)}% of course completed. Prediction confidence is lower.`
      );
    }

    // ── Confidence calculation ───────────────────────────────────────────────
    let confidenceScore = 30; // base
    confidenceScore += Math.min(20, completionRatio * 20); // up to 20 for completion
    confidenceScore += Math.min(20, assignmentConsistency * 20); // consistency
    if (mockTestScores.length >= 2) confidenceScore += 20;
    else if (mockTestScores.length === 1) confidenceScore += 10;
    if (practiceScores.length >= 2) confidenceScore += 5;
    if (expectedExamScore !== undefined) confidenceScore += 5;

    confidenceScore = Math.min(95, confidenceScore);

    const confidence =
      confidenceScore >= 75
        ? "high"
        : confidenceScore >= 50
        ? "medium"
        : confidenceScore >= 30
        ? "low"
        : "insufficient";

    // ── Range calculation ────────────────────────────────────────────────────
    // Use observed mock-score spread when available, then widen for uncertainty
    // between assignment and recent performance.
    const mockSpread = getStandardDeviation(mockTestScores);
    const assignmentGap = Math.abs(assignmentAverage - recentAssignmentAverage);
    const evidenceWidth =
      mockTestScores.length >= 2 ? mockSpread : assignmentGap / 2;
    const confidenceWidth =
      confidence === "high" ? 4 : confidence === "medium" ? 8 : 12;
    const rangeHalfWidth = Math.max(
      confidenceWidth,
      Math.round(evidenceWidth + confidenceWidth / 2)
    );

    const estimatedRangeLow = Math.max(
      0,
      Math.round(estimatedExamScore - rangeHalfWidth)
    );
    const estimatedRangeHigh = Math.min(
      100,
      Math.round(estimatedExamScore + rangeHalfWidth)
    );

    // ── Final score is derived from estimated exam (not predicted directly) ──
    // Note: We don't have assignment weight here; the service caller should
    // use the scoring engine to compute estimatedFinalScore from these numbers.
    const estimatedFinalScore = estimatedExamScore; // placeholder — caller provides weight

    return {
      estimatedExamScore,
      estimatedFinalScore,
      estimatedRangeLow,
      estimatedRangeHigh,
      confidence,
      confidenceScore: Math.round(confidenceScore),
      reasoning,
      disclaimer:
        "This is an estimated performance based on your assignment history and provided inputs. It is not an official NPTEL result. Actual exam scores depend on many factors.",
    };
  }

}

function getStandardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + Math.pow(value - average, 2), 0) /
    values.length;
  return Math.sqrt(variance);
}

// ─── Singleton predictor ─────────────────────────────────────────────────────
// Swap `new RuleBasedPredictor()` for `new MLScorePredictor()` when ready.
const predictor: ScorePredictor = new RuleBasedPredictor();

export const predictionService = {
  /**
   * Predict exam and final score from the student's performance data.
   */
  async predict(input: PredictionInput): Promise<PredictionResult> {
    return predictor.predict(input);
  },
};
