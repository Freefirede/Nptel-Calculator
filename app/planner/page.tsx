"use client";

import { useState, useCallback, useMemo } from "react";
import type { Course } from "@/types/course";
import type {
  AssignmentScoreInput,
  AssignmentScoreScale,
} from "@/types/scoring";
import { CourseSelector } from "@/components/calculator/CourseSelector";
import { AssignmentInput } from "@/components/calculator/AssignmentInput";
import { TargetSelector } from "@/components/planner/TargetSelector";
import { RequiredScore } from "@/components/planner/RequiredScore";
import { WhatIfSimulator } from "@/components/planner/WhatIfSimulator";
import { ExamSimulationChart } from "@/components/charts/ExamSimulationChart";
import { scoringService } from "@/lib/services/scoringService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function PlannerPage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<AssignmentScoreInput[]>([]);
  const [scoreScale, setScoreScale] = useState<AssignmentScoreScale>(25);
  const [target, setTarget] = useState<string>("");
  const [courseError, setCourseError] = useState<string>("");

  const handleCourseChange = useCallback((_id: string, c: Course) => {
    setCourse(c);
    setAssignments(buildInitialAssignments(c, scoreScale));
    setTarget(c.scoringRule.certificateRules[0]?.name ?? "");
    setCourseError("");
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
  }

  const assignmentResult = useMemo(() => {
    if (!course || assignments.length === 0) return null;
    return scoringService.calculateAssignments(course, assignments);
  }, [course, assignments]);

  const requiredScoreResults = useMemo(() => {
    if (!course || !assignmentResult) return [];
    return scoringService.getAllRequiredExamScores(
      course,
      assignmentResult.average
    );
  }, [course, assignmentResult]);

  const assignmentAverage = assignmentResult?.average ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Score Planner</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Find out what exam score you need to reach your target certificate.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Left: Inputs ── */}
        <div className="lg:col-span-2 space-y-5">
          <div className="border border-gray-200 rounded p-4 space-y-5">
            <CourseSelector
              value={course?.id ?? ""}
              onChange={handleCourseChange}
              error={courseError}
            />

            {course && (
              <>
                <ScoreScaleSelector
                  value={scoreScale}
                  onChange={handleScoreScaleChange}
                />
                <AssignmentInput
                  rule={course.scoringRule}
                  scores={assignments}
                  onChange={setAssignments}
                  scoreScale={scoreScale}
                />

                {assignmentResult && (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-100 rounded text-sm">
                    <span className="text-gray-500">Assignment average: </span>
                    <span className="font-semibold text-gray-800">
                      {assignmentResult.average.toFixed(2)} / 100 normalized
                    </span>
                    <span className="text-gray-400 text-xs ml-2">
                      (contributes {assignmentResult.weightedContribution.toFixed(2)} to final)
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Target selector */}
          {course && (
            <div className="border border-gray-200 rounded p-4">
              <TargetSelector
                rules={course.scoringRule.certificateRules}
                value={target}
                onChange={setTarget}
              />
            </div>
          )}
        </div>

        {/* ── Right: Results ── */}
        <div className="lg:col-span-3 space-y-5">
          {course ? (
            <>
              {/* Required exam scores for all targets */}
              {requiredScoreResults.length > 0 && (
                <div className="border border-gray-200 rounded p-4">
                  <RequiredScore
                    results={requiredScoreResults}
                    currentTarget={target}
                    assignmentWeightPercent={course.scoringRule.assignmentWeight * 100}
                  />
                </div>
              )}

              {/* Tabs: What-If Simulator / Chart */}
              <div className="border border-gray-200 rounded p-4">
                <Tabs defaultValue="simulator">
                  <TabsList className="mb-4 bg-gray-100 rounded p-0.5 h-auto">
                    <TabsTrigger
                      value="simulator"
                      className="text-xs px-3 py-1.5 rounded data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500"
                    >
                      What-If Simulator
                    </TabsTrigger>
                    <TabsTrigger
                      value="chart"
                      className="text-xs px-3 py-1.5 rounded data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500"
                    >
                      Score Chart
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="simulator">
                    <WhatIfSimulator
                      course={course}
                      assignmentAverage={assignmentAverage}
                    />
                  </TabsContent>

                  <TabsContent value="chart">
                    <ExamSimulationChart
                      course={course}
                      assignmentAverage={assignmentAverage}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 border border-dashed border-gray-200 rounded text-sm text-gray-400">
              Select a course and enter your assignment scores to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
