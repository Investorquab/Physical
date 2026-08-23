"use client";

import { Share2 } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useStations } from "@/lib/api/stations";
import { useProviders } from "@/lib/api/providers";
import type { Station, Provider } from "@physical/shared-types";

const providerTone: Record<string, string> = {
  CONNECTED: "var(--color-verified)",
  DEGRADED: "var(--color-pending)",
  DISCONNECTED: "var(--color-error)",
};

const CHART_WIDTH = 640;
const CHART_HEIGHT = 300;
const PADDING = 48;

function shortLabel(name: string) {
  return name.includes(" - ") ? name.split(" - ")[1] : name;
}

function projectStations(stations: Station[]) {
  const lats = stations.map((s) => s.lat);
  const lngs = stations.map((s) => s.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  return {
    points: stations.map((station) => ({
      station,
      x: PADDING + ((station.lng - minLng) / lngRange) * (CHART_WIDTH - PADDING * 2),
      y: PADDING + (1 - (station.lat - minLat) / latRange) * (CHART_HEIGHT - PADDING * 2),
    })),
    bounds: { minLat, maxLat, minLng, maxLng },
  };
}

function CompassRose({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g opacity="0.5">
      <circle cx={x} cy={y} r={r} fill="none" stroke="var(--color-border)" strokeWidth="1.25" />
      <line x1={x} y1={y - r} x2={x} y2={y - r + 6} stroke="var(--color-text-muted)" strokeWidth="1.25" />
      <line x1={x} y1={y + r} x2={x} y2={y + r - 6} stroke="var(--color-text-muted)" strokeWidth="1.25" />
      <line x1={x - r} y1={y} x2={x - r + 6} y2={y} stroke="var(--color-text-muted)" strokeWidth="1.25" />
      <line x1={x + r} y1={y} x2={x + r - 6} y2={y} stroke="var(--color-text-muted)" strokeWidth="1.25" />
      <text x={x} y={y - r - 6} fontSize="8" fill="var(--color-text-muted)" fontFamily="var(--font-mono)" textAnchor="middle">
        N
      </text>
    </g>
  );
}

function SurveyChart({ stations, providerStatusById }: { stations: Station[]; providerStatusById: Map<string, string> }) {
  const { points, bounds } = projectStations(stations);

  const gridLines = [];
  for (let x = 0; x <= CHART_WIDTH; x += 32) {
    gridLines.push(
      <line key={`v-${x}`} x1={x} y1={0} x2={x} y2={CHART_HEIGHT} stroke="var(--color-border)" strokeWidth="0.75" />
    );
  }
  for (let y = 0; y <= CHART_HEIGHT; y += 32) {
    gridLines.push(
      <line key={`h-${y}`} x1={0} y1={y} x2={CHART_WIDTH} y2={y} stroke="var(--color-border)" strokeWidth="0.75" />
    );
  }

  return (
    <div className="max-w-2xl overflow-hidden rounded-base border border-border bg-bg-raised p-6">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="block h-auto w-full"
        role="img"
        aria-label="Map of connected station locations"
      >
        {gridLines}

        <rect
          x="1"
          y="1"
          width={CHART_WIDTH - 2}
          height={CHART_HEIGHT - 2}
          fill="none"
          stroke="var(--color-text-muted)"
          strokeWidth="1.25"
          opacity="0.4"
        />

        <CompassRose x={CHART_WIDTH - PADDING - 8} y={PADDING + 8} r={20} />

        <text x={PADDING} y={16} fontSize="8" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">
          {bounds.maxLat.toFixed(2)}°
        </text>
        <text x={PADDING} y={CHART_HEIGHT - 10} fontSize="8" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">
          {bounds.minLat.toFixed(2)}°
        </text>
        <text x={CHART_WIDTH - PADDING} y={CHART_HEIGHT - 10} fontSize="8" fill="var(--color-text-muted)" fontFamily="var(--font-mono)" textAnchor="end">
          {bounds.maxLng.toFixed(2)}°
        </text>

        {points.map(({ station, x, y }) => {
          const status = providerStatusById.get(station.providerId);
          const color = providerTone[status ?? ""] ?? "var(--color-live)";
          const isConnected = status === "CONNECTED";

          return (
            <g key={station.id}>
              {isConnected && (
                <circle className="marker-pulse-ring" cx={x} cy={y} r="4" fill="none" stroke={color} strokeWidth="1.25" />
              )}
              <circle cx={x} cy={y} r="6" fill="none" stroke={color} strokeWidth="1.5" />
              <circle cx={x} cy={y} r="1.8" fill={color} />
              <line x1={x} y1={y - 10} x2={x} y2={y - 6.5} stroke={color} strokeWidth="1.25" />
              <line x1={x} y1={y + 6.5} x2={x} y2={y + 10} stroke={color} strokeWidth="1.25" />
              <line x1={x - 10} y1={y} x2={x - 6.5} y2={y} stroke={color} strokeWidth="1.25" />
              <line x1={x + 6.5} y1={y} x2={x + 10} y2={y} stroke={color} strokeWidth="1.25" />
              <text
                x={x}
                y={y + 22}
                fontSize="8.5"
                fill="var(--color-text-muted)"
                fontFamily="var(--font-mono)"
                textAnchor="middle"
              >
                {shortLabel(station.name)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function NetworkPage() {
  const stations = useStations();
  const providers = useProviders();

  const isLoading = stations.isLoading || providers.isLoading;
  const isError = stations.isError || providers.isError;

  const providerNameById = new Map(
    (providers.data ?? []).map((provider: Provider) => [provider.id, provider.name])
  );
  const providerStatusById = new Map(
    (providers.data ?? []).map((provider: Provider) => [provider.id, provider.status])
  );

  return (
    <>
      <PageHeader
        title="Network"
        description="Physical station locations reporting into the protocol, plotted from real coordinates."
      />

      {isLoading && <TableSkeleton rows={4} />}

      {isError && (
        <EmptyState
          icon={Share2}
          title="Couldn't load the network"
          description="Something went wrong fetching station data. Try refreshing the page."
        />
      )}

      {!isLoading && !isError && stations.data && stations.data.length === 0 && (
        <EmptyState
          icon={Share2}
          title="No connected infrastructure yet"
          description="Stations will appear here once providers register them with the protocol."
        />
      )}

      {!isLoading && !isError && stations.data && stations.data.length > 0 && (
        <div className="flex flex-col gap-6">
          <SurveyChart stations={stations.data} providerStatusById={providerStatusById} />

          <div className="overflow-hidden rounded-base border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-bg-raised text-xs uppercase tracking-wider text-text-muted">
                  <th className="px-4 py-3 font-medium">Station</th>
                  <th className="px-4 py-3 font-medium">Provider</th>
                  <th className="px-4 py-3 font-medium">Coordinates</th>
                </tr>
              </thead>
              <tbody>
                {stations.data.map((station) => (
                  <tr key={station.id} className="border-b border-border/60 last:border-b-0">
                    <td className="px-4 py-4 font-medium">{station.name}</td>
                    <td className="px-4 py-4 text-text-muted">
                      {providerNameById.get(station.providerId) ?? station.providerId}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-text-muted">
                      {station.lat.toFixed(4)}, {station.lng.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}