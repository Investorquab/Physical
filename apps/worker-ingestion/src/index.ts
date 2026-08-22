import path from "node:path";
import dotenv from "dotenv";
import { prisma } from "@physical/db";
import { OpenAQAdapter } from "./adapters/openaq";
import { SepoliaSubmitter } from "./sepolia";
import type { NormalizedReading } from "./adapters/types";

dotenv.config({ path: path.resolve(__dirname, "../../../.env"), quiet: true });

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
// Ethereum Sepolia's chainKey on Creditcoin CC3 Testnet, per
// docs.creditcoin.org/attestcoin-protocol/attestcoin-protocol-chains-environments
const SEPOLIA_CHAIN_KEY = 1;

async function getOrCreateProvider(adapter: OpenAQAdapter) {
  const existing = await prisma.provider.findFirst({ where: { name: adapter.name } });
  if (existing) return existing;
  return prisma.provider.create({
    data: {
      name: adapter.name,
      sourceType: adapter.sourceType,
      baseUrl: adapter.baseUrl,
      status: "CONNECTED",
    },
  });
}

async function getOrCreateStation(
  providerId: string,
  reading: Pick<NormalizedReading, "externalStationId" | "stationName" | "lat" | "lng">
) {
  const existing = await prisma.station.findFirst({
    where: { providerId, externalStationId: reading.externalStationId },
  });
  if (existing) return existing;
  return prisma.station.create({
    data: {
      providerId,
      externalStationId: reading.externalStationId,
      name: reading.stationName,
      lat: reading.lat,
      lng: reading.lng,
    },
  });
}

async function alreadyIngested(stationId: string, externalRef: string): Promise<boolean> {
  const existing = await prisma.rawEvent.findFirst({ where: { stationId, externalRef } });
  return existing !== null;
}

async function runOnce(adapter: OpenAQAdapter, submitter: SepoliaSubmitter) {
  console.log(`[worker-ingestion] polling ${adapter.name}...`);
  const readings = await adapter.fetchLatest();
  console.log(`[worker-ingestion] fetched ${readings.length} new reading(s)`);

  const provider = await getOrCreateProvider(adapter);

  for (const reading of readings) {
    const station = await getOrCreateStation(provider.id, reading);

    if (await alreadyIngested(station.id, reading.externalRef)) {
      console.log(`[worker-ingestion] skipping duplicate: ${reading.externalRef}`);
      continue;
    }

    const payloadHash = SepoliaSubmitter.hashPayload(reading.rawPayload);

    const rawEvent = await prisma.rawEvent.create({
      data: {
        stationId: station.id,
        externalRef: reading.externalRef,
        rawPayload: reading.rawPayload as any,
        rawHash: payloadHash,
      },
    });

    const event = await prisma.event.create({
      data: {
        rawEventId: rawEvent.id,
        parameter: reading.parameter,
        normalizedValue: reading.value,
        unit: reading.unit,
        observedAt: reading.observedAt,
        eventHash: payloadHash,
        status: "INGESTED",
      },
    });

    console.log(
      `[worker-ingestion] created event ${event.id} (${reading.parameter}=${reading.value}${reading.unit}), submitting to Sepolia...`
    );

    try {
      const result = await submitter.recordEvent({
        internalEventId: event.id,
        rawPayload: reading.rawPayload,
        value: reading.value,
        observedAt: reading.observedAt,
      });

      await prisma.sourceSubmission.create({
        data: {
          eventId: event.id,
          sepoliaTxHash: result.txHash,
          sepoliaBlockNumber: result.blockNumber,
          chainKey: SEPOLIA_CHAIN_KEY,
        },
      });

      await prisma.event.update({
        where: { id: event.id },
        data: { status: "SUBMITTED_SOURCE_CHAIN" },
      });

      console.log(
        `[worker-ingestion] event ${event.id} submitted: ${result.txHash} (block ${result.blockNumber})`
      );
    } catch (err) {
      console.error(`[worker-ingestion] FAILED to submit event ${event.id} to Sepolia:`, err);
      // Event stays at status INGESTED. This means we failed to even get it
      // on-chain — different from VERIFICATION_FAILED, which means it reached
      // the chain but the Attestcoin Protocol verification itself failed.
      // A retry pass can pick up INGESTED events later (not built yet — P1).
    }
  }
}

async function main() {
  const adapter = new OpenAQAdapter({
    apiKey: process.env.OPENAQ_API_KEY ?? "",
    locationId: process.env.OPENAQ_LOCATION_ID ?? "",
    targetParameter: process.env.OPENAQ_TARGET_PARAMETER ?? "pm25",
  });

  const submitter = new SepoliaSubmitter({
    rpcUrl: process.env.SEPOLIA_RPC_URL ?? "",
    privateKey: process.env.SEPOLIA_SUBMITTER_PRIVATE_KEY ?? "",
    contractAddress: process.env.SOURCE_EVENT_REGISTRY_ADDRESS ?? "",
  });

  console.log(`[worker-ingestion] starting, polling every ${POLL_INTERVAL_MS / 1000}s`);

  const run = () => runOnce(adapter, submitter).catch((err) => console.error("[worker-ingestion] run failed:", err));

  await run();
  setInterval(run, POLL_INTERVAL_MS);
}

main();
