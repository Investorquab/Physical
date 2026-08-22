import { cn } from "@/lib/utils";

export type StatusTone = "live" | "accent" | "verified" | "pending" | "error" | "muted";

const toneClasses: Record<StatusTone, string> = {
  live: "bg-live/10 text-live",
  accent: "bg-accent/10 text-accent",
  verified: "bg-verified/10 text-verified",
  pending: "bg-pending/10 text-pending",
  error: "bg-error/10 text-error",
  muted: "bg-bg-raised text-text-muted",
};

const eventStatusTone: Record<string, StatusTone> = {
  INGESTED: "live",
  SUBMITTED_SOURCE_CHAIN: "live",
  AWAITING_ATTESTATION: "pending",
  PROOF_READY: "pending",
  VERIFIED: "verified",
  VERIFICATION_FAILED: "error",
  SETTLED: "accent",
};

const providerStatusTone: Record<string, StatusTone> = {
  CONNECTED: "verified",
  DEGRADED: "pending",
  DISCONNECTED: "error",
};

const settlementStatusTone: Record<string, StatusTone> = {
  PENDING: "pending",
  CONFIRMED: "verified",
  FAILED: "error",
};

const statusLabels: Record<string, string> = {
  INGESTED: "Ingested",
  SUBMITTED_SOURCE_CHAIN: "Submitted",
  AWAITING_ATTESTATION: "Awaiting attestation",
  PROOF_READY: "Proof ready",
  VERIFIED: "Verified",
  VERIFICATION_FAILED: "Verification failed",
  SETTLED: "Settled",
  CONNECTED: "Connected",
  DEGRADED: "Degraded",
  DISCONNECTED: "Disconnected",
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  FAILED: "Failed",
};

export function StatusBadge({
  status,
  tone,
}: {
  status: string;
  tone?: StatusTone;
}) {
  const resolvedTone =
    tone ??
    eventStatusTone[status] ??
    providerStatusTone[status] ??
    settlementStatusTone[status] ??
    "muted";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[resolvedTone]
      )}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}
