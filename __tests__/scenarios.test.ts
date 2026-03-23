import { describe, it, expect } from "vitest";
import { SCENARIOS } from "@/lib/tasks/scenarios";

describe("scenario data integrity", () => {
  it("every scenario has required fields", () => {
    for (const s of SCENARIOS) {
      expect(s.id).toBeTruthy();
      expect(s.title).toBeTruthy();
      expect(s.applicantProfile).toBeTruthy();
      expect(s.financialSummary).toBeDefined();
      expect(s.financialSummary.annualIncome).toBeTruthy();
      expect(s.financialSummary.creditScore).toBeGreaterThan(0);
      expect(s.financialSummary.debtToIncomeRatio).toBeTruthy();
      expect(s.financialSummary.employmentLength).toBeTruthy();
      expect(s.financialSummary.loanAmount).toBeTruthy();
      expect(s.financialSummary.loanPurpose).toBeTruthy();
      expect(["approve", "reject"]).toContain(s.correctAnswer);
      expect(["easy", "medium", "hard"]).toContain(s.difficulty);
    }
  });

  it("has scenarios across all difficulty levels", () => {
    const difficulties = new Set(SCENARIOS.map((s) => s.difficulty));
    expect(difficulties.has("easy")).toBe(true);
    expect(difficulties.has("medium")).toBe(true);
    expect(difficulties.has("hard")).toBe(true);
  });

  it("credit scores are in realistic range", () => {
    for (const s of SCENARIOS) {
      expect(s.financialSummary.creditScore).toBeGreaterThanOrEqual(300);
      expect(s.financialSummary.creditScore).toBeLessThanOrEqual(850);
    }
  });

  it("scenarios with low credit + high DTI tend to be rejects", () => {
    const lowCreditHighDebt = SCENARIOS.filter((s) => {
      const dti = parseInt(s.financialSummary.debtToIncomeRatio);
      return s.financialSummary.creditScore < 630 && dti > 40;
    });
    const rejectPct = lowCreditHighDebt.filter((s) => s.correctAnswer === "reject").length / lowCreditHighDebt.length;
    expect(rejectPct).toBeGreaterThanOrEqual(0.7);
  });
});
