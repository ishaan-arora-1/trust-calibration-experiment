# Trust Calibration Experiment Platform

A modular, open-source experimentation engine for studying **trust calibration** in AI-assisted decision systems. Built for the Google Summer of Code 2026 — ISSR, University of Alabama.

## What This Does

This platform enables researchers to systematically manipulate humanlike and authority-signaling interface cues (agent name, tone, confidence framing) and measure how these cues affect user reliance on AI recommendations. It captures behavioral trust metrics at high temporal resolution — not just what people decided, but how long they took, how confident they were, and whether they changed their mind.

## Key Features

- **Configurable Cue Manipulation Engine** — 3+ cue dimensions (agent name, tone, confidence framing) controlled via JSON config. Adding new dimensions requires zero code changes.
- **Balanced Random Condition Assignment** — Participants are automatically assigned to the condition with the fewest current participants.
- **22 Decision Scenarios** — Realistic loan application scenarios with known correct answers across easy/medium/hard difficulty levels.
- **Controlled AI Accuracy** — AI is correct exactly 75% of the time (configurable), using a deterministic Fisher-Yates schedule.
- **Rich Behavioral Instrumentation** — Decision latency (ms precision), confidence ratings, hover tracking, decision revisions, and full interaction logs.
- **Post-Task Trust Survey** — 7-item Likert scale adapted from trust-in-automation literature.
- **Admin Dashboard** — Real-time participant monitoring, condition balance tracking, one-click CSV/JSON data export.
- **Analysis Notebook** — Jupyter notebook with statistical tests (chi-square, ANOVA, pairwise t-tests), effect sizes, and publication-ready visualizations.
- **48 Automated Tests** — Comprehensive test suite covering the cue engine, task logic, export utilities, and scenario data integrity.

## Quick Start

### Prerequisites

- Node.js 20+ and npm
- Python 3.8+ (for analysis notebook, optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/ishaan-arora-1/trust-calibration-experiment.git
cd trust-calibration-experiment

# Install dependencies
npm install

# Set up the database
npx prisma migrate dev --name init
npm run db:seed

# Start the development server
npm run dev
```

The experiment is now running at **http://localhost:3000**.

- **Participant view**: http://localhost:3000/experiment
- **Admin dashboard**: http://localhost:3000/admin

### Running Tests

```bash
npm test
```

### Running the Analysis Notebook

```bash
cd analysis
pip install -r requirements.txt
jupyter notebook trust_calibration_analysis.ipynb
```

Sample data is pre-generated in `analysis/sample_data/`. To regenerate:

```bash
python generate_sample_data.py
```

## Architecture

```
trust-calibration-experiment/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Landing page
│   │   ├── experiment/page.tsx       # Full experiment flow
│   │   ├── admin/page.tsx            # Admin dashboard
│   │   └── api/                      # REST API routes
│   │       ├── participants/         # Create & update participants
│   │       ├── events/               # Log events & trials
│   │       ├── export/               # CSV/JSON data export
│   │       └── admin/stats/          # Dashboard statistics
│   ├── components/
│   │   ├── experiment/               # Consent, demographics, trial UI, debrief
│   │   ├── survey/                   # Trust scale survey
│   │   └── ui/                       # shadcn/ui components
│   ├── lib/
│   │   ├── engine/                   # Cue manipulation engine
│   │   │   ├── types.ts              # CueConfig type definitions
│   │   │   ├── cues.ts               # Tone & confidence text generators
│   │   │   └── assignment.ts         # Balanced condition assignment
│   │   ├── tasks/                    # Decision task system
│   │   │   ├── scenarios.ts          # 22 loan application scenarios
│   │   │   ├── accuracy.ts           # AI accuracy schedule controller
│   │   │   └── runner.ts             # Experiment session generator
│   │   ├── export/                   # CSV export utilities
│   │   └── db.ts                     # Prisma client singleton
│   └── hooks/                        # React hooks (timer, experiment state)
├── prisma/
│   ├── schema.prisma                 # Database schema (5 tables)
│   └── seed.mts                      # Seed 4 default conditions
├── analysis/
│   ├── trust_calibration_analysis.ipynb  # Full analysis pipeline
│   ├── generate_sample_data.py       # Sample data generator
│   ├── requirements.txt              # Python dependencies
│   └── sample_data/                  # Pre-generated sample datasets
├── docs/
│   ├── SCHEMA.md                     # Event schema documentation
│   ├── ARCHITECTURE.md               # System architecture
│   └── DEPLOYMENT.md                 # Deployment guide
└── __tests__/                        # 48 unit tests
```

## Experiment Flow

1. **Informed Consent** — IRB-style consent form
2. **Demographics** — Age range, education, AI familiarity
3. **Condition Assignment** — Balanced randomization across conditions
4. **Instructions** — Task explanation with AI assistant name personalized to condition
5. **Practice Trials** (2) — Familiarization with the interface
6. **Main Trials** (15) — Loan decision scenarios with AI recommendations
7. **Trust Survey** — 7-item post-task trust scale
8. **Debrief** — Study explanation and completion code

## Experimental Conditions

| Condition | Agent Name | Tone | Confidence | Avatar |
|-----------|-----------|------|------------|--------|
| `control` | Decision Assistant | Formal | Calibrated (72%) | System icon |
| `humanlike` | Alex | Conversational | Overstated | Human initial |
| `authority` | Dr. Sarah Chen | Formal | Overstated | Expert initial |
| `humanlike_calibrated` | Alex | Conversational | Calibrated (72%) | Human initial |

## Data Export

The admin dashboard provides one-click export of four data types:

| Export | Format | Contents |
|--------|--------|----------|
| **Trial Data** | CSV / JSON | All decisions, latency, AI accuracy, confidence ratings |
| **Participant Data** | CSV / JSON | Demographics, conditions, completion status |
| **Event Log** | CSV / JSON | Fine-grained behavioral event stream |
| **Trust Survey** | CSV / JSON | Post-task trust scale responses |

All exports are also available programmatically:

```
GET /api/export?type=trials&format=csv
GET /api/export?type=participants&format=json
GET /api/export?type=events&format=csv
GET /api/export?type=trust&format=json
```

## Extending the Platform

### Adding a New Cue Dimension

1. Add the new field to `CueConfig` in `src/lib/engine/types.ts`
2. Add the dimension to the seed conditions in `prisma/seed.mts`
3. Update the UI in `TrialView.tsx` to render the new cue
4. Re-seed: `npm run db:seed`

### Adding New Scenarios

Add entries to the `SCENARIOS` array in `src/lib/tasks/scenarios.ts`. Each scenario needs:
- Unique `id`
- `correctAnswer` ("approve" or "reject")
- Financial summary with credit score, DTI ratio, etc.

### Adding a New Task Type

1. Create a new scenario type in `src/lib/tasks/`
2. Create a new trial view component in `src/components/experiment/`
3. Wire it into the experiment flow in `src/app/experiment/page.tsx`

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** + shadcn/ui
- **Prisma** + SQLite
- **Vitest** + React Testing Library
- **Python** + Jupyter (analysis)

## License

MIT

## Acknowledgments

Built for the Institute for Social Science Research (ISSR) at the University of Alabama as part of Google Summer of Code 2026.
