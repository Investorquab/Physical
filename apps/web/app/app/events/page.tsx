"use client";

import { Radio, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { StatusBadge } from "@/components/app/status-badge";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { WaveformStamp, type WaveTone } from "@/components/physical/waveform";
import { useEvents } from "@/lib/api/events";
import type { EventStatus } from "@physical/shared-types";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const waveTone: Record<EventStatus, WaveTone> = {
  INGESTED: "live",
  SUBMITTED_SOURCE_CHAIN: "live",
  AWAITING_ATTESTATION: "pending",
  PROOF_READY: "pending",
  VERIFIED: "verified",
  VERIFICATION_FAILED: "error",
  SETTLED: "accent",
};

export default function EventsPage() {
  const { data, isLoading, isError } = useEvents();

  return (
    <>
      <PageHeader
        title="Events"
        description="Every physical reading, shown as its own signal trace, in pipeline order."
      />

      {isLoading && <TableSkeleton rows={5} />}

      {isError && (
        <EmptyState
          icon={Radio}
          title="Couldn't load events"
          description="Something went wrong fetching event data. Try refreshing the page."
        />
      )}

      {!isLoading && !isError && data && data.length === 0 && (
        <EmptyState
          icon={Radio}
          title="No events observed yet"
          description="Events will appear here as connected infrastructure reports readings."
        />
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="flex flex-col gap-2">
          {data.map((event) => {
            const isStamped = event.status === "VERIFIED" || event.status === "SETTLED";

            return (
              <div
                key={event.id}
                className="flex items-center gap-6 rounded-base border border-border bg-bg-raised px-4 py-3"
              >
                <WaveformStamp
                  seed={event.eventHash}
                  tone={waveTone[event.status]}
                  stamped={isStamped}
                  className="shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs text-text-muted">{event.parameter}</span>
                    <span className="font-mono text-sm font-medium">
                      {event.normalizedValue} {event.unit}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">{formatTime(event.observedAt)}</span>
                </div>

                <StatusBadge status={event.status} />

                <div className="w-16 shrink-0 text-right">
                  {event.explorerUrl ? (
                    <a
                      href={event.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-live transition-colors hover:text-live/80"
                    >
                      View
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="text-xs text-text-muted">N/A</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
