import { Router } from "express";
import { prisma } from "@physical/db";

export const activityRouter = Router();

const EXPLORER_BASE = "https://creditcoin-testnet.blockscout.com/tx";

activityRouter.get("/", async (req, res, next) => {
  try {
    const verifiedEvents = await prisma.event.findMany({
      where: { status: { in: ["VERIFIED", "VERIFICATION_FAILED"] } },
      orderBy: { observedAt: "desc" },
      take: 30,
      include: {
        sourceSubmission: { include: { attestation: { include: { verification: true } } } },
      },
    });

    const settlements = await prisma.settlement.findMany({
      orderBy: { id: "desc" },
      take: 30,
      include: { jobRun: { include: { job: true } } },
    });

    const eventItems = verifiedEvents.map((e) => {
      const verification = e.sourceSubmission?.attestation?.verification ?? null;
      return {
        id: `event-${e.id}`,
        type: "event_verified" as const,
        title: `${e.parameter.toUpperCase()} reading ${e.status === "VERIFIED" ? "verified" : "failed verification"}: ${e.normalizedValue}${e.unit}`,
        status: e.status,
        timestamp: e.observedAt.toISOString(),
        txHash: verification?.creditcoinTxHash ?? null,
        explorerUrl: verification ? `${EXPLORER_BASE}/${verification.creditcoinTxHash}` : null,
      };
    });

    const settlementItems = settlements.map((s) => ({
      id: `settlement-${s.id}`,
      type: "settlement" as const,
      title: `Coordination rule "${s.jobRun.job.name}" settled`,
      status: s.status,
      timestamp: s.jobRun.triggeredAt.toISOString(),
      txHash: s.creditcoinTxHash,
      explorerUrl: s.explorerUrl,
    }));

    const combined = [...eventItems, ...settlementItems].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    res.json(combined);
  } catch (err) {
    next(err);
  }
});
