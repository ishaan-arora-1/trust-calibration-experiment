import { prisma } from "@/lib/db";
import type { ConditionAssignment, CueConfig } from "./types";

/**
 * Assigns a participant to a condition using balanced random assignment.
 * Picks the active condition with the fewest current participants to maintain
 * roughly equal group sizes, with random tiebreaking.
 */
export async function assignCondition(): Promise<ConditionAssignment> {
  const conditions = await prisma.condition.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { participants: true } },
    },
  });

  if (conditions.length === 0) {
    throw new Error("No active conditions found. Run the seed script first.");
  }

  const minCount = Math.min(...conditions.map((c) => c._count.participants));
  const candidates = conditions.filter(
    (c) => c._count.participants === minCount
  );

  const selected = candidates[Math.floor(Math.random() * candidates.length)];

  return {
    conditionId: selected.id,
    conditionName: selected.name,
    cueConfig: JSON.parse(selected.cueConfig) as CueConfig,
  };
}

/**
 * Retrieves the cue configuration for a given condition ID.
 */
export async function getConditionConfig(
  conditionId: string
): Promise<CueConfig> {
  const condition = await prisma.condition.findUniqueOrThrow({
    where: { id: conditionId },
  });

  return JSON.parse(condition.cueConfig) as CueConfig;
}

/**
 * Pure function for balanced assignment selection — useful for testing
 * without database dependency.
 */
export function selectBalancedCondition<
  T extends { id: string; participantCount: number },
>(conditions: T[]): T {
  if (conditions.length === 0) {
    throw new Error("No conditions provided");
  }

  const minCount = Math.min(...conditions.map((c) => c.participantCount));
  const candidates = conditions.filter(
    (c) => c.participantCount === minCount
  );

  return candidates[Math.floor(Math.random() * candidates.length)];
}
