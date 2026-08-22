import type {
  Provider as DbProvider,
  Station as DbStation,
  Job as DbJob,
  Settlement as DbSettlement,
  Event as DbEvent,
  SourceSubmission,
  Attestation,
  Verification,
} from "@physical/db";
import type { Provider, Station, PhysicalEvent, Job, Settlement } from "@physical/shared-types";

const EXPLORER_BASE = "https://creditcoin-testnet.blockscout.com/tx";

export function mapProvider(p: DbProvider): Provider {
  return {
    id: p.id,
    name: p.name,
    sourceType: p.sourceType,
    baseUrl: p.baseUrl,
    status: p.status as Provider["status"],
    createdAt: p.createdAt.toISOString(),
  };
}

export function mapStation(s: DbStation): Station {
  return {
    id: s.id,
    providerId: s.providerId,
    externalStationId: s.externalStationId,
    name: s.name,
    lat: s.lat,
    lng: s.lng,
  };
}

type EventWithRelations = DbEvent & {
  rawEvent: { stationId: string; station: { providerId: string } };
  sourceSubmission:
    | (SourceSubmission & {
        attestation: (Attestation & { verification: Verification | null }) | null;
      })
    | null;
};

export function mapEvent(e: EventWithRelations): PhysicalEvent {
  const verification = e.sourceSubmission?.attestation?.verification ?? null;
  return {
    id: e.id,
    stationId: e.rawEvent.stationId,
    providerId: e.rawEvent.station.providerId,
    parameter: e.parameter,
    normalizedValue: e.normalizedValue,
    unit: e.unit,
    observedAt: e.observedAt.toISOString(),
    eventHash: e.eventHash,
    status: e.status as PhysicalEvent["status"],
    sourceTxHash: e.sourceSubmission?.sepoliaTxHash ?? null,
    sourceBlockNumber: e.sourceSubmission?.sepoliaBlockNumber ?? null,
    creditcoinVerificationTxHash: verification?.creditcoinTxHash ?? null,
    explorerUrl: verification ? `${EXPLORER_BASE}/${verification.creditcoinTxHash}` : null,
  };
}

export function mapJob(j: DbJob): Job {
  return {
    id: j.id,
    name: j.name,
    conditionJson: j.conditionJson as Record<string, unknown>,
    actionJson: j.actionJson as Record<string, unknown>,
    isActive: j.isActive,
  };
}

export function mapSettlement(s: DbSettlement): Settlement {
  return {
    id: s.id,
    jobRunId: s.jobRunId,
    creditcoinTxHash: s.creditcoinTxHash,
    actionType: s.actionType,
    status: s.status as Settlement["status"],
    explorerUrl: s.explorerUrl,
  };
}
