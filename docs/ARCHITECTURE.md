# Architecture

## System Overview

The Trust Calibration Experiment Platform is a monolithic Next.js application with a SQLite database. This architecture was chosen deliberately for portability — researchers can clone the repo, run `npm install`, and have a fully functional experiment platform with no external service dependencies.

## Data Flow

```
Participant Browser
    │
    ├─ POST /api/participants      → Create participant + assign condition
    │                                 → Returns session config + trial schedule
    │
    ├─ POST /api/events            → Log behavioral events (page views, hovers)
    │
    ├─ POST /api/events/trial      → Record trial decision + latency
    │
    ├─ POST /api/events/trust      → Record trust survey responses
    │
    └─ PATCH /api/participants/:id → Update status (completed/abandoned)

Admin Browser
    │
    ├─ GET /api/admin/stats        → Dashboard statistics
    │
    └─ GET /api/export?type=X      → Download data (CSV/JSON)
```

## Core Modules

### Cue Manipulation Engine (`src/lib/engine/`)

The engine is config-driven. Each experimental condition is stored as a JSON `CueConfig` object in the database. The engine provides:

- **`assignment.ts`**: Balanced random assignment that picks the condition with the fewest participants. This ensures roughly equal group sizes without manual intervention.
- **`cues.ts`**: Template-based text generators for AI recommendations. Templates are organized by tone (formal/conversational) and confidence framing (calibrated/overstated).
- **`types.ts`**: TypeScript interfaces with an index signature (`[key: string]: string`) allowing arbitrary cue dimensions to be added without modifying core types.

### Task System (`src/lib/tasks/`)

- **`scenarios.ts`**: 22 loan application scenarios with known correct answers. Each has an applicant profile, financial summary, and difficulty rating.
- **`accuracy.ts`**: Generates a deterministic accuracy schedule using Fisher-Yates shuffle. Given `N` trials at `X%` accuracy, exactly `floor(N * X)` trials will have correct AI recommendations.
- **`runner.ts`**: Combines scenarios with the accuracy schedule and cue engine to produce a complete `ExperimentSession` for a participant.

### Instrumentation (`src/hooks/`)

- **`useTimer`**: High-precision timer using `performance.now()` for sub-millisecond latency measurement.
- **`useExperiment`**: Central state machine managing the experiment flow through 8 phases (consent → demographics → instructions → practice → experiment → survey → debrief).

## Database Schema

Five tables with proper indexes:

- **Condition**: Experiment conditions with JSON cue configs
- **Participant**: Session tracking with demographic data
- **Trial**: Per-trial decisions with latency and AI accuracy metadata
- **Event**: Free-form behavioral event stream
- **TrustResponse**: Post-task survey responses

See `docs/SCHEMA.md` for complete field-level documentation.

## Design Decisions

### Why SQLite?

SQLite requires zero setup, works offline, and the database file can be directly shared with collaborators or backed up. For a research tool that needs to be deployable by researchers who may not have database administration experience, this is the right trade-off.

### Why Pre-determined AI Accuracy?

Rather than making each trial independently random (which could result in 60% or 90% accuracy for a given participant by chance), we pre-determine exactly which trials will be correct. This ensures every participant sees the same accuracy rate, reducing noise in the behavioral data.

### Why Balanced Assignment?

Simple random assignment can produce unbalanced groups, especially with small sample sizes. The balanced assignment algorithm always picks the condition with the fewest participants, ensuring groups stay within ±1 of each other.

### Why No Feedback During Main Trials?

Showing participants whether the AI was correct after each trial would introduce learning effects. Participants would update their trust based on observed accuracy rather than the interface cues we're manipulating. Practice trials (always correct) familiarize participants with the interface without contaminating the trust calibration measurement.
