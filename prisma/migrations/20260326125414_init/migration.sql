-- CreateTable
CREATE TABLE "Condition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "cueConfig" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "conditionId" TEXT NOT NULL,
    "demographics" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'consent',
    "currentTrial" INTEGER NOT NULL DEFAULT 0,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "consentedAt" DATETIME,
    "userAgent" TEXT NOT NULL DEFAULT '',
    "ipHash" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Participant_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "Condition" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participantId" TEXT NOT NULL,
    "trialNumber" INTEGER NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "isPractice" BOOLEAN NOT NULL DEFAULT false,
    "scenarioData" TEXT NOT NULL,
    "aiRecommendation" TEXT NOT NULL,
    "aiConfidenceDisplay" TEXT NOT NULL,
    "aiIsCorrect" BOOLEAN NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "participantDecision" TEXT NOT NULL,
    "participantOverride" TEXT,
    "confidenceRating" INTEGER,
    "decisionLatencyMs" INTEGER NOT NULL,
    "totalTrialDurationMs" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Trial_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participantId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" TEXT NOT NULL DEFAULT '{}',
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Event_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrustResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participantId" TEXT NOT NULL,
    "scaleName" TEXT NOT NULL,
    "itemIndex" INTEGER NOT NULL,
    "itemText" TEXT NOT NULL,
    "response" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrustResponse_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Condition_name_key" ON "Condition"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_externalId_key" ON "Participant"("externalId");

-- CreateIndex
CREATE INDEX "Participant_conditionId_idx" ON "Participant"("conditionId");

-- CreateIndex
CREATE INDEX "Participant_status_idx" ON "Participant"("status");

-- CreateIndex
CREATE INDEX "Trial_participantId_idx" ON "Trial"("participantId");

-- CreateIndex
CREATE INDEX "Trial_scenarioId_idx" ON "Trial"("scenarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Trial_participantId_trialNumber_key" ON "Trial"("participantId", "trialNumber");

-- CreateIndex
CREATE INDEX "Event_participantId_idx" ON "Event"("participantId");

-- CreateIndex
CREATE INDEX "Event_eventType_idx" ON "Event"("eventType");

-- CreateIndex
CREATE INDEX "Event_timestamp_idx" ON "Event"("timestamp");

-- CreateIndex
CREATE INDEX "TrustResponse_participantId_idx" ON "TrustResponse"("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "TrustResponse_participantId_scaleName_itemIndex_key" ON "TrustResponse"("participantId", "scaleName", "itemIndex");
