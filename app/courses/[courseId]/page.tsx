import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { COURSES } from "@/data/courses";
import { ExternalLink, ArrowLeft, Calculator } from "lucide-react";

interface Props {
  params: Promise<{ courseId: string }>;
}

export async function generateStaticParams() {
  return COURSES.map((c) => ({ courseId: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseId } = await params;
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) return {};
  return {
    title: course.courseName,
    description: course.description,
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { courseId } = await params;
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) notFound();

  const rule = course.scoringRule;
  const certs = [...rule.certificateRules].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Link
        href="/courses"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
        All courses
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--primary))] mb-1">
              {course.discipline}
            </p>
            <h1 className="text-xl font-semibold text-gray-900">
              {course.courseName}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {course.institute} · {course.instructor}
            </p>
          </div>
          {course.courseUrl && (
            <a
              href={course.courseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 transition-colors text-gray-600 shrink-0"
            >
              Official NPTEL page
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="sr-only">(opens in new tab)</span>
            </a>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-3 leading-relaxed">
          {course.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scoring rules */}
        <section
          aria-labelledby="scoring-rules-heading"
          className="border border-gray-200 rounded p-4 space-y-3"
        >
          <h2
            id="scoring-rules-heading"
            className="text-sm font-semibold text-gray-800"
          >
            Scoring Rules
          </h2>
          <dl className="space-y-2 text-sm">
            <Row label="Duration" value={`${course.durationWeeks} weeks`} />
            <Row label="Total assignments" value={`${rule.totalAssignments}`} />
            <Row
              label="Best assignments count"
              value={`Best ${rule.bestAssignments} of ${rule.totalAssignments}`}
            />
            <Row
              label="Assignment weight"
              value={`${Math.round(rule.assignmentWeight * 100)}%`}
            />
            <Row
              label="Exam weight"
              value={`${Math.round(rule.examWeight * 100)}%`}
            />
            <Row
              label="Max marks per assignment"
              value={`${rule.assignmentMaxScore}`}
            />
            <Row label="Max exam score" value={`${rule.examMaxScore}`} />
          </dl>
        </section>

        {/* Minimum requirements */}
        <section
          aria-labelledby="minimums-heading"
          className="border border-gray-200 rounded p-4 space-y-3"
        >
          <h2
            id="minimums-heading"
            className="text-sm font-semibold text-gray-800"
          >
            Minimum Requirements
          </h2>
          <dl className="space-y-2 text-sm">
            <Row
              label="Min. assignment average"
              value={
                rule.minimumAssignmentScore > 0
                  ? `${rule.minimumAssignmentScore} / 100`
                  : "No minimum"
              }
            />
            <Row
              label="Min. exam score"
              value={`${rule.minimumExamScore} / ${rule.examMaxScore}`}
            />
            <Row
              label="Min. final score"
              value={`${rule.minimumFinalScore} / 100`}
            />
          </dl>
        </section>

        {/* Certificate thresholds */}
        <section
          aria-labelledby="cert-heading"
          className="border border-gray-200 rounded p-4 space-y-3 md:col-span-2"
        >
          <h2
            id="cert-heading"
            className="text-sm font-semibold text-gray-800"
          >
            Certificate Thresholds
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {certs.map((cert) => (
              <div
                key={cert.name}
                className="flex items-center justify-between px-3 py-2.5 border border-gray-100 rounded bg-gray-50 text-sm"
              >
                <span className="font-medium text-gray-800">{cert.name}</span>
                <div className="text-xs text-gray-500 text-right">
                  <div>Final ≥ {cert.minimumFinalScore}</div>
                  {cert.minimumExamScore && (
                    <div>Exam ≥ {cert.minimumExamScore}</div>
                  )}
                  {cert.minimumAssignmentScore && (
                    <div>Assignment ≥ {cert.minimumAssignmentScore}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* CTA */}
      <div className="mt-6 pt-5 border-t border-gray-100 flex gap-3 flex-wrap">
        <Link
          href={`/calculate?courseId=${course.id}`}
          className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-white text-sm font-medium rounded hover:opacity-90 transition-opacity"
        >
          <Calculator className="w-4 h-4" aria-hidden="true" />
          Calculate my score
        </Link>
        <Link
          href={`/planner?courseId=${course.id}`}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm text-gray-700 rounded hover:bg-gray-50 transition-colors"
        >
          Plan my target
        </Link>
      </div>

      {/* Source note */}
      <p className="mt-4 text-xs text-gray-400">
        Rule status:{" "}
        {course.scoringRule.metadata?.status === "verified"
          ? "Official beta rule"
          : "Temporary standard fallback"}
        . Scoring rules last verified: {course.lastVerifiedAt}. Source:{" "}
        {course.source}. Rules may change by semester — always verify on the
        official NPTEL website.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-800 font-medium tabular-nums text-right">{value}</dd>
    </div>
  );
}
