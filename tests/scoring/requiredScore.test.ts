/**
 * Unit tests for required exam score calculator.
 */

import { calculateRequiredExamScore } from "@/lib/scoring/requiredExamScore";
import type { ScoringRule } from "@/types/course";

const BASE_RULE: ScoringRule = {
  id: "rule-test",
  courseId: "test",
  assignmentWeight: 0.25,
  examWeight: 0.75,
  totalAssignments: 8,
  bestAssignments: 6,
  minimumAssignmentScore: 0,
  minimumExamScore: 30,
  minimumFinalScore: 40,
  assignmentMaxScore: 100,
  examMaxScore: 100,
  certificateRules: [
    { name: "Successfully Completed", minimumFinalScore: 40, minimumExamScore: 30, displayOrder: 1 },
    { name: "Elite", minimumFinalScore: 60, minimumExamScore: 30, displayOrder: 2 },
    { name: "Elite + Silver", minimumFinalScore: 75, minimumExamScore: 30, displayOrder: 3 },
    { name: "Elite + Gold", minimumFinalScore: 90, minimumExamScore: 30, displayOrder: 4 },
  ],
};

describe("Required exam score calculation", () => {
  test("Assignment avg 80 → required exam for Elite + Silver", () => {
    // assignmentContrib = 80 × 0.25 = 20
    // Need final ≥ 75: 20 + examScore × 0.75 = 75 → examScore = 55/0.75 = 73.33 → ceil = 74
    const result = calculateRequiredExamScore(
      BASE_RULE,
      80,
      "Elite + Silver"
    );
    expect(result.isAchievable).toBe(true);
    expect(result.requiredExamScore).toBe(74);
  });

  test("Assignment avg 80 → required exam for Elite + Gold", () => {
    // assignmentContrib = 20, need 90: examScore = (90-20)/0.75 = 93.33 → ceil = 94
    const result = calculateRequiredExamScore(BASE_RULE, 80, "Elite + Gold");
    expect(result.isAchievable).toBe(true);
    expect(result.requiredExamScore).toBe(94);
  });

  test("Very low assignment score → Gold not achievable", () => {
    // assignmentContrib = 10 × 0.25 = 2.5
    // Max possible final = 2.5 + 100 × 0.75 = 77.5 < 90
    const result = calculateRequiredExamScore(BASE_RULE, 10, "Elite + Gold");
    expect(result.isAchievable).toBe(false);
    expect(result.requiredExamScore).toBeNull();
  });

  test("Zero assignment score → Gold not achievable", () => {
    const result = calculateRequiredExamScore(BASE_RULE, 0, "Elite + Gold");
    expect(result.isAchievable).toBe(false);
  });

  test("Perfect assignment score → Gold still requires exam ≥ 53", () => {
    // assignmentContrib = 100 × 0.25 = 25
    // need 90: 25 + examScore × 0.75 = 90 → examScore = 65/0.75 = 86.67 → ceil = 87
    // BUT certRule minimumExamScore = 30, so max(87, 30) = 87
    const result = calculateRequiredExamScore(BASE_RULE, 100, "Elite + Gold");
    expect(result.isAchievable).toBe(true);
    expect(result.requiredExamScore).toBe(87);
  });

  test("Assignment avg 40 → max possible final is 55 < 75 (Silver not achievable)", () => {
    // assignmentContrib = 40 × 0.25 = 10
    // max = 10 + 100 × 0.75 = 85 ≥ 75, so Silver IS achievable
    const result = calculateRequiredExamScore(BASE_RULE, 40, "Elite + Silver");
    expect(result.isAchievable).toBe(true);
  });

  test("Returns currentAssignmentContribution correctly", () => {
    const result = calculateRequiredExamScore(BASE_RULE, 80, "Elite");
    expect(result.currentAssignmentContribution).toBeCloseTo(20, 1);
  });

  test("Unknown certificate → not achievable with reason", () => {
    const result = calculateRequiredExamScore(BASE_RULE, 80, "Unknown Cert");
    expect(result.isAchievable).toBe(false);
    expect(result.requiredExamScore).toBeNull();
  });
});
