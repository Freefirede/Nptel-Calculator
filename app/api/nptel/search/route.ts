import { NextResponse } from "next/server";

const SWAYAM_SEARCH_URL = "https://swayam.gov.in/search_courses";

function cleanText(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function readField(card: string, className: string) {
  const match = card.match(
    new RegExp(
      `<(?:div|h4)[^>]*class="[^"]*${className}[^"]*"[^>]*>[\\s\\S]*?<span[^>]*>([\\s\\S]*?)<\\/span>`,
      "i"
    )
  );
  return match ? cleanText(match[1]) : "";
}

function readDuration(card: string) {
  const match = card.match(/(\d+)\s+Weeks?/i);
  return match ? `${match[1]} weeks` : "Not specified";
}

function parseCourses(html: string) {
  return Array.from(
    html.matchAll(/<a href="(https:\/\/onlinecourses\.nptel\.ac\.in\/[^"]+\/preview)">([\s\S]*?)<\/a>/gi)
  )
    .map((match, index) => {
      const card = match[2];
      const provider = cleanText(card.match(/<strong[^>]*>([\s\S]*?)<\/strong>/i)?.[1] ?? "");
      if (provider.toLowerCase() !== "nptel") return null;

      const courseName = readField(card, "courseTitle");
      if (!courseName) return null;

      return {
        id: `live-nptel-${index}-${courseName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        courseName,
        discipline: "Engineering",
        instructor: readField(card, "courseInstructor") || "Not specified",
        institute: readField(card, "courseInstitute") || "NPTEL",
        courseType: "Live NPTEL catalog result",
        startDate: "",
        endDate: "",
        durationWeeks: readDuration(card),
        credits: "",
        courseLevel: "",
        courseUrl: match[1],
      };
    })
    .filter((course): course is NonNullable<typeof course> => course !== null);
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query) {
    return NextResponse.json({ courses: [], total: 0 });
  }

  try {
    const response = await fetch(
      `${SWAYAM_SEARCH_URL}?searchText=${encodeURIComponent(query)}`,
      { next: { revalidate: 300 } }
    );
    if (!response.ok) {
      return NextResponse.json(
        { error: `NPTEL search returned HTTP ${response.status}.` },
        { status: 502 }
      );
    }

    const courses = parseCourses(await response.text());
    return NextResponse.json({ courses, total: courses.length });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach the live NPTEL course catalog." },
      { status: 502 }
    );
  }
}
