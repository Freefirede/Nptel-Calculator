"use client";

import { useState, useCallback, useMemo } from "react";
import type { Metadata } from "next";
import type { Course } from "@/types/course";
import type {
  AssignmentScoreInput,
  AssignmentScoreScale,
  FinalScoreResult,
} from "@/types/scoring";
import { CourseSelector } from "@/components/calculator/CourseSelector";
import { AssignmentInput } from "@/components/calculator/AssignmentInput";
import { ExamInput } from "@/components/calculator/ExamInput";
import { ScoreResult } from "@/components/calculator/ScoreResult";
import { AssignmentChart } from "@/components/charts/AssignmentChart";
import { ScoreDistribution } from "@/components/charts/ScoreDistribution";
import { ExamSimulationChart } from "@/components/charts/ExamSimulationChart";
import { ScoreScaleSelector } from "@/components/calculator/ScoreScaleSelector";
import { scoringService } from "@/lib/services/scoringService";
import { analyzePerformance } from "@/lib/scoring/performance";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

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

export default function CalculatePage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<AssignmentScoreInput[]>([]);
  const [assignmentMode, setAssignmentMode] = useState<"average" | "weekly">("average");
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [scoreScale, setScoreScale] = useState<AssignmentScoreScale>(25);
  const [examScore, setExamScore] = useState<number>(0);
  const [result, setResult] = useState<FinalScoreResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calculated, setCalculated] = useState(false);

  const effectiveAssignments = useMemo(() => {
    if (assignmentMode === "weekly") return assignments;
    if (!course || averageScore === null) return [];
    return [
      {
        weekNumber: 1,
        score: averageScore,
        maxScore: scoreScale,
      },
    ];
  }, [assignmentMode, assignments, averageScore, course, scoreScale]);

  const handleCourseChange = useCallback((_id: string, c: Course) => {
    setCourse(c);
    setAssignments(buildInitialAssignments(c, scoreScale));
    setAssignmentMode("average");
    setAverageScore(null);
    setResult(null);
    setErrors({});
    setCalculated(false);
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
    setCalculated(false);
  }

  function handleCalculate() {
    const errs: Record<string, string> = {};
    if (!course) errs.course = "Please select a course.";
    if (assignmentMode === "average" && averageScore === null) {
      errs.assignment = "Enter your average assignment score.";
    }
    if (course && (examScore < 0 || examScore > course.scoringRule.examMaxScore)) {
      errs.exam = `Enter a score between 0 and ${course.scoringRule.examMaxScore}.`;
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0 || !course) return;
    const r = scoringService.calculateFinalScore(
      course,
      effectiveAssignments,
      examScore
    );
    setResult(r);
    setCalculated(true);
  }

  // Live assignment result (before exam)
  const assignmentResult = useMemo(() => {
    if (!course || effectiveAssignments.length === 0) return null;
    return scoringService.calculateAssignments(course, effectiveAssignments);
  }, [course, effectiveAssignments]);

  const performance = useMemo(() => {
    if (!assignmentResult) return null;
    return analyzePerformance(assignmentResult.rawScores);
  }, [assignmentResult]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Score Calculator</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Enter your assignment and exam scores to calculate your final result.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Form ── */}
        <div className="lg:col-span-2 space-y-5">
          <div className="border border-gray-200 rounded p-4 space-y-5">
            <CourseSelector
              value={course?.id ?? ""}
              onChange={handleCourseChange}
              error={errors.course}
            />

            {course && (
              <>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      How do you know your assignment score?
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Enter one average in marks, or switch to weekly scores if you do not know the average.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAssignmentMode("average");
                        setCalculated(false);
                      }}
                      className={`rounded border px-3 py-2 text-xs ${
                        assignmentMode === "average"
                          ? "border-[hsl(var(--primary))] bg-red-50 text-[hsl(var(--primary))]"
                          : "border-gray-200 text-gray-600"
                      }`}
                    >
                      I know the average
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAssignmentMode("weekly");
                        setCalculated(false);
                      }}
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
                </div>

                {assignmentMode === "average" ? (
                  <div>
                    <label htmlFor="average-assignment-score" className="block text-sm font-medium text-gray-700">
                      Average assignment score
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        id="average-assignment-score"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        max={scoreScale}
                        step={0.5}
                        value={averageScore ?? ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          setAverageScore(value === "" ? null : Number(value));
                          setCalculated(false);
                        }}
                        placeholder="e.g. 72"
                        className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:border-[hsl(var(--primary))] focus:outline-none"
                      />
                      <span className="text-sm text-gray-400">
                        / {scoreScale}
                      </span>
                    </div>
                    {errors.assignment && (
                      <p className="mt-1 text-xs text-red-600" role="alert">
                        {errors.assignment}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      This average is used for the assignment component of the final score.
                    </p>
                  </div>
                ) : (
                  <AssignmentInput
                    rule={course.scoringRule}
                    scores={assignments}
                    scoreScale={scoreScale}
                    onChange={(s) => {
                      setAssignments(s);
                      setCalculated(false);
                    }}
                  />
                )}

                <ExamInput
                  rule={course.scoringRule}
                  value={examScore}
                  onChange={(v) => {
                    setExamScore(v);
                    setCalculated(false);
                  }}
                  error={errors.exam}
                />

                <button
                  type="button"
                  onClick={handleCalculate}
                  className="w-full px-4 py-2.5 bg-[hsl(var(--primary))] text-white text-sm font-medium rounded hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2"
                >
                  Calculate Score
                </button>
              </>
            )}
          </div>

          {/* Performance summary (live) */}
          {performance && assignmentResult && (
            <div className="border border-gray-200 rounded p-4 space-y-2">
              <h3 className="text-sm font-medium text-gray-700">
                Assignment Performance
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Average" value={`${assignmentResult.average.toFixed(1)}`} />
                <Stat label="Highest" value={`${performance.highest.toFixed(0)}`} suffix={`W${performance.highestWeek}`} />
                <Stat label="Lowest" value={`${performance.lowest.toFixed(0)}`} suffix={`W${performance.lowestWeek}`} />
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Trend</div>
                  <div className="flex items-center gap-1">
                    {performance.trend === "improving" && (
                      <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                    )}
                    {performance.trend === "declining" && (
                      <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                    )}
                    {(performance.trend === "stable" || performance.trend === "insufficient_data") && (
                      <Minus className="w-3.5 h-3.5 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {performance.trend === "insufficient_data" ? "N/A" : performance.trend}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 pt-1 border-t border-gray-100">
                {performance.performanceLabel}
              </div>
            </div>
          )}
        </div>

        {/* ── Results & Charts ── */}
        <div className="lg:col-span-3 space-y-5">
          {/* Score result */}
          {result && course && calculated && (
            <div className="border border-gray-200 rounded p-4">
              <ScoreResult result={result} course={course} />
            </div>
          )}

          {/* Charts */}
          {assignmentResult && assignmentResult.rawScores.length > 0 && (
            <>
              <div className="border border-gray-200 rounded p-4">
                <AssignmentChart
                  entries={assignmentResult.rawScores}
                  minimumScore={course?.scoringRule.minimumAssignmentScore}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded p-4">
                  <ScoreDistribution entries={assignmentResult.rawScores} />
                </div>
                {course && (
                  <div className="border border-gray-200 rounded p-4">
                    <ExamSimulationChart
                      course={course}
                      assignmentAverage={assignmentResult.average}
                      currentExamScore={calculated ? examScore : undefined}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {!course && (
            <div className="flex items-center justify-center h-48 border border-dashed border-gray-200 rounded text-sm text-gray-400">
              Select a course and enter your scores to see results.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className="text-sm font-medium text-gray-800">
        {value}
        {suffix && <span className="text-xs text-gray-400 ml-1">({suffix})</span>}
      </div>
    </div>
  );
}
