# Trust Calibration — Screening Test Prototype

A minimal web prototype demonstrating A/B condition manipulation and decision logging for studying trust in AI recommendations.

## Condition Logic

Participants are randomly assigned to one of two conditions when they click "Start":

| Condition | Agent Name | Tone | Example Message |
|-----------|-----------|------|-----------------|
| **A** (`system_formal`) | "AI System" | Formal | "Based on the applicant's financial profile, the recommendation is to approve..." |
| **B** (`humanlike_conversational`) | "Alex" | Conversational | "Hey, I've looked over this application and I'd suggest we approve it..." |

Both conditions present the same loan applicant data and the same underlying recommendation (approve). The only difference is the AI agent's **name** and **tone** — this is the independent variable that may influence the participant's trust and reliance.

Assignment is random (50/50 coin flip) and happens client-side.

## Logging Implementation

Every decision is logged as a JSON object to `experiment_log.json` in the project root via a `POST /api/log` endpoint.

Each entry contains exactly these five fields:

```json
{
  "participant_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "condition": "system_formal",
  "decision": "accept",
  "timestamp": "2026-03-26T14:12:33.421Z",
  "latency_ms": 4823
}
```

| Field | Description |
|-------|-------------|
| `participant_id` | UUID generated per session |
| `condition` | `"system_formal"` (A) or `"humanlike_conversational"` (B) |
| `decision` | `"accept"` or `"reject"` — whether the participant followed the AI |
| `timestamp` | ISO 8601 timestamp of the decision |
| `latency_ms` | Milliseconds from task presentation to decision click |

The log file accumulates entries across sessions. You can also view the current log at `GET /api/log`.

## How to Run Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Click **Start** → review the loan application → click **Accept** or **Reject** → see your response logged.

To view the log: click "View Log (JSON)" on the completion screen, or open `experiment_log.json` in the project root, or visit [http://localhost:3000/api/log](http://localhost:3000/api/log).

## Sample Output

See [`sample_output.json`](./sample_output.json) for an example log file with 4 entries.

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- TypeScript
- File-based JSON logging (no database required)
