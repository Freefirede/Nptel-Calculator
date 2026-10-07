"use client";

import { useState, useMemo } from "react";
import type { Course } from "@/types/course";
import { simulateExamScores, simulateSingleExamScore } from "@/lib/scoring/simulator";
import { cn } from "@/lib/utils";

interface WhatIfSimulatorProps {
  course: Course;
  assignmentAverage: number;
}

const TABLE_SCORES = [10, 20, 30, 40, 50, 60, 70, 75, 80, 85, 90, 95, 100];

export function WhatIfSimulator({
  course,
  assignmentAverage,
}: WhatIfSimulatorProps) {
  const rule = course.scoringRule;
  const [sliderValue, setSliderValue] = useState(70);

  const live = useMemo(
    () => simulateSingleExamScore(rule, assignmentAverage, sliderValue),
    [rule, assignmentAverage, sliderValue]
  );

  const tableEntries = useMemo(
    () => simulateExamScores(rule, assignmentAverage, TABLE_SCORES),
    [rule, assignmentAverage]
  );

  const certColor = getCertBadgeColor(live.certificate);

  return (
    <div className="space-y-5">
      {/* Slider section */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label
            htmlFor="exam-slider"
            className="text-sm font-medium text-gray-700"
          >
            What if my exam score is…
          </label>
          <span className="text-xl font-bold text-gray-900 tabular-nums">
            {sliderValue}
            <span className="text-sm font-normal text-gray-400 ml-1">/ 100</span>
          </span>
        </div>

        <input
          id="exam-slider"
          type="range"
          min={0}
          max={100}
          step={1}
          value={sliderValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
          className="w-full h-2 rounded appearance-none cursor-pointer accent-[hsl(var(--primary))]"
          aria-label="Exam score slider"
          aria-valuenow={sliderValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
        <div className="flex justify-between text-[11px] text-gray-300 mt-1">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>

      {/* Live result */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Exam Score"
          value={`${sliderValue}`}
          unit="/ 100"
        />
        <StatCard
          label="Final Score"
          value={live.finalScore.toFixed(2)}
          unit="/ 100"
          highlight
        />
        <div
          className={cn(
            "border rounded p-3 text-center",
            live.isEligible ? certColor.border + " " + certColor.bg : "border-gray-200"
          )}
        >
          <div className="text-xs text-gray-500 mb-1">Certificate</div>
          <div
            className={cn(
              "text-sm font-semibold",
              live.isEligible ? certColor.text : "text-gray-400"
            )}
          >
            {live.certificate}
          </div>
        </div>
      </div>

      {/* Simulation table */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Score simulation table
        </h4>
        <div className="border border-gray-200 rounded overflow-hidden">
          <table className="w-full text-sm" aria-label="Exam score simulation table">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                  Exam
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                  Final Score
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                  Certificate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tableEntries.map((entry) => {
                const color = getCertBadgeColor(entry.certificate);
                const isActive = entry.examScore === sliderValue;
                return (
                  <tr
                    key={entry.examScore}
                    className={cn(
                      "hover:bg-gray-50 transition-colors cursor-pointer",
                      isActive && "bg-red-50"
                    )}
                    onClick={() => setSliderValue(entry.examScore)}
                    aria-selected={isActive}
                  >
                    <td className="px-3 py-2 tabular-nums font-medium text-gray-700">
                      {entry.examScore}
                    </td>
                    <td className="px-3 py-2 tabular-nums text-gray-800">
                      {entry.finalScore.toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          "inline-block px-2 py-0.5 text-xs font-medium rounded",
                          entry.isEligible
                            ? color.badge
                            : "bg-gray-100 text-gray-400"
                        )}
                      >
                        {entry.certificate}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          Click any row to set that exam score on the slider above.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "border rounded p-3 text-center",
        highlight
          ? "border-[hsl(var(--primary))] bg-red-50"
          : "border-gray-200"
      )}
    >
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div
        className={cn(
          "text-xl font-bold tabular-nums",
          highlight ? "text-[hsl(var(--primary))]" : "text-gray-900"
        )}
      >
        {value}
        {unit && (
          <span className="text-xs font-normal text-gray-400 ml-1">{unit}</span>
        )}
      </div>
    </div>
  );
}

function getCertBadgeColor(name: string) {
  if (name.includes("Gold"))
    return { badge: "bg-yellow-100 text-yellow-800", border: "border-yellow-200", bg: "bg-yellow-50", text: "text-yellow-700" };
  if (name.includes("Silver"))
    return { badge: "bg-blue-100 text-blue-800", border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-700" };
  if (name.includes("Elite"))
    return { badge: "bg-purple-100 text-purple-800", border: "border-purple-200", bg: "bg-purple-50", text: "text-purple-700" };
  if (name.includes("Completed"))
    return { badge: "bg-green-100 text-green-800", border: "border-green-200", bg: "bg-green-50", text: "text-green-700" };
  return { badge: "bg-gray-100 text-gray-500", border: "border-gray-200", bg: "bg-gray-50", text: "text-gray-400" };
}
