/**
 * Validation schemas using Zod v4.
 *
 * Used by API routes, server actions, and React Hook Form.
 */

import { z } from "zod";

// ─── Score bounds ─────────────────────────────────────────────────────────────

export const scoreSchema = z
  .number()
  .min(0, "Score cannot be negative.")
  .max(100, "Score cannot exceed 100.");

export const examScoreSchema = z
  .number()
  .min(0, "Exam score cannot be negative.")
  .max(100, "Please enter a score between 0 and 100.");

// ─── Assignment input ─────────────────────────────────────────────────────────

export const assignmentInputSchema = z.object({
  weekNumber: z
    .number()
    .int("Week number must be an integer.")
    .min(1, "Week number must be at least 1.")
    .max(52, "Week number cannot exceed 52."),
  score: z
    .number()
    .min(0, "Score cannot be negative."),
  maxScore: z
    .number()
    .min(1, "Maximum score must be at least 1.")
    .optional(),
});

export const assignmentListSchema = z
  .array(assignmentInputSchema)
  .min(1, "Please enter at least one assignment score.")
  .max(52, "Cannot enter more than 52 assignments.");

// ─── Calculator form ──────────────────────────────────────────────────────────

export const calculatorFormSchema = z.object({
  courseId: z.string().min(1, "Please select a course."),
  assignments: assignmentListSchema,
  examScore: examScoreSchema,
});

export type CalculatorFormValues = z.infer<typeof calculatorFormSchema>;

// ─── Planner form ─────────────────────────────────────────────────────────────

export const plannerFormSchema = z.object({
  courseId: z.string().min(1, "Please select a course."),
  assignmentAverage: z
    .number()
    .min(0, "Assignment average cannot be negative.")
    .max(100, "Assignment average cannot exceed 100."),
  targetCertificate: z.string().min(1, "Please select a target certificate."),
});

export type PlannerFormValues = z.infer<typeof plannerFormSchema>;

// ─── Prediction form ──────────────────────────────────────────────────────────

export const predictionFormSchema = z.object({
  courseId: z.string().min(1, "Please select a course."),
  assignments: assignmentListSchema,
  mockTestScores: z
    .array(
      z
        .number()
        .min(0, "Score cannot be negative.")
        .max(100, "Score cannot exceed 100.")
    )
    .max(10, "Maximum 10 mock test scores.")
    .optional(),
  expectedExamScore: examScoreSchema.optional(),
});

export type PredictionFormValues = z.infer<typeof predictionFormSchema>;

// ─── API request schemas ──────────────────────────────────────────────────────

export const calculateRequestSchema = z.object({
  courseId: z.string().min(1),
  assignments: assignmentListSchema,
  examScore: examScoreSchema,
});

export const predictRequestSchema = z.object({
  courseId: z.string().min(1),
  assignments: assignmentListSchema,
  mockTestScores: z.array(scoreSchema).max(10).optional(),
  expectedExamScore: examScoreSchema.optional(),
});

export const requiredScoreRequestSchema = z.object({
  courseId: z.string().min(1),
  assignmentAverage: scoreSchema,
  targetCertificate: z.string().min(1),
});
