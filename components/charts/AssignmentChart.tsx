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
} from "recharts";
import type { AssignmentScoreEntry } from "@/types/scoring";

interface AssignmentChartProps {
  entries: AssignmentScoreEntry[];
  minimumScore?: number;
}

interface TooltipPayload {
  value: number;
  payload: { included: boolean };
}

export function AssignmentChart({
  entries,
  minimumScore,
}: AssignmentChartProps) {
  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-400">
        No assignment data to display.
      </div>
    );
  }

  // Sort by week for the chart
  const data = [...entries]
    .sort((a, b) => a.weekNumber - b.weekNumber)
    .map((e) => ({
      week: `W${e.weekNumber}`,
      score: e.normalizedScore,
      included: e.included,
    }));

  const avg =
    entries.reduce((s, e) => s + e.normalizedScore, 0) / entries.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">
          Assignment Performance
        </h4>
        <span className="text-xs text-gray-400">
          Average: {avg.toFixed(1)} / 100
        </span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
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
            dataKey="week"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0] as TooltipPayload;
              return (
                <div className="bg-white border border-gray-200 rounded px-3 py-2 text-sm shadow-sm">
                  <div className="font-medium text-gray-700">{label}</div>
                  <div className="text-gray-600">
                    {item.value.toFixed(1)} / 100
                  </div>
                  <div
                    className={
                      item.payload.included ? "text-green-600" : "text-gray-400"
                    }
                  >
                    {item.payload.included ? "Included" : "Excluded"}
                  </div>
                </div>
              );
            }}
          />

          {/* Average line */}
          <ReferenceLine
            y={avg}
            stroke="#9ca3af"
            strokeDasharray="4 2"
            label={{
              value: `Avg: ${avg.toFixed(1)}`,
              position: "right",
              fontSize: 10,
              fill: "#9ca3af",
            }}
          />

          {/* Minimum score reference */}
          {minimumScore !== undefined && minimumScore > 0 && (
            <ReferenceLine
              y={minimumScore}
              stroke="#ef4444"
              strokeDasharray="4 2"
              label={{
                value: `Min: ${minimumScore}`,
                position: "right",
                fontSize: 10,
                fill: "#ef4444",
              }}
            />
          )}

          <Line
            type="monotone"
            dataKey="score"
            stroke="hsl(0, 72%, 42%)"
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload } = props;
              return (
                <circle
                  key={`dot-${payload.week}`}
                  cx={cx}
                  cy={cy}
                  r={3}
                  fill={payload.included ? "hsl(0, 72%, 42%)" : "#d1d5db"}
                  stroke="white"
                  strokeWidth={1.5}
                />
              );
            }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[hsl(0,72%,42%)]" />
          Included
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gray-300" />
          Excluded
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-px bg-gray-400" style={{ borderTop: "1px dashed" }} />
          Average
        </div>
      </div>
    </div>
  );
}
