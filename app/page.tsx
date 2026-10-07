"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Calculator, BarChart2, Target, ChevronRight } from "lucide-react";
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
import { scoringService } from "@/lib/services/scoringService";
import { ScoreScaleSelector } from "@/components/calculator/ScoreScaleSelector";

function buildInitialAssignments(
  course: Course,
  scoreScale: AssignmentScoreScale
): AssignmentScoreInput[] {
  const count = Math.min(course.scoringRule.totalAssignments, 4);
  return Array.from({ length: count }, (_, i) => ({
    weekNumber: i + 1,
    score: 0,
    maxScore: scoreScale,
  }));
}

export default function HomePage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<AssignmentScoreInput[]>([]);
  const [scoreScale, setScoreScale] = useState<AssignmentScoreScale>(25);
  const [examScore, setExamScore] = useState<number>(0);
  const [result, setResult] = useState<FinalScoreResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCourseChange = useCallback((_id: string, course: Course) => {
    setSelectedCourse(course);
    setAssignments(buildInitialAssignments(course, scoreScale));
    setResult(null);
    setErrors({});
  }, [scoreScale]);

  function handleScoreScaleChange(nextScale: AssignmentScoreScale) {
    setAssignments((current) =>
      current.map((entry) => ({
        ...entry,
        score: Math.round((entry.score / scoreScale) * nextScale * 100) / 100,
        maxScore: nextScale,
      }))
    );
    setScoreScale(nextScale);
    setResult(null);
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!selectedCourse) errs.course = "Please select a course.";
    if (
      selectedCourse &&
      (examScore < 0 || examScore > selectedCourse.scoringRule.examMaxScore)
    ) {
      errs.exam = `Enter a score between 0 and ${selectedCourse.scoringRule.examMaxScore}.`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleCalculate() {
    if (!validate() || !selectedCourse) return;
    const r = scoringService.calculateFinalScore(selectedCourse, assignments, examScore);
    setResult(r);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero — predictor-first */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Predict Your NPTEL Score
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Estimate your exam score, see which certificate you may earn, and
          understand what you need to reach your target.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Left: Calculator form ── */}
        <div className="lg:col-span-3 space-y-5">
          {/* Course */}
          <CourseSelector
            value={selectedCourse?.id ?? ""}
            onChange={handleCourseChange}
            error={errors.course}
          />

          {/* Assignments */}
          {selectedCourse && (
            <>
              <ScoreScaleSelector
                value={scoreScale}
                onChange={handleScoreScaleChange}
              />
              <AssignmentInput
                rule={selectedCourse.scoringRule}
                scores={assignments}
                onChange={setAssignments}
                scoreScale={scoreScale}
              />
            </>
          )}

          {/* Exam */}
          {selectedCourse && (
            <ExamInput
              rule={selectedCourse.scoringRule}
              value={examScore}
              onChange={setExamScore}
              error={errors.exam}
            />
          )}

          {/* Calculate button */}
          {selectedCourse && (
            <button
              type="button"
              onClick={handleCalculate}
              className="w-full sm:w-auto px-6 py-2.5 bg-[hsl(var(--primary))] text-white text-sm font-medium rounded hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2"
            >
              Calculate Score
            </button>
          )}

          {!selectedCourse && (
            <p className="text-sm text-gray-400">
              Select a course above to begin.
            </p>
          )}
        </div>

        {/* ── Right: Result or feature cards ── */}
        <div className="lg:col-span-2">
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-white text-[hsl(var(--primary))] shadow-sm">
                <BarChart2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--primary))]">
                  Main feature
                </p>
                <h2 className="mt-1 text-base font-semibold text-gray-900">
                  Score Predictor
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  Use your assignment average and mock-test scores to predict
                  your exam result and likely certificate.
                </p>
                <Link
                  href="/predict"
                  className="mt-4 inline-flex items-center gap-1.5 rounded bg-[hsl(var(--primary))] px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
                >
                  Open Score Predictor
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          {result && selectedCourse ? (
            <div className="border border-gray-200 rounded p-4">
              <ScoreResult result={result} course={selectedCourse} />
            </div>
          ) : (
            <div className="space-y-3">
              <FeatureCard
                icon={<Calculator className="w-4 h-4" />}
                title="Score Calculator"
                description="Enter your assignment scores and exam score to get your final result and certificate."
                href="/calculate"
              />
              <FeatureCard
                icon={<Target className="w-4 h-4" />}
                title="Score Planner"
                description="Find out what exam score you need to reach Elite, Silver, or Gold."
                href="/planner"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 p-4 border border-gray-200 rounded hover:border-gray-300 hover:bg-gray-50 transition-colors group"
    >
      <div className="w-8 h-8 flex items-center justify-center bg-red-50 border border-red-100 rounded text-[hsl(var(--primary))] shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-800">{title}</p>
          <ChevronRight
            className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors"
            aria-hidden="true"
          />
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
}
