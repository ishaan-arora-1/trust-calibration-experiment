// @ts-nocheck
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const prisma = new PrismaClient();

const conditions = [
  {
    name: "control",
    description:
      "Neutral baseline — generic system name, formal tone, calibrated confidence",
    cueConfig: JSON.stringify({
      agentName: "Decision Assistant",
      agentTone: "formal",
      confidenceFraming: "calibrated",
      agentGreeting: "Analysis complete.",
      agentAvatar: "system",
    }),
  },
  {
    name: "humanlike",
    description:
      "Full humanlike treatment — personal name, conversational tone, overstated confidence",
    cueConfig: JSON.stringify({
      agentName: "Alex",
      agentTone: "conversational",
      confidenceFraming: "overstated",
      agentGreeting: "Hey! I took a look at this one.",
      agentAvatar: "human",
    }),
  },
  {
    name: "authority",
    description:
      "Authority treatment — expert title, formal tone, overstated confidence",
    cueConfig: JSON.stringify({
      agentName: "Dr. Sarah Chen",
      agentTone: "formal",
      confidenceFraming: "overstated",
      agentGreeting: "Based on my analysis of the data:",
      agentAvatar: "expert",
    }),
  },
  {
    name: "humanlike_calibrated",
    description:
      "Humanlike name + conversational tone, but with calibrated (honest) confidence",
    cueConfig: JSON.stringify({
      agentName: "Alex",
      agentTone: "conversational",
      confidenceFraming: "calibrated",
      agentGreeting: "Hey! I took a look at this one.",
      agentAvatar: "human",
    }),
  },
];

async function main() {
  console.log("Seeding conditions...");

  for (const condition of conditions) {
    await prisma.condition.upsert({
      where: { name: condition.name },
      update: condition,
      create: condition,
    });
  }

  const count = await prisma.condition.count();
  console.log(`Seeded ${count} conditions successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
