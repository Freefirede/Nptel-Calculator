"use client";

import { useState, useCallback, useMemo } from "react";
import type { Course } from "@/types/course";
import type {
  AssignmentScoreInput,
  AssignmentScoreScale,
} from "@/types/scoring";
import type { PredictionResult } from "@/types/prediction";
import { CourseSelector } from "@/components/calculator/CourseSelector";
import { AssignmentInput } from "@/components/calculator/AssignmentInput";
import { PredictionCard } from "@/components/predictor/PredictionCard";
import { scoringService } from "@/lib/services/scoringService";
import { predictionService } from "@/lib/services/predictionService";
import { analyzePerformance } from "@/lib/scoring/performance";
import { calculateCertificate } from "@/lib/scoring/certificate";
import { Plus, X } from "lucide-react";
import { ScoreScaleSelector } from "@/components/calculator/ScoreScaleSelector";

function buildInitialAssignments(
  course: Course,
  scoreScale: AssignmentScoreScale
): AssignmentScoreInput[] {
  return Array.from(
    { length: Math.min(course.scoringRule.totalAssignments, 4) },
    (_, i) => ({
      weekNumber: i + 1,
      score: 0,
      maxScore: scoreScale,
    })
  );
}

export default function PredictPage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<AssignmentScoreInput[]>([]);
  const [assignmentMode, setAssignmentMode] = useState<"average" | "weekly">("average");
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [scoreScale, setScoreScale] = useState<AssignmentScoreScale>(25);
  const [mockScores, setMockScores] = useState<number[]>([]);
  const [mockInput, setMockInput] = useState<string>("");
  const [expectedExam, setExpectedExam] = useState<string>("");
  const [prediction, setPrediction] = useState<
    (PredictionResult & { estimatedFinalScore: number }) | null
  >(null);
  const [loading, setLoading] = useState(false);

  const handleCourseChange = useCallback((_id: string, c: Course) => {
    setCourse(c);
    setAssignments(buildInitialAssignments(c, scoreScale));
    setAssignmentMode("average");
    setAverageScore(null);
    setPrediction(null);
  }, [scoreScale]);

  function handleScoreScaleChange(nextScale: AssignmentScoreScale) {
    setAssignments((current) =>
      current.map((entry) => ({
        ...entry,
        score: Math.round((entry.score / scoreScale) * nextScale * 100) / 100,
        maxScore: nextScale,
      }))
    );
    if (averageScore !== null) {
      setAverageScore(Math.round((averageScore / scoreScale) * nextScale * 100) / 100);
    }
    setScoreScale(nextScale);
    setPrediction(null);
  }

  const effectiveAssignments = useMemo(() => {
    if (assignmentMode === "weekly") return assignments;
    if (!course || averageScore === null) return [];
    return [{
      weekNumber: 1,
      score: averageScore,
      maxScore: scoreScale,
    }];
  }, [assignmentMode, assignments, averageScore, course, scoreScale]);

  const assignmentResult = useMemo(() => {
    if (!course || effectiveAssignments.length === 0) return null;
    return scoringService.calculateAssignments(course, effectiveAssignments);
  }, [course, effectiveAssignments]);

  const performance = useMemo(() => {
    if (!assignmentResult) return null;
    return analyzePerformance(assignmentResult.rawScores);
  }, [assignmentResult]);

  const goalScores = useMemo(() => {
    if (!course || !assignmentResult) return [];
    return scoringService.getAllRequiredExamScores(course, assignmentResult.average);
  }, [course, assignmentResult]);

  async function handlePredict() {
    if (!course || !assignmentResult || !performance) return;
    setLoading(true);
    try {
      const input = {
        assignmentAverage: assignmentResult.average,
        recentAssignmentAverage: performance.recentAverage,
        assignmentConsistency: performance.consistencyScore / 100,
        mockTestScores: mockScores,
        practiceScores: [],
        expectedExamScore: expectedExam ? parseFloat(expectedExam) : undefined,
        weeksTaken: effectiveAssignments.length,
        totalWeeks: course.durationWeeks,
      };
      const pred = await predictionService.predict(input);

      // Use the actual course weight to compute estimated final score
      const estimatedFinalScore = Math.round(
        assignmentResult.average * course.scoringRule.assignmentWeight +
          pred.estimatedExamScore * course.scoringRule.examWeight
      );

      setPrediction({ ...pred, estimatedFinalScore });
    } finally {
      setLoading(false);
    }
  }

  function addMockScore() {
    const val = parseFloat(mockInput);
    if (isNaN(val) || val < 0 || val > 100) return;
    setMockScores((prev) => [...prev, val]);
    setMockInput("");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Score Predictor</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Predict your likely exam score and final course score from your assignment average,
          mock tests, and expected exam score.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Inputs ── */}
        <div className="lg:col-span-2 space-y-5">
          <div className="border border-gray-200 rounded p-4 space-y-5">
            <CourseSelector
              value={course?.id ?? ""}
              onChange={handleCourseChange}
            />

            {course && (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Assignment score input</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Start with your average score. Use weekly marks if you do not know the average.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAssignmentMode("average")}
                    className={`rounded border px-3 py-2 text-xs ${
                      assignmentMode === "average"
                        ? "border-[hsl(var(--primary))] bg-red-50 text-[hsl(var(--primary))]"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    Enter average
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignmentMode("weekly")}
                    className={`rounded border px-3 py-2 text-xs ${
                      assignmentMode === "weekly"
                        ? "border-[hsl(var(--primary))] bg-red-50 text-[hsl(var(--primary))]"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    Enter weekly marks
                  </button>
                </div>
                <ScoreScaleSelector
                  value={scoreScale}
                  onChange={handleScoreScaleChange}
                />
                {assignmentMode === "average" ? (
                  <div>
                    <label htmlFor="predictor-average-score" className="block text-xs text-gray-500 mb-1.5">
                      Average assignment score
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="predictor-average-score"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        max={scoreScale}
                        step={0.5}
                        value={averageScore ?? ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          setAverageScore(value === "" ? null : Number(value));
                          setPrediction(null);
                        }}
                        placeholder="e.g. 72"
                        className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:border-[hsl(var(--primary))] focus:outline-none"
                      />
                      <span className="text-sm text-gray-400">
                        / {scoreScale}
                      </span>
                    </div>
                  </div>
                ) : (
                  <AssignmentInput
                    rule={course.scoringRule}
                    scores={assignments}
                    scoreScale={scoreScale}
                    onChange={(scores) => {
                      setAssignments(scores);
                      setPrediction(null);
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Optional inputs */}
          {course && (
            <div className="border border-gray-200 rounded p-4 space-y-4">
              <h3 className="text-sm font-medium text-gray-700">
                Optional — improves accuracy
              </h3>

              {/* Mock test scores */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Mock test scores (0–100)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={mockInput}
                    onChange={(e) => setMockInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addMockScore()}
                    placeholder="e.g. 72"
                    className="flex-1 px-2.5 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
                  />
                  <button
                    type="button"
                    onClick={addMockScore}
                    className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                    aria-label="Add mock score"
                  >
                    <Plus className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                {mockScores.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {mockScores.map((score, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs text-gray-700"
                      >
                        {score}
                        <button
                          type="button"
                          onClick={() =>
                            setMockScores((prev) =>
                              prev.filter((_, idx) => idx !== i)
                            )
                          }
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          aria-label={`Remove mock score ${score}`}
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Expected exam score */}
              <div>
                <label
                  htmlFor="expected-exam"
                  className="block text-xs text-gray-500 mb-1.5"
                >
                  Your own exam estimate (optional)
                </label>
                <input
                  id="expected-exam"
                  type="number"
                  min={0}
                  max={100}
                  value={expectedExam}
                  onChange={(e) => setExpectedExam(e.target.value)}
                  placeholder="e.g. 78"
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
                />
              </div>

              <button
                type="button"
                onClick={handlePredict}
                disabled={loading || !assignmentResult}
                className="w-full px-4 py-2.5 bg-[hsl(var(--primary))] text-white text-sm font-medium rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2"
              >
                {loading ? "Predicting scores…" : "Predict my scores"}
              </button>
            </div>
          )}
        </div>

        {/* ── Results ── */}
        <div className="lg:col-span-3 space-y-5">
          {prediction && course && assignmentResult && (
            <div className="border border-gray-200 rounded p-4">
              <PredictionCard
                prediction={prediction}
                certificate={calculateCertificate(
                  prediction.estimatedFinalScore,
                  assignmentResult.average,
                  prediction.estimatedExamScore,
                  course.scoringRule.certificateRules,
                  assignmentResult.average >= course.scoringRule.minimumAssignmentScore &&
                    prediction.estimatedExamScore >= course.scoringRule.minimumExamScore &&
                    prediction.estimatedFinalScore >= course.scoringRule.minimumFinalScore
                )}
                assignmentAverage={assignmentResult.average}
                scoringRule={course.scoringRule}
                goalScores={goalScores}
              />
            </div>
          )}

          {!course && (
            <div className="flex items-center justify-center h-48 border border-dashed border-gray-200 rounded text-sm text-gray-400">
              Select a course and enter your scores to get a prediction.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
