"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { Course } from "@/types/course";
import { COURSES } from "@/data/courses";
import { cn } from "@/lib/utils";

interface CourseSelectorProps {
  value: string;
  onChange: (courseId: string, course: Course) => void;
  error?: string;
}

export function CourseSelector({ value, onChange, error }: CourseSelectorProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const disciplines = useMemo(() => {
    const set = new Set(COURSES.map((c) => c.discipline));
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return COURSES.filter(
      (c) =>
        c.courseName.toLowerCase().includes(q) ||
        c.courseCode.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.discipline.toLowerCase().includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    return disciplines.reduce<Record<string, Course[]>>((acc, d) => {
      const matches = filtered.filter((c) => c.discipline === d);
      if (matches.length > 0) acc[d] = matches;
      return acc;
    }, {});
  }, [filtered, disciplines]);

  const selected = COURSES.find((c) => c.id === value);

  return (
    <div className="relative">
      <label
        htmlFor="course-selector-btn"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Course for score calculation
      </label>

      {/* Trigger */}
      <button
        id="course-selector-btn"
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 text-sm border rounded bg-white text-left transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-1",
          error ? "border-red-400" : "border-gray-300 hover:border-gray-400",
          !selected && "text-gray-400"
        )}
      >
        <span className="truncate">
          {selected ? (
            <span className="text-gray-900">
              {selected.courseName}{" "}
              <span className="text-gray-400 text-xs">— {selected.institute}</span>
            </span>
          ) : (
            "Select a course…"
          )}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-400 shrink-0 ml-2 transition-transform",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div
            className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-md max-h-80 overflow-y-auto"
            role="listbox"
            aria-label="Course list"
          >
            {/* Search */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-3 py-2">
              <div className="flex items-center gap-2 text-gray-400">
                <Search className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search calculator courses…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-sm text-gray-700 placeholder-gray-400 outline-none"
                  aria-label="Search courses"
                  autoFocus
                />
              </div>
            </div>

            {/* Results */}
            {Object.keys(grouped).length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">
                No courses found.
              </p>
            ) : (
              Object.entries(grouped).map(([discipline, courses]) => (
                <div key={discipline}>
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-50">
                    {discipline}
                  </div>
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      role="option"
                      aria-selected={value === course.id}
                      onClick={() => {
                        onChange(course.id, course);
                        setOpen(false);
                        setSearch("");
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors",
                        value === course.id
                          ? "bg-red-50 text-[hsl(var(--primary))]"
                          : "text-gray-800"
                      )}
                    >
                      <div className="font-medium leading-tight">
                        {course.courseName}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {course.institute} · {course.durationWeeks}w · Best{" "}
                        {course.scoringRule.bestAssignments}/
                        {course.scoringRule.totalAssignments} assignments
                      </div>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
