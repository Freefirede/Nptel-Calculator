/**
 * Unit tests for certificate eligibility calculation.
 */

import { calculateCertificate } from "@/lib/scoring/certificate";
import type { CertificateRule } from "@/types/course";

const RULES: CertificateRule[] = [
  { name: "Successfully Completed", minimumFinalScore: 40, displayOrder: 1 },
  { name: "Elite", minimumFinalScore: 60, displayOrder: 2 },
  { name: "Elite + Silver", minimumFinalScore: 75, displayOrder: 3 },
  { name: "Elite + Gold", minimumFinalScore: 90, displayOrder: 4 },
];

// Helper: evaluate certificate for a final score
function certFor(finalScore: number, meetsMinimums = true) {
  return calculateCertificate(finalScore, 80, 70, RULES, meetsMinimums);
}

describe("Certificate eligibility", () => {
  // ── Boundary tests ────────────────────────────────────────────────────────

  test("39.9 → Not Eligible", () => {
    expect(certFor(39.9).name).toBe("Not Eligible");
  });

  test("40.0 → Successfully Completed", () => {
    const result = certFor(40);
    expect(result.name).toBe("Successfully Completed");
    expect(result.isEligible).toBe(true);
  });

  test("59.9 → Successfully Completed", () => {
    expect(certFor(59.9).name).toBe("Successfully Completed");
  });

  test("60.0 → Elite", () => {
    expect(certFor(60).name).toBe("Elite");
  });

  test("74.9 → Elite", () => {
    expect(certFor(74.9).name).toBe("Elite");
  });

  test("75.0 → Elite + Silver", () => {
    expect(certFor(75).name).toBe("Elite + Silver");
  });

  test("89.9 → Elite + Silver", () => {
    expect(certFor(89.9).name).toBe("Elite + Silver");
  });

  test("90.0 → Elite + Gold", () => {
    expect(certFor(90).name).toBe("Elite + Gold");
  });

  test("100 → Elite + Gold", () => {
    expect(certFor(100).name).toBe("Elite + Gold");
  });

  // ── Minimums not met ────────────────────────────────────────────────────

  test("meetsMinimums=false → Not Eligible regardless of score", () => {
    expect(certFor(95, false).name).toBe("Not Eligible");
    expect(certFor(80, false).isEligible).toBe(false);
  });

  // ── Per-certificate minimums ─────────────────────────────────────────────

  test("Exam minimum check on individual cert rule", () => {
    const rulesWithExamMin: CertificateRule[] = [
      { name: "Completed", minimumFinalScore: 40, minimumExamScore: 30, displayOrder: 1 },
      { name: "Elite", minimumFinalScore: 60, minimumExamScore: 30, displayOrder: 2 },
    ];
    // examScore = 20, below 30 → not eligible even if final is high
    const result = calculateCertificate(75, 80, 20, rulesWithExamMin, true);
    expect(result.isEligible).toBe(false);
    expect(result.name).toBe("Not Eligible");
  });
});
