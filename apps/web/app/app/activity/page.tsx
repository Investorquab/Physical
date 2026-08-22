"use client";

import { Activity, CheckCircle2, XCircle, Landmark } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useActivity } from "@/lib/api/activity";

function iconFor(type: string, status: string) {
  if (type === "settlement") return Landmark;
  if (status === "VERIFICATION_FAILED") return XCircle;
  return CheckCircle2;
}

function colorFor(type: string, status: string) {
  if (status === "VERIFICATION_FAILED") return "text-pending";
  if (type === "settlement") return "text-accent";
  return "text-verified";
}

export default function ActivityPage() {
  const { data, isLoading, isError } = useActivity();

  return (
    <>
      <PageHeader
        title="Activity"
        description="A combined timeline of events, verifications, and settlements."
      />

      {isLoading && <TableSkeleton rows={4} />}

      {isError && (
        <EmptyState
          icon={Activity}
          title="Couldn't load activity"
          description="Something went wrong fetching the timeline. Try refreshing the page."
        />
      )}

      {!isLoading && !isError && data && data.length === 0 && (
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="This timeline fills in as your connected infrastructure starts generating attestable events."
        />
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="space-y-2">
          {data.map((item) => {
            const Icon = iconFor(item.type, item.status);
            const color = colorFor(item.type, item.status);
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-base border border-border bg-bg-raised px-4 py-3"
              >
                <Icon size={18} className={color} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-text">{item.title}</p>
                  <p className="text-xs text-text-muted">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
                {item.explorerUrl && (
                  <a
                    href={item.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 font-mono text-xs text-text-muted underline underline-offset-2 hover:text-text"
                  >
                    {item.txHash?.slice(0, 8)}...
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
