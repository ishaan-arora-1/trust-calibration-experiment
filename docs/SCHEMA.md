# Event Schema Documentation

## Overview

The trust calibration experiment platform captures behavioral data at multiple levels of granularity. This document describes every data structure logged during an experiment session.

## Tables

### Participant

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Internal unique identifier |
| externalId | String | Human-readable participant code (e.g., `P-A1B2C3D4`) |
| conditionId | UUID | FK to Condition |
| demographics | JSON | `{ ageRange, education, aiFamiliarity, occupation }` |
| status | String | Participant progress: `consent`, `demographics`, `instructions`, `experiment`, `survey`, `completed`, `abandoned` |
| currentTrial | Int | Last completed trial number |
| startedAt | DateTime | Session creation timestamp |
| completedAt | DateTime? | Session completion timestamp (null if abandoned) |
| consentedAt | DateTime? | Consent timestamp |
| userAgent | String | Browser user agent string |
| ipHash | String | Hashed IP for deduplication (not PII) |

### Condition

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| name | String | Condition label (e.g., `control`, `humanlike`, `authority`) |
| description | String | Human-readable description |
| cueConfig | JSON | `{ agentName, agentTone, confidenceFraming, agentGreeting, agentAvatar }` |
| isActive | Boolean | Whether this condition is currently used in assignment |

#### CueConfig Fields

| Field | Values | Description |
|-------|--------|-------------|
| agentName | e.g., "Decision Assistant", "Alex", "Dr. Sarah Chen" | Name displayed to participant |
| agentTone | `"formal"` or `"conversational"` | Language style of AI messages |
| confidenceFraming | `"calibrated"` or `"overstated"` | How AI expresses confidence |
| agentGreeting | String | Opening phrase of AI messages |
| agentAvatar | `"system"`, `"human"`, or `"expert"` | Avatar style identifier |

### Trial

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| participantId | UUID | FK to Participant |
| trialNumber | Int | Sequential trial number (1-indexed, includes practice) |
| scenarioId | String | Scenario identifier (e.g., `s01`) |
| isPractice | Boolean | Whether this is a practice trial |
| scenarioData | JSON | Full scenario object shown to participant |
| aiRecommendation | String | `"approve"` or `"reject"` |
| aiConfidenceDisplay | String | Exact confidence text shown to participant |
| aiIsCorrect | Boolean | Whether the AI recommendation matched the correct answer |
| correctAnswer | String | `"approve"` or `"reject"` |
| participantDecision | String | `"accept"` (followed AI) or `"override"` (disagreed) |
| participantOverride | String? | If overridden: `"approve"` or `"reject"` |
| confidenceRating | Int? | Self-reported confidence (1-5 Likert, optional) |
| decisionLatencyMs | Int | Milliseconds from scenario display to accept/override click |
| totalTrialDurationMs | Int | Full trial duration including confidence rating |
| timestamp | DateTime | Server timestamp |

### Event

General-purpose event log for fine-grained behavioral instrumentation.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| participantId | UUID | FK to Participant |
| eventType | String | Event category (see below) |
| payload | JSON | Event-specific data |
| timestamp | DateTime | Server timestamp |

#### Event Types

| eventType | payload | Description |
|-----------|---------|-------------|
| `experiment_started` | `{}` | Participant began the experiment |
| `instructions_completed` | `{}` | Finished reading instructions |
| `trial_completed` | `{ trialNumber, decision, latencyMs }` | Summary of each trial |
| `experiment_completed` | `{}` | Participant finished all phases |
| `page_view` | `{ page }` | Page navigation |
| `decision_hover` | `{ button, durationMs }` | Hover over decision button |
| `decision_change` | `{ from, to, trialNumber }` | Changed mind during trial |

### TrustResponse

Post-task trust survey responses.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| participantId | UUID | FK to Participant |
| scaleName | String | Scale identifier (e.g., `trust_in_automation`) |
| itemIndex | Int | Item position within scale (0-indexed) |
| itemText | String | Full text of the survey item |
| response | Int | Likert scale value (1-5) |
| timestamp | DateTime | Server timestamp |

## Key Derived Metrics

These can be computed from the raw data:

| Metric | Computation |
|--------|-------------|
| **Reliance Rate** | `count(participantDecision == "accept") / total_trials` per condition |
| **Override Rate** | `count(participantDecision == "override") / total_trials` per condition |
| **Appropriate Reliance** | Accepted when AI was correct |
| **Appropriate Override** | Overridden when AI was incorrect |
| **Over-trust** | Accepted when AI was incorrect |
| **Under-trust** | Overridden when AI was correct |
| **Mean Decision Latency** | `mean(decisionLatencyMs)` per condition |
| **Trust Score** | Mean of trust scale responses (reverse-code item 7) |
