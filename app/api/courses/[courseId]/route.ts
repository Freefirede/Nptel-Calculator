import { NextResponse } from "next/server";
import { courseService } from "@/lib/services/courseService";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const course = courseService.getCourseById(courseId);

    if (!course) {
      return NextResponse.json(
        { error: "Course not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ course });
  } catch {
    return NextResponse.json(
      { error: "Failed to load course." },
      { status: 500 }
    );
  }
}
