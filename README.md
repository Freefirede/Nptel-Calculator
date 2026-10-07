<<<<<<< HEAD
# Nptel-calculator-
=======
# NPTEL Score Calculator

An independent academic utility for NPTEL students to calculate scores, check certificate eligibility, plan exam targets, and analyse assignment performance.

**Not affiliated with or endorsed by NPTEL, IITs, or any official institution.**

---

## Features

- **Score Calculator** — Weighted final score (25% assignment + 75% exam, configurable per course)
- **Assignment input scales** — Enter assignment averages or weekly marks out of 25 or 100; both are normalized consistently
- **Best-N Assignments** — Automatically selects the best N assignments for courses that use this rule
- **Certificate Eligibility** — Checks eligibility for Successfully Completed, Elite, Silver, and Gold certificates
- **Score Planner** — Calculates the minimum exam score needed for each certificate target
- **What-If Simulator** — Live slider showing how different exam scores affect your final result
- **Performance Predictor** — Statistical estimate of exam performance based on assignment history
- **Assignment Charts** — Line chart, score distribution, and exam simulation curve
- **Course Browser** — Search 587 engineering courses from the official July 2026 NPTEL/SWAYAM catalog, including duration in weeks and official preview links

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd nptel-score-calculator

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Copy `.env.example` to `.env.local` and fill in values if needed:

```bash
cp .env.example .env.local
```

The MVP works fully without any environment variables (all course data is static).

---

## Running Tests

```bash
npm test
```

35 unit tests covering:

- Standard 25/75 weighted scoring
- Best-N assignment selection and average calculation
- Certificate eligibility at all boundaries (40 / 60 / 75 / 90)
- Required exam score calculation
- Impossible target detection

---

## Project Structure

```
nptel-score-calculator/
├── app/                    # Next.js App Router pages and API routes
│   ├── page.tsx            # Home — calculator on landing
│   ├── calculate/          # Detailed calculator with charts
│   ├── planner/            # Required score + what-if simulator
│   ├── predict/            # Performance predictor
│   ├── courses/            # Course browser and detail pages
│   ├── about/              # About page
│   └── api/                # API routes (calculate, predict, required-score)
│
├── components/
│   ├── layout/             # Header, Footer
│   ├── calculator/         # Calculator UI components
│   ├── planner/            # Planner UI components
│   ├── predictor/          # Prediction UI components
│   ├── charts/             # Recharts chart components
│   └── ui/                 # shadcn/ui base components
│
├── lib/
│   ├── scoring/            # Scoring engine (pure functions, fully testable)
│   ├── services/           # Domain services (scoringService, predictionService)
│   └── validation/         # Zod schemas
│
├── types/                  # TypeScript type definitions
├── data/                   # Scoring rules and official NPTEL catalog data
└── tests/                  # Unit tests
```

---

## Scoring Architecture

All scoring logic is **deterministic and configurable per course**. No scoring rules are hard-coded inside React components.

```
Course → ScoringRule → calculateScore()
                     → calculateAssignmentScore()   (best-N selection)
                     → calculateCertificate()       (configurable thresholds)
                     → calculateRequiredExamScore() (what score do I need?)
                     → simulateExamScores()         (what-if table)
```

Each course defines its own:
- Assignment weight and exam weight
- Best-N assignment rule
- Minimum assignment, exam, and final score requirements
- Certificate rules with per-certificate thresholds

Course rules also carry provenance metadata. Until official beta assessment
values are supplied for a course, the app marks that course as a
`temporary-fallback` rule and validates the standard 25% assignment / 75% exam
shape, including 40/100 minimums for both the assignment average and raw exam
score. Official beta values can later be added per course without changing the
scoring engine.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (base-nova) |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Testing | Jest + ts-jest |

---

## Adding a New Course

Edit `data/courses.ts` and add a new entry following the existing pattern:

```ts
{
  id: "nptel-your-course-id",
  courseCode: "XX101",
  courseName: "Your Course Name",
  institute: "IIT ...",
  instructor: "Prof. ...",
  durationWeeks: 12,
  // ...
  scoringRule: {
    assignmentWeight: 0.25,
    examWeight: 0.75,
    totalAssignments: 12,
    bestAssignments: 8,
    minimumExamScore: 30,
    minimumFinalScore: 40,
    // ...
    certificateRules: [ /* per-course certificate thresholds */ ],
  },
}
```

---

## Disclaimer

This calculator provides estimates based on configured scoring rules. Scoring rules can vary by semester and course. Always verify the official grading criteria on the [NPTEL website](https://nptel.ac.in) for your specific course and semester.

---

## License

MIT
>>>>>>> 3427c6c (Initial commit: NPTEL score calculator)
