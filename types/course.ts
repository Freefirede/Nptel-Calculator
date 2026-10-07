// Course and scoring rule type definitions

export interface Course {
  id: string;
  courseCode: string;
  courseName: string;
  institute: string;
  instructor: string;
  durationWeeks: number;
  description: string;
  courseUrl?: string;
  discipline: string;
  scoringRule: ScoringRule;
  lastVerifiedAt: string;
  source: string;
}

export interface ScoringRule {
  id: string;
  courseId: string;
  /** Weight of assignment component, e.g. 0.25 for 25% */
  assignmentWeight: number;
  /** Weight of exam component, e.g. 0.75 for 75% */
  examWeight: number;
  /** Total number of assignments in the course */
  totalAssignments: number;
  /** How many best assignments count toward the score */
  bestAssignments: number;
  /** Minimum assignment average required (0–100) */
  minimumAssignmentScore: number;
  /** Minimum exam score required (0–100) */
  minimumExamScore: number;
  /** Minimum final score required (0–100) */
  minimumFinalScore: number;
  /** Maximum marks per assignment */
  assignmentMaxScore: number;
  /** Maximum exam score */
  examMaxScore: number;
  /** Configurable certificate rules */
  certificateRules: CertificateRule[];
  /** Provenance and lifecycle for this course-specific grading rule. */
  metadata?: ScoringRuleMetadata;
}

export type ScoringRuleSource = "temporary-fallback" | "official-beta";
export type ScoringRuleStatus = "fallback" | "verified";

export interface ScoringRuleMetadata {
  source: ScoringRuleSource;
  status: ScoringRuleStatus;
  semester: string;
  verifiedAt?: string;
  verificationUrl?: string;
  notes?: string;
}

export interface CertificateRule {
  /** E.g. "Elite + Gold", "Elite + Silver", "Elite", "Successfully Completed" */
  name: string;
  minimumFinalScore: number;
  /** Minimum assignment score required (optional – some courses don't have this) */
  minimumAssignmentScore?: number;
  /** Minimum exam score required (optional) */
  minimumExamScore?: number;
  displayOrder: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  weekNumber: number;
  title: string;
  maximumScore: number;
}

export type Discipline =
  | "Computer Science"
  | "Electrical Engineering"
  | "Mechanical Engineering"
  | "Civil Engineering"
  | "Mathematics"
  | "Physics"
  | "Chemistry"
  | "Management"
  | "Humanities"
  | "Life Sciences"
  | "Other";
