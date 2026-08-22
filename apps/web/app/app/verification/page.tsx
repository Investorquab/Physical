"use client";

import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { StatusBadge } from "@/components/app/status-badge";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useEvents } from "@/lib/api/events";

const VERIFICATION_STATUSES = new Set([
  "AWAITING_ATTESTATION",
  "PROOF_READY",
  "VERIFIED",
  "VERIFICATION_FAILED",
]);

export default function VerificationPage() {
  const { data, isLoading, isError } = useEvents();
  const verificationEvents = data?.filter((event) => VERIFICATION_STATUSES.has(event.status));

  return (
    <>
      <PageHeader
        title="Verification"
        description="Events that have entered or completed protocol verification."
      />

      {isLoading && <TableSkeleton rows={4} />}

      {isError && (
        <EmptyState
          icon={ShieldCheck}
          title="Couldn't load verification data"
          description="Something went wrong fetching events. Try refreshing the page."
        />
      )}

      {!isLoading && !isError && verificationEvents && verificationEvents.length === 0 && (
        <EmptyState
          icon={ShieldCheck}
          title="Nothing to verify yet"
          description="Events will appear here once they clear ingestion and enter protocol verification."
        />
      )}

      {!isLoading && !isError && verificationEvents && verificationEvents.length > 0 && (
        <div className="overflow-hidden rounded-base border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-raised text-xs uppercase tracking-wider text-text-muted">
                <th className="px-4 py-3 font-medium">Event hash</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Verification tx</th>
              </tr>
            </thead>
            <tbody>
              {verificationEvents.map((event) => (
                <tr key={event.id} className="border-b border-border/60 last:border-b-0">
                  <td className="px-4 py-4 font-mono text-xs text-text-muted">
                    {event.eventHash.slice(0, 10)}...{event.eventHash.slice(-6)}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={event.status} />
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-text-muted">
                    {event.creditcoinVerificationTxHash
                      ? `${event.creditcoinVerificationTxHash.slice(0, 10)}...${event.creditcoinVerificationTxHash.slice(-6)}`
                      : "Pending"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
