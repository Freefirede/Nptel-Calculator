"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import type { AssignmentScoreEntry } from "@/types/scoring";

interface ScoreDistributionProps {
  entries: AssignmentScoreEntry[];
}

const BUCKETS = [
  { label: "0–20", min: 0, max: 20 },
  { label: "21–40", min: 21, max: 40 },
  { label: "41–60", min: 41, max: 60 },
  { label: "61–80", min: 61, max: 80 },
  { label: "81–100", min: 81, max: 100 },
];

export function ScoreDistribution({ entries }: ScoreDistributionProps) {
  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-36 text-sm text-gray-400">
        No data to display.
      </div>
    );
  }

  const data = BUCKETS.map((bucket) => ({
    label: bucket.label,
    count: entries.filter(
      (e) =>
        e.normalizedScore >= bucket.min && e.normalizedScore <= bucket.max
    ).length,
  }));

  return (
    <div>
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-700">Score Distribution</h4>
        <p className="text-xs text-gray-400 mt-0.5">
          Assignment scores grouped into ranges.
        </p>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
          barCategoryGap="30%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f0f0f0"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white border border-gray-200 rounded px-3 py-2 text-sm shadow-sm">
                  <div className="text-gray-600">{label}</div>
                  <div className="font-medium text-gray-800">
                    {payload[0].value} assignment
                    {payload[0].value !== 1 ? "s" : ""}
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="count" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.count > 0 ? "hsl(0, 72%, 42%)" : "#e5e7eb"}
                fillOpacity={entry.count > 0 ? 0.8 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
