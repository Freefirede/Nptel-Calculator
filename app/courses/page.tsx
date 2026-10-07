import Link from "next/link";
import type { Metadata } from "next";
import { COURSES } from "@/data/courses";
import type { Course } from "@/types/course";
import { ExternalLink, BookOpen } from "lucide-react";
import catalogCourses from "@/data/nptel-engineering-courses.json";
import { NptelEngineeringCatalog } from "@/components/courses/NptelEngineeringCatalog";
import type { NptelCatalogCourse } from "@/types/nptel-catalog";

export const metadata: Metadata = {
  title: "Course Browser",
  description: "Browse all available NPTEL courses with scoring rules and certificate information.",
};

function groupByDiscipline(courses: Course[]) {
  return courses.reduce<Record<string, Course[]>>((acc, c) => {
    if (!acc[c.discipline]) acc[c.discipline] = [];
    acc[c.discipline].push(c);
    return acc;
  }, {});
}

export default function CoursesPage() {
  const grouped = groupByDiscipline(COURSES);
  const disciplines = Object.keys(grouped).sort();
  const officialCatalog = catalogCourses as NptelCatalogCourse[];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">NPTEL Engineering Course Browser</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Search {officialCatalog.length} engineering courses from the official July 2026 NPTEL catalog.
        </p>
      </div>

      <div className="mb-10">
        <NptelEngineeringCatalog courses={officialCatalog} />
        <p className="mt-4 text-xs text-gray-400">
          Catalog source:{" "}
          <a
            href="https://docs.google.com/spreadsheets/d/e/2PACX-1vTcRBMs2cF4lGkKJuE0p3V0RuX6fAfrpInw3CzgrU4nREFAmGJXG8c5Tr2aIn1k6A/pubhtml"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            official SWAYAM/NPTEL July 2026 course list
          </a>
          . The initial catalog uses that official list; searches fetch current NPTEL results from SWAYAM.
        </p>
      </div>

      <section aria-labelledby="calculator-courses-heading" className="space-y-4">
        <div>
          <h2 id="calculator-courses-heading" className="text-lg font-semibold text-gray-900">
            Score calculator courses
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {COURSES.length} courses with configurable scoring rules.
          </p>
        </div>
        <div className="space-y-8">
        {disciplines.map((discipline) => (
          <section key={discipline} aria-labelledby={`discipline-${discipline}`}>
            <h2
              id={`discipline-${discipline}`}
              className="text-sm font-semibold uppercase tracking-wide text-gray-400 border-b border-gray-100 pb-2 mb-4"
            >
              {discipline}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped[discipline].map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        ))}
        </div>
      </section>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  const rule = course.scoringRule;

  return (
    <div className="border border-gray-200 rounded p-4 flex flex-col gap-3 hover:border-gray-300 transition-colors">
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 flex items-center justify-center bg-red-50 border border-red-100 rounded shrink-0">
          <BookOpen className="w-4 h-4 text-[hsl(var(--primary))]" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 leading-tight">
            {course.courseName}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {course.institute}
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
        {course.description}
      </p>

      {/* Scoring summary */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <span>
          <span className="text-gray-400">Assignment: </span>
          {Math.round(rule.assignmentWeight * 100)}%
        </span>
        <span>
          <span className="text-gray-400">Exam: </span>
          {Math.round(rule.examWeight * 100)}%
        </span>
        <span>
          <span className="text-gray-400">Best: </span>
          {rule.bestAssignments}/{rule.totalAssignments}
        </span>
        <span>
          <span className="text-gray-400">Weeks: </span>
          {course.durationWeeks}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 mt-auto">
        <Link
          href={`/courses/${course.id}`}
          className="text-xs text-[hsl(var(--primary))] hover:opacity-80 transition-opacity"
        >
          View scoring rules →
        </Link>
        {course.courseUrl && (
          <a
            href={course.courseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            NPTEL
            <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />
            <span className="sr-only">(opens in new tab)</span>
          </a>
        )}
      </div>
    </div>
  );
}
