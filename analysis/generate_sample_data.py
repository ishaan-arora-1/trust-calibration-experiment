"""
Generate realistic sample data for analysis notebook development and testing.
Simulates 120 participants across 4 conditions with behavioral patterns
that reflect known trust calibration effects from the literature.
"""

import csv
import json
import random
import uuid
from datetime import datetime, timedelta

random.seed(42)

CONDITIONS = {
    "control": {
        "reliance_rate": 0.65,
        "latency_mean": 8500,
        "latency_sd": 3000,
        "trust_mean": 3.2,
    },
    "humanlike": {
        "reliance_rate": 0.78,
        "latency_mean": 6200,
        "latency_sd": 2500,
        "trust_mean": 3.8,
    },
    "authority": {
        "reliance_rate": 0.82,
        "latency_mean": 5800,
        "latency_sd": 2200,
        "trust_mean": 4.1,
    },
    "humanlike_calibrated": {
        "reliance_rate": 0.70,
        "latency_mean": 7500,
        "latency_sd": 2800,
        "trust_mean": 3.5,
    },
}

SCENARIOS = [f"s{i:02d}" for i in range(3, 23)]
PARTICIPANTS_PER_CONDITION = 30
TRIALS_PER_PARTICIPANT = 15
AI_ACCURACY = 0.75

TRUST_ITEMS = [
    "The AI assistant was reliable.",
    "I could trust the AI assistant's recommendations.",
    "I felt confident in the AI assistant's judgments.",
    "The AI assistant was competent at the task.",
    "I could depend on the AI assistant.",
    "The AI assistant was predictable.",
    "I was suspicious of the AI assistant's recommendations.",
]


def generate():
    trials_rows = []
    participants_rows = []
    trust_rows = []
    base_time = datetime(2026, 3, 15, 10, 0, 0)

    for cond_name, params in CONDITIONS.items():
        for p_idx in range(PARTICIPANTS_PER_CONDITION):
            pid = f"P-{uuid.uuid4().hex[:8].upper()}"
            start_time = base_time + timedelta(
                hours=random.randint(0, 240),
                minutes=random.randint(0, 59),
            )

            correct_count = round(TRIALS_PER_PARTICIPANT * AI_ACCURACY)
            ai_schedule = [True] * correct_count + [False] * (TRIALS_PER_PARTICIPANT - correct_count)
            random.shuffle(ai_schedule)

            random.shuffle(SCENARIOS)
            trial_scenarios = SCENARIOS[:TRIALS_PER_PARTICIPANT]

            for t_idx in range(TRIALS_PER_PARTICIPANT):
                ai_correct = ai_schedule[t_idx]

                noise = random.gauss(0, 0.1)
                effective_reliance = params["reliance_rate"] + noise
                if not ai_correct:
                    effective_reliance -= 0.15

                accepted = random.random() < effective_reliance
                decision = "accept" if accepted else "override"

                correct_answer = random.choice(["approve", "reject"])
                ai_rec = correct_answer if ai_correct else ("reject" if correct_answer == "approve" else "approve")

                override_choice = ""
                if decision == "override":
                    override_choice = "reject" if ai_rec == "approve" else "approve"

                latency = max(1500, int(random.gauss(params["latency_mean"], params["latency_sd"])))
                if decision == "override":
                    latency = int(latency * 1.3)

                confidence = random.choices([1, 2, 3, 4, 5], weights=[5, 10, 25, 35, 25])[0]
                if decision == "override":
                    confidence = max(1, confidence - 1)

                total_duration = latency + random.randint(1000, 4000)
                timestamp = start_time + timedelta(seconds=t_idx * 45 + random.randint(0, 20))

                trials_rows.append({
                    "participant_id": pid,
                    "condition": cond_name,
                    "trial_number": t_idx + 3,
                    "scenario_id": trial_scenarios[t_idx],
                    "ai_recommendation": ai_rec,
                    "ai_is_correct": ai_correct,
                    "correct_answer": correct_answer,
                    "participant_decision": decision,
                    "participant_override": override_choice,
                    "confidence_rating": confidence,
                    "decision_latency_ms": latency,
                    "total_trial_duration_ms": total_duration,
                    "ai_confidence_display": "",
                    "timestamp": timestamp.isoformat(),
                })

            age_ranges = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"]
            education = [
                "High school or equivalent", "Some college",
                "Bachelor's degree", "Master's degree",
                "Doctoral degree",
            ]
            ai_fam = [
                "No experience", "Minimal experience",
                "Some experience", "Regular use",
                "Expert / Professional",
            ]

            end_time = start_time + timedelta(minutes=random.randint(12, 25))
            participants_rows.append({
                "participant_id": pid,
                "condition": cond_name,
                "status": "completed",
                "demographics": json.dumps({
                    "ageRange": random.choice(age_ranges),
                    "education": random.choice(education),
                    "aiFamiliarity": random.choice(ai_fam),
                }),
                "trials_completed": TRIALS_PER_PARTICIPANT,
                "trust_responses": len(TRUST_ITEMS),
                "started_at": start_time.isoformat(),
                "completed_at": end_time.isoformat(),
            })

            for item_idx, item_text in enumerate(TRUST_ITEMS):
                is_reverse = item_idx == 6
                raw = max(1, min(5, int(random.gauss(params["trust_mean"], 0.8))))
                response = 6 - raw if is_reverse else raw
                trust_rows.append({
                    "participant_id": pid,
                    "condition": cond_name,
                    "scale_name": "trust_in_automation",
                    "item_index": item_idx,
                    "item_text": item_text,
                    "response": response,
                    "timestamp": end_time.isoformat(),
                })

    write_csv("sample_data/trials_export.csv", trials_rows)
    write_csv("sample_data/participants_export.csv", participants_rows)
    write_csv("sample_data/trust_responses_export.csv", trust_rows)

    with open("sample_data/trials_export.json", "w") as f:
        json.dump({"data": trials_rows, "count": len(trials_rows)}, f, indent=2)

    print(f"Generated {len(participants_rows)} participants")
    print(f"Generated {len(trials_rows)} trials")
    print(f"Generated {len(trust_rows)} trust responses")


def write_csv(path, rows):
    if not rows:
        return
    with open(path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)


if __name__ == "__main__":
    generate()
