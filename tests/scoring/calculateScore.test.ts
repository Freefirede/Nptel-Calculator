/**
 * Unit tests for the main scoring orchestrator.
 */

import { calculateScore } from "@/lib/scoring/calculateScore";
import type { Course } from "@/types/course";

// ─── Fixtures ──────────────────────────────────────────────────────────────

const STANDARD_CERT_RULES = [
  { name: "Successfully Completed", minimumFinalScore: 40, displayOrder: 1 },
  { name: "Elite", minimumFinalScore: 60, displayOrder: 2 },
  { name: "Elite + Silver", minimumFinalScore: 75, displayOrder: 3 },
  { name: "Elite + Gold", minimumFinalScore: 90, displayOrder: 4 },
];

function makeCourse(overrides: Partial<Course["scoringRule"]> = {}): Course {
  return {
    id: "test-course",
    courseCode: "TEST101",
    courseName: "Test Course",
    institute: "IIT Test",
    instructor: "Prof. Test",
    durationWeeks: 8,
    description: "Test",
    discipline: "Computer Science",
    lastVerifiedAt: "2024-01-01",
    source: "test",
    scoringRule: {
      id: "rule-test",
      courseId: "test-course",
      assignmentWeight: 0.25,
      examWeight: 0.75,
      totalAssignments: 8,
      bestAssignments: 6,
      minimumAssignmentScore: 0,
      minimumExamScore: 30,
      minimumFinalScore: 40,
      assignmentMaxScore: 100,
      examMaxScore: 100,
      certificateRules: STANDARD_CERT_RULES,
      ...overrides,
    },
  };
}

// ─── Standard 25/75 calculation ───────────────────────────────────────────

describe("Standard 25/75 course", () => {
  const course = makeCourse({ bestAssignments: 8, totalAssignments: 8 });

  test("Assignment 80, Exam 80 → Final 80", () => {
    const assignments = Array.from({ length: 8 }, (_, i) => ({
      weekNumber: i + 1,
      score: 80,
    }));
    const result = calculateScore(course, assignments, 80);
    expect(result.finalScore).toBe(80);
  });

  test("Assignment 100, Exam 100 → Final 100", () => {
    const assignments = Array.from({ length: 8 }, (_, i) => ({
      weekNumber: i + 1,
      score: 100,
    }));
    const result = calculateScore(course, assignments, 100);
    expect(result.finalScore).toBe(100);
  });

  test("Assignment 84, Exam 80 → Final 81 (84×0.25 + 80×0.75)", () => {
    const assignments = Array.from({ length: 8 }, (_, i) => ({
      weekNumber: i + 1,
      score: 84,
    }));
    const result = calculateScore(course, assignments, 80);
    expect(result.finalScore).toBeCloseTo(81, 0);
  });

  test("Assignment marks entered out of 25 are normalized correctly", () => {
    const assignments = Array.from({ length: 8 }, (_, i) => ({
      weekNumber: i + 1,
      score: 20,
      maxScore: 25,
    }));
    const result = calculateScore(course, assignments, 80);
    expect(result.assignmentResult.average).toBe(80);
    expect(result.finalScore).toBe(80);
  });
});

// ─── Best-N selection ─────────────────────────────────────────────────────

describe("Best-N assignment selection", () => {
  const course = makeCourse({
    totalAssignments: 8,
    bestAssignments: 6,
    minimumExamScore: 0,
  });

  test("Only best 6 of 8 assignments are included", () => {
    const scores = [90, 82, 45, 87, 92, 78, 61, 88];
    const assignments = scores.map((score, i) => ({
      weekNumber: i + 1,
      score,
    }));
    const result = calculateScore(course, assignments, 70);
    expect(result.assignmentResult.includedCount).toBe(6);
    expect(result.assignmentResult.excludedScores.length).toBe(2);
  });

  test("Lowest 2 scores are excluded (45 and 61)", () => {
    const scores = [90, 82, 45, 87, 92, 78, 61, 88];
    const assignments = scores.map((score, i) => ({
      weekNumber: i + 1,
      score,
    }));
    const result = calculateScore(course, assignments, 70);
    const excludedScores = result.assignmentResult.excludedScores.map(
      (e) => e.score
    );
    // The two lowest should be excluded
    expect(excludedScores).toContain(45);
    expect(excludedScores).toContain(61);
  });

  test("Best-6 average is correct", () => {
    // Scores sorted: 45, 61, 78, 82, 87, 88, 90, 92 — best 6: 78,82,87,88,90,92
    const best6 = [78, 82, 87, 88, 90, 92];
    const expectedAvg = best6.reduce((a, b) => a + b, 0) / 6; // 86.17
    const scores = [90, 82, 45, 87, 92, 78, 61, 88];
    const assignments = scores.map((score, i) => ({
      weekNumber: i + 1,
      score,
    }));
    const result = calculateScore(course, assignments, 70);
    expect(result.assignmentResult.average).toBeCloseTo(expectedAvg, 1);
  });
});

// ─── Minimum requirement checks ──────────────────────────────────────────

describe("Minimum requirement checks", () => {
  test("Below minimum exam score → not eligible", () => {
    const course = makeCourse({
      totalAssignments: 8,
      bestAssignments: 8,
      minimumExamScore: 30,
    });
    const assignments = Array.from({ length: 8 }, (_, i) => ({
      weekNumber: i + 1,
      score: 80,
    }));
    const result = calculateScore(course, assignments, 20); // below 30
    expect(result.isEligible).toBe(false);
    expect(result.failedRequirements.some((r) => r.type === "exam")).toBe(true);
  });

  test("Exactly at minimum exam score → eligible (if other mins met)", () => {
    const course = makeCourse({
      totalAssignments: 8,
      bestAssignments: 8,
      minimumExamScore: 30,
    });
    const assignments = Array.from({ length: 8 }, (_, i) => ({
      weekNumber: i + 1,
      score: 80,
    }));
    const result = calculateScore(course, assignments, 30);
    expect(result.examResult.meetsMinimum).toBe(true);
  });

  test("Below minimum final score → not eligible", () => {
    const course = makeCourse({
      totalAssignments: 8,
      bestAssignments: 8,
      minimumExamScore: 0,
      minimumFinalScore: 40,
    });
    const assignments = Array.from({ length: 8 }, (_, i) => ({
      weekNumber: i + 1,
      score: 10,
    }));
    const result = calculateScore(course, assignments, 10);
    // Final = 10×0.25 + 10×0.75 = 10 < 40
    expect(result.isEligible).toBe(false);
  });
});
