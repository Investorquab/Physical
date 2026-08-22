-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('INGESTED', 'SUBMITTED_SOURCE_CHAIN', 'AWAITING_ATTESTATION', 'PROOF_READY', 'VERIFIED', 'VERIFICATION_FAILED', 'SETTLED');

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONNECTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Station" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "externalStationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawEvent" (
    "id" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "externalRef" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawPayload" JSONB NOT NULL,
    "rawHash" TEXT NOT NULL,

    CONSTRAINT "RawEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "rawEventId" TEXT NOT NULL,
    "parameter" TEXT NOT NULL,
    "normalizedValue" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "eventHash" TEXT NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'INGESTED',

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceSubmission" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "sepoliaTxHash" TEXT NOT NULL,
    "sepoliaBlockNumber" INTEGER NOT NULL,
    "chainKey" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourceSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attestation" (
    "id" TEXT NOT NULL,
    "sourceSubmissionId" TEXT NOT NULL,
    "attestedAt" TIMESTAMP(3),
    "proverCached" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Attestation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "attestationId" TEXT NOT NULL,
    "creditcoinTxHash" TEXT NOT NULL,
    "precompileResult" BOOLEAN NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "conditionJson" JSONB NOT NULL,
    "actionJson" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRun" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,

    CONSTRAINT "JobRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL,
    "jobRunId" TEXT NOT NULL,
    "creditcoinTxHash" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "amountOrState" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "explorerUrl" TEXT NOT NULL,

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_rawEventId_key" ON "Event"("rawEventId");

-- CreateIndex
CREATE UNIQUE INDEX "SourceSubmission_eventId_key" ON "SourceSubmission"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Attestation_sourceSubmissionId_key" ON "Attestation"("sourceSubmissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Verification_attestationId_key" ON "Verification"("attestationId");

-- CreateIndex
CREATE UNIQUE INDEX "Settlement_jobRunId_key" ON "Settlement"("jobRunId");

-- AddForeignKey
ALTER TABLE "Station" ADD CONSTRAINT "Station_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawEvent" ADD CONSTRAINT "RawEvent_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_rawEventId_fkey" FOREIGN KEY ("rawEventId") REFERENCES "RawEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceSubmission" ADD CONSTRAINT "SourceSubmission_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attestation" ADD CONSTRAINT "Attestation_sourceSubmissionId_fkey" FOREIGN KEY ("sourceSubmissionId") REFERENCES "SourceSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_attestationId_fkey" FOREIGN KEY ("attestationId") REFERENCES "Attestation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRun" ADD CONSTRAINT "JobRun_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRun" ADD CONSTRAINT "JobRun_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_jobRunId_fkey" FOREIGN KEY ("jobRunId") REFERENCES "JobRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
