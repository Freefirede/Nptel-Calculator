import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, Shield, Code2, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "About the NPTEL Score Calculator — an independent utility for NPTEL students.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">About</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          NPTEL Score Calculator is an independent academic utility.
        </p>
      </div>

      <div className="prose prose-sm max-w-none space-y-6 text-gray-600">
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">
            What is this?
          </h2>
          <p>
            NPTEL Score Calculator helps NPTEL students quickly calculate their
            scores, understand certificate eligibility, figure out what exam
            score they need for a target certificate, and analyse their
            assignment performance.
          </p>
          <p className="mt-2">
            It is designed to be fast, simple, and accurate — with all scoring
            calculations happening deterministically using configurable rules.
            No AI is involved in any numerical calculation.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">
            How scoring works
          </h2>
          <ul className="list-disc pl-4 space-y-1.5">
            <li>Each course has its own scoring rule configuration.</li>
            <li>
              The final score is a weighted average of assignment and exam
              components, configured per course.
            </li>
            <li>
              For courses with a best-N assignment rule, only the highest N
              assignment scores count toward the average.
            </li>
            <li>
              Certificate eligibility is determined by configurable thresholds
              that belong to each course, not hard-coded globally.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">
            Disclaimer
          </h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded px-4 py-3 text-sm text-yellow-800">
            This calculator provides estimates based on scoring rules configured
            for the selected course. Scoring rules can vary by semester and
            course. Always verify the official grading criteria on the{" "}
            <a
              href="https://nptel.ac.in"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              NPTEL website
              <ExternalLink className="w-2.5 h-2.5 inline ml-0.5" />
            </a>{" "}
            for your specific course and semester.
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">
            Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose">
            {[
              {
                icon: <Calculator className="w-4 h-4" />,
                title: "Score Calculator",
                desc: "Weighted final score with best-N assignment support.",
              },
              {
                icon: <Shield className="w-4 h-4" />,
                title: "Certificate Check",
                desc: "Eligibility against course-specific certificate thresholds.",
              },
              {
                icon: <Code2 className="w-4 h-4" />,
                title: "Score Planner",
                desc: "Required exam score for each certificate target.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="border border-gray-200 rounded p-3"
              >
                <div className="flex items-center gap-2 text-[hsl(var(--primary))] mb-1.5">
                  {f.icon}
                  <span className="text-sm font-medium text-gray-800">
                    {f.title}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">
            Not affiliated with NPTEL
          </h2>
          <p>
            This tool is not affiliated with, endorsed by, or associated with
            NPTEL, IITs, or any official educational institution. It is an
            independent open-source project created to help students.
          </p>
        </section>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3 flex-wrap">
        <Link
          href="/"
          className="px-4 py-2 bg-[hsl(var(--primary))] text-white text-sm font-medium rounded hover:opacity-90 transition-opacity"
        >
          Open Calculator
        </Link>
        <Link
          href="/courses"
          className="px-4 py-2 border border-gray-200 text-sm text-gray-700 rounded hover:bg-gray-50 transition-colors"
        >
          Browse Courses
        </Link>
      </div>
    </div>
  );
}
