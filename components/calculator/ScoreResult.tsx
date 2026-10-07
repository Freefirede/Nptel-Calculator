"use client";

import type { FinalScoreResult } from "@/types/scoring";
import type { Course } from "@/types/course";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { CertificateResult } from "./CertificateResult";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScoreResultProps {
  result: FinalScoreResult;
  course: Course;
}

export function ScoreResult({ result, course }: ScoreResultProps) {
  const rule = course.scoringRule;

  return (
    <section aria-label="Score result">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">Result</h2>
        <p className="text-xs text-gray-400 mt-0.5">{course.courseName}</p>
      </div>

      <Tabs defaultValue="certificate">
        <TabsList className="mb-4 bg-gray-100 rounded p-0.5 h-auto">
          <TabsTrigger
            value="certificate"
            className="text-xs px-3 py-1.5 rounded data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500"
          >
            Certificate
          </TabsTrigger>
          <TabsTrigger
            value="breakdown"
            className="text-xs px-3 py-1.5 rounded data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500"
          >
            Breakdown
          </TabsTrigger>
        </TabsList>

        <TabsContent value="certificate">
          <CertificateResult result={result} rule={rule} />
        </TabsContent>

        <TabsContent value="breakdown">
          <ScoreBreakdown result={result} rule={rule} />
        </TabsContent>
      </Tabs>

      {/* Disclaimer */}
      <p className="mt-4 text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-3">
        This is an estimate based on scoring rules configured for this course.
        Always verify the official grading criteria for your specific NPTEL
        semester.
      </p>
    </section>
  );
}
