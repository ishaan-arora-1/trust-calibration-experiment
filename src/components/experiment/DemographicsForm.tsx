"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DemographicsFormProps {
  onSubmit: (demographics: Record<string, string>) => void;
  loading?: boolean;
}

const AGE_RANGES = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
const EDUCATION_LEVELS = [
  "High school or equivalent",
  "Some college",
  "Bachelor's degree",
  "Master's degree",
  "Doctoral degree",
  "Other",
];
const AI_FAMILIARITY = [
  "No experience",
  "Minimal experience",
  "Some experience",
  "Regular use",
  "Expert / Professional",
];

export function DemographicsForm({ onSubmit, loading }: DemographicsFormProps) {
  const [data, setData] = useState<Record<string, string>>({
    ageRange: "",
    education: "",
    aiFamiliarity: "",
    occupation: "",
  });

  const isValid = data.ageRange && data.education && data.aiFamiliarity;

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>About You</CardTitle>
          <CardDescription>
            A few brief questions before we begin. This helps us understand
            our participant pool.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Age Range *</Label>
            <div className="grid grid-cols-3 gap-2">
              {AGE_RANGES.map((range) => (
                <button
                  key={range}
                  onClick={() => setData({ ...data, ageRange: range })}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    data.ageRange === range
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:bg-accent"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Highest Education Level *</Label>
            <div className="grid grid-cols-2 gap-2">
              {EDUCATION_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setData({ ...data, education: level })}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors text-left ${
                    data.education === level
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:bg-accent"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Experience with AI Assistants *</Label>
            <div className="grid grid-cols-1 gap-2">
              {AI_FAMILIARITY.map((level) => (
                <button
                  key={level}
                  onClick={() => setData({ ...data, aiFamiliarity: level })}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors text-left ${
                    data.aiFamiliarity === level
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:bg-accent"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Occupation (optional)</Label>
            <Input
              placeholder="e.g., Student, Engineer, Teacher"
              value={data.occupation}
              onChange={(e) => setData({ ...data, occupation: e.target.value })}
            />
          </div>

          <Button
            onClick={() => onSubmit(data)}
            disabled={!isValid || loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Setting up your session..." : "Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
