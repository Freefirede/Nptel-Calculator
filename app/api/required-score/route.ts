import { NextResponse } from "next/server";
import { courseService } from "@/lib/services/courseService";
import { scoringService } from "@/lib/services/scoringService";
import { requiredScoreRequestSchema } from "@/lib/validation/schemas";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requiredScoreRequestSchema.parse(body);

    const course = courseService.getCourseById(parsed.courseId);
    if (!course) {
      return NextResponse.json(
        { error: "Course not found." },
        { status: 404 }
      );
    }

    const result = scoringService.getRequiredExamScore(
      course,
      parsed.assignmentAverage,
      parsed.targetCertificate
    );

    return NextResponse.json({ result });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed.", issues: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Calculation failed." },
      { status: 500 }
    );
  }
}
