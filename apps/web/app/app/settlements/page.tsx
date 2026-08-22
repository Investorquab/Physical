"use client";

import { Landmark, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { StatusBadge } from "@/components/app/status-badge";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useSettlements } from "@/lib/api/settlements";

export default function SettlementsPage() {
  const { data, isLoading, isError } = useSettlements();

  return (
    <>
      <PageHeader
        title="Settlements"
        description="Finalized on-chain settlements produced by verified events."
      />

      {isLoading && <TableSkeleton rows={3} />}

      {isError && (
        <EmptyState
          icon={Landmark}
          title="Couldn't load settlements"
          description="Something went wrong fetching settlement data. Try refreshing the page."
        />
      )}

      {!isLoading && !isError && data && data.length === 0 && (
        <EmptyState
          icon={Landmark}
          title="No settlements yet"
          description="Settlements appear here once a verified event completes on-chain."
        />
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="overflow-hidden rounded-base border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-raised text-xs uppercase tracking-wider text-text-muted">
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Transaction</th>
              </tr>
            </thead>
            <tbody>
              {data.map((settlement) => (
                <tr key={settlement.id} className="border-b border-border/60 last:border-b-0">
                  <td className="px-4 py-4 font-medium">{settlement.actionType}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={settlement.status} />
                  </td>
                  <td className="px-4 py-4">
                    <a
                      href={settlement.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs text-live transition-colors hover:text-live/80"
                    >
                      {settlement.creditcoinTxHash.slice(0, 10)}...{settlement.creditcoinTxHash.slice(-6)}
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
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
