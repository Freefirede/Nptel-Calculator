"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import type { NptelCatalogCourse } from "@/types/nptel-catalog";

const PAGE_SIZE = 48;

export function NptelEngineeringCatalog({
  courses,
}: {
  courses: NptelCatalogCourse[];
}) {
  const [query, setQuery] = useState("");
  const [discipline, setDiscipline] = useState("All engineering disciplines");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [liveCourses, setLiveCourses] = useState<NptelCatalogCourse[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");
      try {
        const response = await fetch(
          `/api/nptel/search?q=${encodeURIComponent(normalizedQuery)}`,
          { signal: controller.signal }
        );
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Live NPTEL search failed.");
        setLiveCourses(payload.courses);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLiveCourses([]);
        setSearchError(error instanceof Error ? error.message : "Live NPTEL search failed.");
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const sourceCourses = liveCourses ?? courses;

  const disciplines = useMemo(
    () =>
      Array.from(new Set(sourceCourses.flatMap((course) => course.discipline.split(","))))
        .map((value) => value.trim())
        .filter(Boolean)
        .sort(),
    [sourceCourses]
  );

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return sourceCourses.filter((course) => {
      const matchesDiscipline =
        discipline === "All engineering disciplines" ||
        course.discipline.toLowerCase().includes(discipline.toLowerCase());
      const searchableText = [
        course.courseName,
        course.discipline,
        course.institute,
        course.instructor,
      ]
        .join(" ")
        .toLowerCase();
      return matchesDiscipline && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [discipline, query, sourceCourses]);

  const visibleCourses = filteredCourses.slice(0, visibleCount);

  function updateQuery(value: string) {
    setQuery(value);
    setVisibleCount(PAGE_SIZE);
    if (!value.trim()) {
      setLiveCourses(null);
      setSearchError("");
      setIsSearching(false);
    }
  }

  function updateDiscipline(value: string) {
    setDiscipline(value);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <section aria-labelledby="official-catalog-heading" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search engineering courses</span>
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Search course, institute, instructor, or discipline"
            className="w-full rounded border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[hsl(var(--primary))] focus:outline-none"
          />
        </label>
        <label className="sm:w-72">
          <span className="sr-only">Filter by engineering discipline</span>
          <select
            value={discipline}
            onChange={(event) => updateDiscipline(event.target.value)}
            className="w-full rounded border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-[hsl(var(--primary))] focus:outline-none"
          >
            <option>All engineering disciplines</option>
            {disciplines.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-xs text-gray-500" aria-live="polite">
        {isSearching
          ? "Searching the live NPTEL catalog..."
          : `Showing ${visibleCourses.length} of ${filteredCourses.length} matching courses`}
      </p>
      {searchError && (
        <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {searchError}
        </p>
      )}

      {visibleCourses.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCourses.map((course) => (
            <article
              key={course.id}
              className="flex flex-col gap-3 rounded border border-gray-200 p-4 transition-colors hover:border-gray-300"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--primary))]">
                  {course.discipline}
                </p>
                <h3 className="mt-1 text-sm font-medium leading-tight text-gray-900">
                  {course.courseName}
                </h3>
              </div>
              <dl className="space-y-1 text-xs text-gray-500">
                <div className="flex justify-between gap-3">
                  <dt>Duration</dt>
                  <dd className="font-medium text-gray-800">{course.durationWeeks} weeks</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Institute</dt>
                  <dd className="text-right text-gray-800">{course.institute}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Instructor</dt>
                  <dd className="text-right text-gray-800">{course.instructor}</dd>
                </div>
              </dl>
              <a
                href={course.courseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-[hsl(var(--primary))] hover:opacity-80"
              >
                Official NPTEL course page
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                <span className="sr-only">(opens in new tab)</span>
              </a>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
          No engineering courses match your search.
        </p>
      )}

      {visibleCount < filteredCourses.length && (
        <button
          type="button"
          onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          className="rounded border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Load more courses
        </button>
      )}
    </section>
  );
}
