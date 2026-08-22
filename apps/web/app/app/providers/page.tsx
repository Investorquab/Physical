"use client";

import { Server, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { StatusBadge } from "@/components/app/status-badge";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useProviders } from "@/lib/api/providers";

export default function ProvidersPage() {
  const { data, isLoading, isError } = useProviders();

  return (
    <>
      <PageHeader
        title="Providers"
        description="Infrastructure operators registered on the protocol."
      />

      {isLoading && <TableSkeleton rows={3} />}

      {isError && (
        <EmptyState
          icon={Server}
          title="Couldn't load providers"
          description="Something went wrong fetching provider data. Try refreshing the page."
        />
      )}

      {!isLoading && !isError && data && data.length === 0 && (
        <EmptyState
          icon={Server}
          title="No providers registered"
          description="Providers will show up here once they're onboarded."
        />
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="overflow-hidden rounded-base border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-raised text-xs uppercase tracking-wider text-text-muted">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Source type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Endpoint</th>
              </tr>
            </thead>
            <tbody>
              {data.map((provider) => (
                <tr key={provider.id} className="border-b border-border/60 last:border-b-0">
                  <td className="px-4 py-4 font-medium">{provider.name}</td>
                  <td className="px-4 py-4 text-text-muted">{provider.sourceType}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={provider.status} />
                  </td>
                  <td className="px-4 py-4">
                    <a
                      href={provider.baseUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs text-text-muted transition-colors hover:text-text"
                    >
                      {new URL(provider.baseUrl).hostname}
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
