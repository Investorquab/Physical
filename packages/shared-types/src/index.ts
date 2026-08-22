import { z } from "zod";

// Every event's real journey through the pipeline. UI status badges map 1:1 to this.
export const EventStatus = z.enum([
  "INGESTED",
  "SUBMITTED_SOURCE_CHAIN",
  "AWAITING_ATTESTATION",
  "PROOF_READY",
  "VERIFIED",
  "VERIFICATION_FAILED",
  "SETTLED",
]);
export type EventStatus = z.infer<typeof EventStatus>;

export const Provider = z.object({
  id: z.string(),
  name: z.string(),
  sourceType: z.string(), // e.g. "air_quality"
  baseUrl: z.string().url(),
  status: z.enum(["CONNECTED", "DEGRADED", "DISCONNECTED"]),
  createdAt: z.string().datetime(),
});
export type Provider = z.infer<typeof Provider>;

export const Station = z.object({
  id: z.string(),
  providerId: z.string(),
  externalStationId: z.string(),
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
});
export type Station = z.infer<typeof Station>;

export const PhysicalEvent = z.object({
  id: z.string(),
  stationId: z.string(),
  providerId: z.string(),
  parameter: z.string(), // e.g. "pm25"
  normalizedValue: z.number(),
  unit: z.string(),
  observedAt: z.string().datetime(),
  eventHash: z.string(),
  status: EventStatus,
  sourceTxHash: z.string().nullable(),
  sourceBlockNumber: z.number().nullable(),
  creditcoinVerificationTxHash: z.string().nullable(),
  explorerUrl: z.string().url().nullable(),
});
export type PhysicalEvent = z.infer<typeof PhysicalEvent>;

export const Job = z.object({
  id: z.string(),
  name: z.string(),
  conditionJson: z.record(z.unknown()),
  actionJson: z.record(z.unknown()),
  isActive: z.boolean(),
});
export type Job = z.infer<typeof Job>;

export const Settlement = z.object({
  id: z.string(),
  jobRunId: z.string(),
  creditcoinTxHash: z.string(),
  actionType: z.string(),
  status: z.enum(["PENDING", "CONFIRMED", "FAILED"]),
  explorerUrl: z.string().url(),
});
export type Settlement = z.infer<typeof Settlement>;

export const ActivityItem = z.object({
  id: z.string(),
  type: z.enum(["event_verified", "settlement"]),
  title: z.string(),
  status: z.string(),
  timestamp: z.string().datetime(),
  txHash: z.string().nullable(),
  explorerUrl: z.string().url().nullable(),
});
export type ActivityItem = z.infer<typeof ActivityItem>;

export const ApiError = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
});
export type ApiError = z.infer<typeof ApiError>;
