/**
 * Course Service — course data access layer.
 *
 * In the MVP, courses are loaded from static data files.
 * The interface is designed so a database layer can be swapped in
 * without changing how components consume courses.
 */

import type { Course } from "@/types/course";
import { COURSES } from "@/data/courses";
import { getValidatedScoringRule, validateCourseRules } from "@/lib/validation/courseRules";

validateCourseRules(COURSES);
const VALIDATED_COURSES = COURSES.map((course) => ({
  ...course,
  scoringRule: getValidatedScoringRule(course),
}));

export const courseService = {
  /**
   * Get all available courses.
   */
  getAllCourses(): Course[] {
    return VALIDATED_COURSES;
  },

  /**
   * Get a single course by ID.
   */
  getCourseById(id: string): Course | null {
    return VALIDATED_COURSES.find((c) => c.id === id) ?? null;
  },

  /**
   * Get courses filtered by discipline.
   */
  getCoursesByDiscipline(discipline: string): Course[] {
    return VALIDATED_COURSES.filter((c) => c.discipline === discipline);
  },

  /**
   * Search courses by name or code.
   */
  searchCourses(query: string): Course[] {
    const q = query.toLowerCase();
    return VALIDATED_COURSES.filter(
      (c) =>
        c.courseName.toLowerCase().includes(q) ||
        c.courseCode.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.institute.toLowerCase().includes(q)
    );
  },

  /**
   * Get the list of available disciplines.
   */
  getDisciplines(): string[] {
    const disciplines = new Set(COURSES.map((c) => c.discipline));
    return Array.from(disciplines).sort();
  },
};
