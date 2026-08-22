"use client";

import { LayoutDashboard, Server, Radio, Landmark } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useProviders } from "@/lib/api/providers";
import { useEvents } from "@/lib/api/events";
import { useSettlements } from "@/lib/api/settlements";

function StatCard({
  icon: Icon,
  label,
  value,
  isLoading,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-base border border-border p-6">
      <div className="flex items-center gap-2 text-text-muted">
        <Icon className="size-4" aria-hidden="true" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      {isLoading ? (
        <Skeleton className="mt-3 h-8 w-16" />
      ) : (
        <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
      )}
    </div>
  );
}

export default function OverviewPage() {
  const providers = useProviders();
  const events = useEvents();
  const settlements = useSettlements();

  const isLoading = providers.isLoading || events.isLoading || settlements.isLoading;
  const hasAnyData =
    (providers.data?.length ?? 0) > 0 ||
    (events.data?.length ?? 0) > 0 ||
    (settlements.data?.length ?? 0) > 0;

  const connectedProviders =
    providers.data?.filter((p) => p.status === "CONNECTED").length ?? 0;
  const verifiedEvents =
    events.data?.filter((e) => e.status === "VERIFIED" || e.status === "SETTLED").length ?? 0;
  const confirmedSettlements =
    settlements.data?.filter((s) => s.status === "CONFIRMED").length ?? 0;

  return (
    <>
      <PageHeader
        title="Overview"
        description="A snapshot of network activity across connected infrastructure."
      />

      {!isLoading && !hasAnyData ? (
        <EmptyState
          icon={LayoutDashboard}
          title="Waiting for connected infrastructure"
          description="Once nodes, sensors, or providers start attesting events, this page will summarize network health, recent verifications, and settlement activity."
          actionLabel="Connect infrastructure"
          actionHref="/app/network"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={Server}
            label="Connected providers"
            value={String(connectedProviders)}
            isLoading={isLoading}
          />
          <StatCard
            icon={Radio}
            label="Verified events"
            value={String(verifiedEvents)}
            isLoading={isLoading}
          />
          <StatCard
            icon={Landmark}
            label="Confirmed settlements"
            value={String(confirmedSettlements)}
            isLoading={isLoading}
          />
        </div>
      )}
    </>
  );
}
