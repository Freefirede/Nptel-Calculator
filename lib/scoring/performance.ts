/**
 * Assignment performance analysis engine.
 *
 * Calculates statistics and trends from assignment scores.
 */

import type { AssignmentScoreEntry } from "@/types/scoring";
import type { PerformanceAnalysis } from "@/types/scoring";

/**
 * Analyse assignment performance from a list of included (best-N) scores.
 */
export function analyzePerformance(
  entries: AssignmentScoreEntry[]
): PerformanceAnalysis {
  if (entries.length === 0) {
    return {
      average: 0,
      median: 0,
      highest: 0,
      highestWeek: 0,
      lowest: 0,
      lowestWeek: 0,
      standardDeviation: 0,
      recentAverage: 0,
      trend: "insufficient_data",
      consistencyLabel: "poor",
      consistencyScore: 0,
      improvementRate: 0,
      performanceLabel: "No data",
    };
  }

  const scores = entries.map((e) => e.normalizedScore);
  const weeks = entries.map((e) => e.weekNumber);

  // Basic stats
  const average = round2(scores.reduce((a, b) => a + b, 0) / scores.length);
  const sorted = [...scores].sort((a, b) => a - b);
  const median =
    sorted.length % 2 === 0
      ? round2((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2)
      : sorted[Math.floor(sorted.length / 2)];

  const highest = Math.max(...scores);
  const highestWeek = weeks[scores.indexOf(highest)];
  const lowest = Math.min(...scores);
  const lowestWeek = weeks[scores.indexOf(lowest)];

  // Standard deviation
  const variance =
    scores.reduce((sum, s) => sum + Math.pow(s - average, 2), 0) /
    scores.length;
  const standardDeviation = round2(Math.sqrt(variance));

  // Recent average: last 3 entries (chronological order)
  const chronological = [...entries].sort(
    (a, b) => a.weekNumber - b.weekNumber
  );
  const recentCount = Math.min(3, chronological.length);
  const recentScores = chronological.slice(-recentCount).map((e) => e.normalizedScore);
  const recentAverage = round2(
    recentScores.reduce((a, b) => a + b, 0) / recentScores.length
  );

  // Trend: compare first half vs second half
  const trend = calculateTrend(chronological.map((e) => e.normalizedScore));

  // Consistency: CV-based (lower CV = more consistent)
  const cv = average > 0 ? standardDeviation / average : 1;
  const consistencyScore = round2(Math.max(0, 100 - cv * 100));
  const consistencyLabel = getConsistencyLabel(consistencyScore);

  // Improvement rate: slope of linear regression
  const improvementRate = round2(calculateSlope(chronological));

  // Performance label
  const performanceLabel = getPerformanceLabel(average, trend, consistencyLabel);

  return {
    average,
    median,
    highest,
    highestWeek,
    lowest,
    lowestWeek,
    standardDeviation,
    recentAverage,
    trend,
    consistencyLabel,
    consistencyScore,
    improvementRate,
    performanceLabel,
  };
}

function calculateTrend(
  scores: number[]
): PerformanceAnalysis["trend"] {
  if (scores.length < 4) return "insufficient_data";
  const half = Math.floor(scores.length / 2);
  const firstHalf = scores.slice(0, half);
  const secondHalf = scores.slice(-half);
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const diff = secondAvg - firstAvg;
  if (diff > 3) return "improving";
  if (diff < -3) return "declining";
  return "stable";
}

function calculateSlope(entries: AssignmentScoreEntry[]): number {
  if (entries.length < 2) return 0;
  const n = entries.length;
  const xMean = (n - 1) / 2;
  const yMean = entries.reduce((s, e) => s + e.normalizedScore, 0) / n;
  let num = 0,
    den = 0;
  entries.forEach((e, i) => {
    num += (i - xMean) * (e.normalizedScore - yMean);
    den += Math.pow(i - xMean, 2);
  });
  return den === 0 ? 0 : num / den;
}

function getConsistencyLabel(
  score: number
): PerformanceAnalysis["consistencyLabel"] {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "fair";
  return "poor";
}

function getPerformanceLabel(
  average: number,
  trend: PerformanceAnalysis["trend"],
  consistency: PerformanceAnalysis["consistencyLabel"]
): string {
  if (average >= 90) return "Outstanding";
  if (average >= 80) return trend === "improving" ? "Strong & Improving" : "Strong";
  if (average >= 70) return "Good";
  if (average >= 60) return consistency === "poor" ? "Inconsistent" : "Satisfactory";
  if (average >= 50) return "Needs Improvement";
  return "Weak Performance";
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
