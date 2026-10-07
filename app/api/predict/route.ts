import { NextResponse } from "next/server";
import { courseService } from "@/lib/services/courseService";
import { scoringService } from "@/lib/services/scoringService";
import { predictionService } from "@/lib/services/predictionService";
import { predictRequestSchema } from "@/lib/validation/schemas";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = predictRequestSchema.parse(body);

    const course = courseService.getCourseById(parsed.courseId);
    if (!course) {
      return NextResponse.json(
        { error: "Course not found." },
        { status: 404 }
      );
    }

    // Calculate current assignment performance
    const assignmentResult = scoringService.calculateAssignments(
      course,
      parsed.assignments
    );
    const performance = scoringService.analyzePerformance(assignmentResult);

    // Build prediction input
    const predictionInput = {
      assignmentAverage: assignmentResult.average,
      recentAssignmentAverage: performance.recentAverage,
      assignmentConsistency: performance.consistencyScore / 100,
      mockTestScores: parsed.mockTestScores,
      practiceScores: [],
      expectedExamScore: parsed.expectedExamScore,
      weeksTaken: parsed.assignments.length,
      totalWeeks: course.durationWeeks,
    };

    const prediction = await predictionService.predict(predictionInput);

    // Compute estimated final score using the course's actual scoring rule
    const estimatedFinalScore = Math.round(
      assignmentResult.average * course.scoringRule.assignmentWeight +
        prediction.estimatedExamScore * course.scoringRule.examWeight
    );

    return NextResponse.json({
      prediction: { ...prediction, estimatedFinalScore },
      assignmentResult,
      performance,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed.", issues: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Prediction failed." },
      { status: 500 }
    );
  }
}
