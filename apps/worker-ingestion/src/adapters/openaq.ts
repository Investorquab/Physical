import type { DataProviderAdapter, NormalizedReading } from "./types";

const OPENAQ_BASE_URL = "https://api.openaq.org";

interface OpenAQLocation {
  id: number;
  name: string;
  coordinates: { latitude: number; longitude: number };
  sensors: Array<{
    id: number;
    parameter: { name: string; units: string };
  }>;
}

interface OpenAQLatestResult {
  datetime: { utc: string; local: string };
  value: number;
  coordinates: { latitude: number | null; longitude: number | null };
  sensorsId: number;
  locationsId: number;
}

interface StationMeta {
  name: string;
  lat: number;
  lng: number;
  sensorMap: Map<number, { parameter: string; unit: string }>;
}

/** Supports polling multiple real OpenAQ stations at once — each one is
 * still a genuinely separate, real station; this is not synthetic
 * multiplication of a single source. */
export class OpenAQAdapter implements DataProviderAdapter {
  readonly name = "OpenAQ";
  readonly sourceType = "air_quality";
  readonly baseUrl = OPENAQ_BASE_URL;

  private readonly apiKey: string;
  private readonly locationIds: string[];
  private readonly targetParameter: string;

  private stationMetaById: Map<string, StationMeta> | null = null;
  private lastSeenUtcById: Map<string, string> = new Map();

  constructor(opts: { apiKey: string; locationIds: string[]; targetParameter?: string }) {
    if (!opts.apiKey) throw new Error("OPENAQ_API_KEY is required");
    if (!opts.locationIds || opts.locationIds.length === 0) {
      throw new Error("OPENAQ_LOCATION_IDS is required (comma-separated)");
    }
    this.apiKey = opts.apiKey;
    this.locationIds = opts.locationIds;
    this.targetParameter = opts.targetParameter ?? "pm25";
  }

  private async request<T>(path: string): Promise<T> {
    const res = await fetch(`${OPENAQ_BASE_URL}${path}`, {
      headers: { "X-API-Key": this.apiKey },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      throw new Error(`OpenAQ request failed: ${res.status} ${res.statusText} (${path})`);
    }
    return res.json() as Promise<T>;
  }

  private async ensureMetadata(): Promise<void> {
    if (this.stationMetaById) return;

    const map = new Map<string, StationMeta>();
    for (const locationId of this.locationIds) {
      const body = await this.request<{ results: OpenAQLocation[] }>(
        `/v3/locations/${locationId}`
      );
      const location = body.results[0];
      if (!location) {
        console.warn(`[openaq] location ${locationId} not found, skipping`);
        continue;
      }
      map.set(locationId, {
        name: location.name,
        lat: location.coordinates.latitude,
        lng: location.coordinates.longitude,
        sensorMap: new Map(
          location.sensors.map((s) => [s.id, { parameter: s.parameter.name, unit: s.parameter.units }])
        ),
      });
    }
    this.stationMetaById = map;
  }

  async fetchLatest(): Promise<NormalizedReading[]> {
    await this.ensureMetadata();
    if (!this.stationMetaById) throw new Error("OpenAQ metadata not loaded");

    const allReadings: NormalizedReading[] = [];

    for (const locationId of this.locationIds) {
      const meta = this.stationMetaById.get(locationId);
      if (!meta) continue;

      let body: { results: OpenAQLatestResult[] };
      try {
        body = await this.request<{ results: OpenAQLatestResult[] }>(
          `/v3/locations/${locationId}/latest?limit=100`
        );
      } catch (err) {
        console.error(`[openaq] failed to fetch latest for station ${locationId}:`, err);
        continue;
      }

      const lastSeenUtc = this.lastSeenUtcById.get(locationId) ?? null;
      const readings: NormalizedReading[] = [];

      for (const r of body.results) {
        const sensorInfo = meta.sensorMap.get(r.sensorsId);
        if (!sensorInfo) continue;
        if (sensorInfo.parameter !== this.targetParameter) continue;
        if (lastSeenUtc && r.datetime.utc <= lastSeenUtc) continue;

        readings.push({
          externalStationId: locationId,
          stationName: meta.name,
          lat: r.coordinates.latitude ?? meta.lat,
          lng: r.coordinates.longitude ?? meta.lng,
          parameter: sensorInfo.parameter,
          unit: sensorInfo.unit,
          value: r.value,
          observedAt: new Date(r.datetime.utc),
          externalRef: `${r.sensorsId}:${r.datetime.utc}`,
          rawPayload: r,
        });
      }

      if (readings.length > 0) {
        const newest = readings.reduce((a, b) => (a.observedAt > b.observedAt ? a : b));
        this.lastSeenUtcById.set(locationId, newest.observedAt.toISOString());
      }

      allReadings.push(...readings);
    }

    return allReadings;
  }
}
