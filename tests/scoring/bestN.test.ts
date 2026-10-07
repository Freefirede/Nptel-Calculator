/**
 * Unit tests for best-N assignment selection.
 */

import { calculateAssignmentScore } from "@/lib/scoring/assignmentScore";
import type { ScoringRule } from "@/types/course";

function makeRule(
  total: number,
  best: number,
  minScore = 0
): ScoringRule {
  return {
    id: "rule-test",
    courseId: "test",
    assignmentWeight: 0.25,
    examWeight: 0.75,
    totalAssignments: total,
    bestAssignments: best,
    minimumAssignmentScore: minScore,
    minimumExamScore: 30,
    minimumFinalScore: 40,
    assignmentMaxScore: 100,
    examMaxScore: 100,
    certificateRules: [],
  };
}

describe("Best-N assignment selection", () => {
  test("Best 6 of 8: includes top 6, excludes bottom 2", () => {
    const rule = makeRule(8, 6);
    const inputs = [90, 82, 45, 87, 92, 78, 61, 88].map((score, i) => ({
      weekNumber: i + 1,
      score,
    }));
    const result = calculateAssignmentScore(rule, inputs);

    expect(result.includedCount).toBe(6);
    expect(result.excludedScores.map((e) => e.score)).toContain(45);
    expect(result.excludedScores.map((e) => e.score)).toContain(61);
  });

  test("All assignments are identical → all included when N = total", () => {
    const rule = makeRule(4, 4);
    const inputs = [70, 70, 70, 70].map((score, i) => ({
      weekNumber: i + 1,
      score,
    }));
    const result = calculateAssignmentScore(rule, inputs);
    expect(result.includedCount).toBe(4);
    expect(result.excludedScores.length).toBe(0);
    expect(result.average).toBe(70);
  });

  test("Best 1 of 5: only the single highest is included", () => {
    const rule = makeRule(5, 1);
    const inputs = [50, 30, 90, 70, 60].map((score, i) => ({
      weekNumber: i + 1,
      score,
    }));
    const result = calculateAssignmentScore(rule, inputs);
    expect(result.includedCount).toBe(1);
    expect(result.includedScores[0].score).toBe(90);
    expect(result.average).toBe(90);
  });

  test("Weighted contribution = average × assignmentWeight", () => {
    const rule = makeRule(4, 4);
    const inputs = [80, 80, 80, 80].map((score, i) => ({
      weekNumber: i + 1,
      score,
    }));
    const result = calculateAssignmentScore(rule, inputs);
    expect(result.weightedContribution).toBeCloseTo(80 * 0.25, 2);
  });

  test("Fewer entries than bestN → includes all", () => {
    const rule = makeRule(8, 6);
    const inputs = [80, 90].map((score, i) => ({
      weekNumber: i + 1,
      score,
    }));
    // Only 2 inputs, bestN=6 → all 2 included
    const result = calculateAssignmentScore(rule, inputs);
    expect(result.includedCount).toBe(2);
    expect(result.excludedScores.length).toBe(0);
  });

  test("Average is 0 for empty input", () => {
    const rule = makeRule(8, 6);
    const result = calculateAssignmentScore(rule, []);
    expect(result.average).toBe(0);
    expect(result.includedCount).toBe(0);
  });

  test("Minimum requirement check", () => {
    const ruleWithMin = makeRule(4, 4, 50); // min assignment avg = 50
    const passingInputs = [60, 70, 80, 90].map((score, i) => ({
      weekNumber: i + 1,
      score,
    }));
    const failingInputs = [10, 20, 30, 40].map((score, i) => ({
      weekNumber: i + 1,
      score,
    }));

    expect(calculateAssignmentScore(ruleWithMin, passingInputs).meetsMinimum).toBe(true);
    expect(calculateAssignmentScore(ruleWithMin, failingInputs).meetsMinimum).toBe(false);
  });
});
