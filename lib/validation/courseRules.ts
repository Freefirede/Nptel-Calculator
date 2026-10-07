import { z } from "zod";
import type { Course, ScoringRule, ScoringRuleMetadata } from "@/types/course";

const scoringRuleMetadataSchema = z
  .object({
    source: z.enum(["temporary-fallback", "official-beta"]),
    status: z.enum(["fallback", "verified"]),
    semester: z.string().min(1),
    verifiedAt: z.string().optional(),
    verificationUrl: z.string().url().optional(),
    notes: z.string().optional(),
  })
  .superRefine((metadata, ctx) => {
    if (metadata.source === "official-beta" && metadata.status !== "verified") {
      ctx.addIssue({
        code: "custom",
        path: ["status"],
        message: "Official beta rules must have verified status.",
      });
    }
  });

export const scoringRuleSchema = z
  .object({
    id: z.string().min(1),
    courseId: z.string().min(1),
    assignmentWeight: z.number().min(0).max(1),
    examWeight: z.number().min(0).max(1),
    totalAssignments: z.number().int().min(1),
    bestAssignments: z.number().int().min(1),
    minimumAssignmentScore: z.number().min(0).max(100),
    minimumExamScore: z.number().min(0).max(100),
    minimumFinalScore: z.number().min(0).max(100),
    assignmentMaxScore: z.number().positive(),
    examMaxScore: z.number().positive(),
    certificateRules: z.array(
      z.object({
        name: z.string().min(1),
        minimumFinalScore: z.number().min(0).max(100),
        minimumAssignmentScore: z.number().min(0).max(100).optional(),
        minimumExamScore: z.number().min(0).max(100).optional(),
        displayOrder: z.number().int().min(1),
      })
    ),
    metadata: scoringRuleMetadataSchema.optional(),
  })
  .superRefine((rule, ctx) => {
    if (rule.bestAssignments > rule.totalAssignments) {
      ctx.addIssue({
        code: "custom",
        path: ["bestAssignments"],
        message: "Best assignments cannot exceed total assignments.",
      });
    }
    if (Math.abs(rule.assignmentWeight + rule.examWeight - 1) > 0.0001) {
      ctx.addIssue({
        code: "custom",
        path: ["assignmentWeight"],
        message: "Assignment and exam weights must total 100%.",
      });
    }
  });

export function getValidatedScoringRule(course: Course): ScoringRule {
  const metadata: ScoringRuleMetadata = course.scoringRule.metadata ?? {
    source: "temporary-fallback",
    status: "fallback",
    semester: "Unknown",
    verificationUrl: course.courseUrl,
    notes:
      "Temporary standard NPTEL rule. Replace with the official course-specific beta rule when available.",
  };

  const result = scoringRuleSchema.safeParse({
    ...course.scoringRule,
    metadata,
  });
  if (!result.success) {
    throw new Error(
      `Invalid scoring rule for ${course.id}: ${result.error.issues
        .map((issue) => issue.message)
        .join("; ")}`
    );
  }

  return result.data as ScoringRule;
}

export function validateCourseRules(courses: Course[]): void {
  courses.forEach((course) => {
    getValidatedScoringRule(course);
  });
}
