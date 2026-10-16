/**
 * Static course data for the MVP.
 *
 * Each course contains its own scoring rules and certificate thresholds.
 * Rules are based on publicly available NPTEL course information.
 *
 * IMPORTANT: Scoring rules can vary by semester. Always verify against
 * the official course page for your specific semester.
 */

import type { Course } from "@/types/course";
import type { NptelCatalogCourse } from "@/types/nptel-catalog";
import catalogCourses from "@/data/nptel-engineering-courses.json";

// ─── Shared certificate rules (standard NPTEL pattern) ───────────────────────

const standardCertRules = [
  {
    name: "Successfully Completed",
    minimumFinalScore: 40,
    displayOrder: 1,
  },
  {
    name: "Elite",
    minimumFinalScore: 60,
    displayOrder: 2,
  },
  {
    name: "Elite + Silver",
    minimumFinalScore: 75,
    displayOrder: 3,
  },
  {
    name: "Elite + Gold",
    minimumFinalScore: 90,
    displayOrder: 4,
  },
];

// Certificate rules with both assignment and exam minimums
const strictCertRules = [
  {
    name: "Successfully Completed",
    minimumFinalScore: 40,
    minimumAssignmentScore: 40,
    minimumExamScore: 40,
    displayOrder: 1,
  },
  {
    name: "Elite",
    minimumFinalScore: 60,
    minimumAssignmentScore: 40,
    minimumExamScore: 40,
    displayOrder: 2,
  },
  {
    name: "Elite + Silver",
    minimumFinalScore: 75,
    minimumAssignmentScore: 40,
    minimumExamScore: 40,
    displayOrder: 3,
  },
  {
    name: "Elite + Gold",
    minimumFinalScore: 90,
    minimumAssignmentScore: 40,
    minimumExamScore: 40,
    displayOrder: 4,
  },
];

// ─── Course definitions ───────────────────────────────────────────────────────

const CURATED_COURSES: Course[] = [
  // ── Computer Science ──────────────────────────────────────────────────────

  {
    id: "nptel-python-programming",
    courseCode: "CS101",
    courseName: "Programming in Python",
    institute: "IIT Madras",
    instructor: "Prof. Madhavan Mukund",
    durationWeeks: 8,
    description:
      "An introduction to programming using Python. Covers data types, control structures, functions, modules, file I/O, and object-oriented programming.",
    courseUrl: "https://nptel.ac.in/courses/106106145",
    discipline: "Computer Science",
    lastVerifiedAt: "2024-07-01",
    source: "NPTEL official course page",
    scoringRule: {
      id: "rule-python-programming",
      courseId: "nptel-python-programming",
      assignmentWeight: 0.25,
      examWeight: 0.75,
      totalAssignments: 8,
      bestAssignments: 6,
      minimumAssignmentScore: 40,
      minimumExamScore: 40,
      minimumFinalScore: 40,
      assignmentMaxScore: 100,
      examMaxScore: 100,
      certificateRules: strictCertRules,
    },
  },

  {
    id: "nptel-data-structures-algorithms",
    courseCode: "CS201",
    courseName: "Data Structures and Algorithms",
    institute: "IIT Bombay",
    instructor: "Prof. Ajit A. Diwan",
    durationWeeks: 12,
    description:
      "Covers fundamental data structures (arrays, linked lists, trees, graphs, heaps) and algorithmic techniques (sorting, searching, dynamic programming, greedy algorithms).",
    courseUrl: "https://nptel.ac.in/courses/106101060",
    discipline: "Computer Science",
    lastVerifiedAt: "2024-07-01",
    source: "NPTEL official course page",
    scoringRule: {
      id: "rule-dsa",
      courseId: "nptel-data-structures-algorithms",
      assignmentWeight: 0.25,
      examWeight: 0.75,
      totalAssignments: 12,
      bestAssignments: 8,
      minimumAssignmentScore: 40,
      minimumExamScore: 40,
      minimumFinalScore: 40,
      assignmentMaxScore: 100,
      examMaxScore: 100,
      certificateRules: strictCertRules,
    },
  },

  {
    id: "nptel-machine-learning",
    courseCode: "CS301",
    courseName: "Introduction to Machine Learning",
    institute: "IIT Kharagpur",
    instructor: "Prof. Sudeshna Sarkar",
    durationWeeks: 12,
    description:
      "Foundational machine learning concepts including supervised and unsupervised learning, regression, classification, clustering, neural networks, and model evaluation.",
    courseUrl: "https://nptel.ac.in/courses/106105152",
    discipline: "Computer Science",
    lastVerifiedAt: "2024-07-01",
    source: "NPTEL official course page",
    scoringRule: {
      id: "rule-ml",
      courseId: "nptel-machine-learning",
      assignmentWeight: 0.25,
      examWeight: 0.75,
      totalAssignments: 12,
      bestAssignments: 8,
      minimumAssignmentScore: 40,
      minimumExamScore: 40,
      minimumFinalScore: 40,
      assignmentMaxScore: 100,
      examMaxScore: 100,
      certificateRules: strictCertRules,
    },
  },

  {
    id: "nptel-dbms",
    courseCode: "CS401",
    courseName: "Database Management Systems",
    institute: "IIT Madras",
    instructor: "Prof. Partha Pratim Das",
    durationWeeks: 8,
    description:
      "Covers relational databases, SQL, normalization, transactions, concurrency control, indexing, and query optimization.",
    courseUrl: "https://nptel.ac.in/courses/106105175",
    discipline: "Computer Science",
    lastVerifiedAt: "2024-07-01",
    source: "NPTEL official course page",
    scoringRule: {
      id: "rule-dbms",
      courseId: "nptel-dbms",
      assignmentWeight: 0.25,
      examWeight: 0.75,
      totalAssignments: 8,
      bestAssignments: 6,
      minimumAssignmentScore: 40,
      minimumExamScore: 40,
      minimumFinalScore: 40,
      assignmentMaxScore: 100,
      examMaxScore: 100,
      certificateRules: strictCertRules,
    },
  },

  {
    id: "nptel-computer-networks",
    courseCode: "CS501",
    courseName: "Computer Networks and Internet Protocol",
    institute: "IIT Kharagpur",
    instructor: "Prof. Sudip Misra",
    durationWeeks: 12,
    description:
      "Covers OSI and TCP/IP models, network protocols, routing, switching, transport layer, application layer, network security, and wireless networks.",
    courseUrl: "https://nptel.ac.in/courses/106105183",
    discipline: "Computer Science",
    lastVerifiedAt: "2024-07-01",
    source: "NPTEL official course page",
    scoringRule: {
      id: "rule-networks",
      courseId: "nptel-computer-networks",
      assignmentWeight: 0.25,
      examWeight: 0.75,
      totalAssignments: 12,
      bestAssignments: 8,
      minimumAssignmentScore: 40,
      minimumExamScore: 40,
      minimumFinalScore: 40,
      assignmentMaxScore: 100,
      examMaxScore: 100,
      certificateRules: strictCertRules,
    },
  },

  // ── Mathematics ───────────────────────────────────────────────────────────

  {
    id: "nptel-statistics-data-science",
    courseCode: "MA101",
    courseName: "Statistics for Data Science I",
    institute: "IIT Madras",
    instructor: "Prof. Usha Mohan",
    durationWeeks: 12,
    description:
      "Probability theory, random variables, statistical distributions, sampling, hypothesis testing, and regression analysis with applications in data science.",
    courseUrl: "https://nptel.ac.in/courses/111106112",
    discipline: "Mathematics",
    lastVerifiedAt: "2024-07-01",
    source: "NPTEL official course page",
    scoringRule: {
      id: "rule-stats-ds",
      courseId: "nptel-statistics-data-science",
      assignmentWeight: 0.25,
      examWeight: 0.75,
      totalAssignments: 12,
      bestAssignments: 8,
      minimumAssignmentScore: 40,
      minimumExamScore: 40,
      minimumFinalScore: 40,
      assignmentMaxScore: 100,
      examMaxScore: 100,
      certificateRules: strictCertRules,
    },
  },

  {
    id: "nptel-linear-algebra",
    courseCode: "MA201",
    courseName: "Linear Algebra",
    institute: "IIT Madras",
    instructor: "Prof. Soumen Maity",
    durationWeeks: 8,
    description:
      "Covers vectors, matrices, determinants, linear transformations, eigenvalues, eigenvectors, and applications in engineering and data science.",
    courseUrl: "https://nptel.ac.in/courses/111102073",
    discipline: "Mathematics",
    lastVerifiedAt: "2024-07-01",
    source: "NPTEL official course page",
    scoringRule: {
      id: "rule-linear-algebra",
      courseId: "nptel-linear-algebra",
      assignmentWeight: 0.25,
      examWeight: 0.75,
      totalAssignments: 8,
      bestAssignments: 6,
      minimumAssignmentScore: 40,
      minimumExamScore: 40,
      minimumFinalScore: 40,
      assignmentMaxScore: 100,
      examMaxScore: 100,
      certificateRules: standardCertRules,
    },
  },

  // ── Electrical Engineering ────────────────────────────────────────────────

  {
    id: "nptel-digital-circuits",
    courseCode: "EE101",
    courseName: "Digital Circuits",
    institute: "IIT Madras",
    instructor: "Prof. S. Srinivasan",
    durationWeeks: 12,
    description:
      "Boolean algebra, logic gates, combinational and sequential circuits, flip-flops, registers, counters, and digital system design.",
    courseUrl: "https://nptel.ac.in/courses/117106086",
    discipline: "Electrical Engineering",
    lastVerifiedAt: "2024-07-01",
    source: "NPTEL official course page",
    scoringRule: {
      id: "rule-digital-circuits",
      courseId: "nptel-digital-circuits",
      assignmentWeight: 0.25,
      examWeight: 0.75,
      totalAssignments: 12,
      bestAssignments: 8,
      minimumAssignmentScore: 40,
      minimumExamScore: 40,
      minimumFinalScore: 40,
      assignmentMaxScore: 100,
      examMaxScore: 100,
      certificateRules: strictCertRules,
    },
  },

  {
    id: "nptel-signals-systems",
    courseCode: "EE201",
    courseName: "Signals and Systems",
    institute: "IIT Delhi",
    instructor: "Prof. S. C. Dutta Roy",
    durationWeeks: 12,
    description:
      "Continuous and discrete time signals, Fourier series, Fourier transform, Laplace transform, Z-transform, filtering, and system analysis.",
    courseUrl: "https://nptel.ac.in/courses/117102059",
    discipline: "Electrical Engineering",
    lastVerifiedAt: "2024-07-01",
    source: "NPTEL official course page",
    scoringRule: {
      id: "rule-signals",
      courseId: "nptel-signals-systems",
      assignmentWeight: 0.25,
      examWeight: 0.75,
      totalAssignments: 12,
      bestAssignments: 8,
      minimumAssignmentScore: 40,
      minimumExamScore: 40,
      minimumFinalScore: 40,
      assignmentMaxScore: 100,
      examMaxScore: 100,
      certificateRules: strictCertRules,
    },
  },

  // ── Management ────────────────────────────────────────────────────────────

  {
    id: "nptel-project-management",
    courseCode: "MG101",
    courseName: "Project Management for Managers",
    institute: "IIM Calcutta",
    instructor: "Prof. Arun Kanda",
    durationWeeks: 8,
    description:
      "Project lifecycle, planning, scheduling (PERT/CPM), risk management, resource allocation, quality management, and project monitoring.",
    courseUrl: "https://nptel.ac.in/courses/110105039",
    discipline: "Management",
    lastVerifiedAt: "2024-07-01",
    source: "NPTEL official course page",
    scoringRule: {
      id: "rule-project-mgmt",
      courseId: "nptel-project-management",
      assignmentWeight: 0.25,
      examWeight: 0.75,
      totalAssignments: 8,
      bestAssignments: 6,
      minimumAssignmentScore: 40,
      minimumExamScore: 40,
      minimumFinalScore: 40,
      assignmentMaxScore: 100,
      examMaxScore: 100,
      certificateRules: standardCertRules,
    },
  },

  // ── Life Sciences ─────────────────────────────────────────────────────────

  {
    id: "nptel-bioinformatics",
    courseCode: "BT101",
    courseName: "Bioinformatics: Algorithms and Applications",
    institute: "IIT Madras",
    instructor: "Prof. M. Michael Gromiha",
    durationWeeks: 12,
    description:
      "Sequence alignment, phylogenetics, protein structure prediction, gene expression analysis, and machine learning applications in bioinformatics.",
    courseUrl: "https://nptel.ac.in/courses/102106068",
    discipline: "Life Sciences",
    lastVerifiedAt: "2024-07-01",
    source: "NPTEL official course page",
    scoringRule: {
      id: "rule-bioinformatics",
      courseId: "nptel-bioinformatics",
      assignmentWeight: 0.25,
      examWeight: 0.75,
      totalAssignments: 12,
      bestAssignments: 8,
      minimumAssignmentScore: 40,
      minimumExamScore: 40,
      minimumFinalScore: 40,
      assignmentMaxScore: 100,
      examMaxScore: 100,
      certificateRules: strictCertRules,
    },
  },
];

const officialCatalogCourses = catalogCourses as NptelCatalogCourse[];

const FALLBACK_SOURCE_NOTE =
  "Default fallback scoring rule generated from the official July 2026 SWAYAM/NPTEL catalog entry.";

function parseDurationWeeks(duration: string): number {
  const match = duration.match(/\d+/);
  return match ? Math.max(1, Number(match[0])) : 8;
}

function getBestAssignments(totalAssignments: number): number {
  return Math.max(1, Math.min(totalAssignments, Math.round(totalAssignments * 0.67)));
}

const generatedCatalogCourses: Course[] = officialCatalogCourses.map((catalogCourse) => {
  const totalAssignments = parseDurationWeeks(catalogCourse.durationWeeks);

  return {
    id: catalogCourse.id,
    courseCode: catalogCourse.id,
    courseName: catalogCourse.courseName,
    institute: catalogCourse.institute,
    instructor: catalogCourse.instructor,
    durationWeeks: totalAssignments,
    description: `${catalogCourse.courseType} ${catalogCourse.courseLevel} course from the official NPTEL catalog.`,
    courseUrl: catalogCourse.courseUrl,
    discipline: catalogCourse.discipline,
    lastVerifiedAt: "2026-07-01",
    source: "Official SWAYAM/NPTEL July 2026 catalog",
    scoringRule: {
      id: `rule-${catalogCourse.id}`,
      courseId: catalogCourse.id,
      assignmentWeight: 0.25,
      examWeight: 0.75,
      totalAssignments,
      bestAssignments: getBestAssignments(totalAssignments),
      minimumAssignmentScore: 40,
      minimumExamScore: 40,
      minimumFinalScore: 40,
      assignmentMaxScore: 100,
      examMaxScore: 100,
      certificateRules: strictCertRules,
      metadata: {
        source: "temporary-fallback",
        status: "fallback",
        semester: "Jul-Dec 2026",
        verificationUrl: catalogCourse.courseUrl,
        notes: FALLBACK_SOURCE_NOTE,
      },
    },
  };
});

export const COURSES: Course[] = Array.from(
  new Map(
    [...generatedCatalogCourses, ...CURATED_COURSES].map((course) => [course.id, course])
  ).values()
);
