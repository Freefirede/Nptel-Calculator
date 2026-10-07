"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { Course } from "@/types/course";
import { simulateExamScores } from "@/lib/scoring/simulator";
import { useMemo } from "react";

interface ExamSimulationChartProps {
  course: Course;
  assignmentAverage: number;
  currentExamScore?: number;
}

const STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 75, 80, 85, 90, 95, 100];

export function ExamSimulationChart({
  course,
  assignmentAverage,
  currentExamScore,
}: ExamSimulationChartProps) {
  const rule = course.scoringRule;

  const data = useMemo(
    () =>
      simulateExamScores(rule, assignmentAverage, STEPS).map((e) => ({
        examScore: e.examScore,
        finalScore: e.finalScore,
        certificate: e.certificate,
      })),
    [rule, assignmentAverage]
  );

  // Certificate threshold lines
  const certThresholds = [...rule.certificateRules].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return (
    <div>
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-700">
          Exam Score vs Final Score
        </h4>
        <p className="text-xs text-gray-400 mt-0.5">
          How your final score changes as your exam score varies.
        </p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f0f0f0"
            vertical={false}
          />
          <XAxis
            dataKey="examScore"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            label={{
              value: "Exam Score",
              position: "insideBottom",
              offset: -2,
              fontSize: 10,
              fill: "#9ca3af",
            }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div className="bg-white border border-gray-200 rounded px-3 py-2 text-sm shadow-sm">
                  <div className="text-gray-500 text-xs">Exam: {d.examScore}</div>
                  <div className="font-medium text-gray-800">
                    Final: {d.finalScore.toFixed(2)}
                  </div>
                  <div className="text-gray-500 text-xs">{d.certificate}</div>
                </div>
              );
            }}
          />

          {/* Certificate threshold reference lines */}
          {certThresholds.map((cert) => (
            <ReferenceLine
              key={cert.name}
              y={cert.minimumFinalScore}
              stroke={getCertLineColor(cert.name)}
              strokeDasharray="4 2"
              strokeWidth={1}
              label={{
                value: cert.name.replace("Elite + ", ""),
                position: "right",
                fontSize: 9,
                fill: getCertLineColor(cert.name),
              }}
            />
          ))}

          {/* Current exam score marker */}
          {currentExamScore !== undefined && (
            <ReferenceLine
              x={currentExamScore}
              stroke="#9ca3af"
              strokeDasharray="3 3"
            />
          )}

          <Line
            type="monotone"
            dataKey="finalScore"
            stroke="hsl(0, 72%, 42%)"
            strokeWidth={2}
            dot={false}
            name="Final Score"
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Certificate threshold legend */}
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
        {certThresholds.map((cert) => (
          <div key={cert.name} className="flex items-center gap-1.5">
            <div
              className="w-4 h-px"
              style={{
                borderTop: `1.5px dashed ${getCertLineColor(cert.name)}`,
              }}
            />
            <span style={{ color: getCertLineColor(cert.name) }}>
              {cert.name.replace("Elite + ", "")} (≥{cert.minimumFinalScore})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getCertLineColor(name: string): string {
  if (name.includes("Gold")) return "#ca8a04";
  if (name.includes("Silver")) return "#3b82f6";
  if (name.includes("Elite")) return "#7c3aed";
  if (name.includes("Completed")) return "#16a34a";
  return "#9ca3af";
}
