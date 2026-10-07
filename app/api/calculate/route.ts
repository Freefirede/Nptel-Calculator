import { NextResponse } from "next/server";
import { courseService } from "@/lib/services/courseService";
import { scoringService } from "@/lib/services/scoringService";
import { calculateRequestSchema } from "@/lib/validation/schemas";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = calculateRequestSchema.parse(body);

    const course = courseService.getCourseById(parsed.courseId);
    if (!course) {
      return NextResponse.json(
        { error: "Course not found." },
        { status: 404 }
      );
    }

    const result = scoringService.calculateFinalScore(
      course,
      parsed.assignments,
      parsed.examScore
    );

    return NextResponse.json({ result, course: { id: course.id, courseName: course.courseName } });
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
