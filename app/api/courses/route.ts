import { NextResponse } from "next/server";
import { courseService } from "@/lib/services/courseService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const discipline = searchParams.get("discipline");

    let courses = courseService.getAllCourses();

    if (query) {
      courses = courseService.searchCourses(query);
    } else if (discipline) {
      courses = courseService.getCoursesByDiscipline(discipline);
    }

    return NextResponse.json({
      courses,
      total: courses.length,
      disciplines: courseService.getDisciplines(),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load courses." },
      { status: 500 }
    );
  }
}
