import type { DataProviderAdapter, NormalizedReading } from "./types";

const OPENAQ_BASE_URL = "https://api.openaq.org";

/** Shape of GET /v3/locations/{id} — trimmed to fields we actually use.
 * Verified against docs.openaq.org quick-start example response. */
interface OpenAQLocation {
  id: number;
  name: string;
  coordinates: { latitude: number; longitude: number };
  sensors: Array<{
    id: number;
    parameter: { name: string; units: string };
  }>;
}

/** Shape of GET /v3/locations/{id}/latest results[] —
 * verified against docs.openaq.org API reference for this exact endpoint. */
interface OpenAQLatestResult {
  datetime: { utc: string; local: string };
  value: number;
  coordinates: { latitude: number | null; longitude: number | null };
  sensorsId: number;
  locationsId: number;
}

export class OpenAQAdapter implements DataProviderAdapter {
  readonly name = "OpenAQ";
  readonly sourceType = "air_quality";
  readonly baseUrl = OPENAQ_BASE_URL;

  private readonly apiKey: string;
  private readonly locationId: string;
  /** Which parameter we care about for the MVP coordination rule. */
  private readonly targetParameter: string;

  /** sensorsId -> parameter metadata, populated once on first fetch. */
  private sensorMap: Map<number, { parameter: string; unit: string }> | null = null;
  private stationMeta: { name: string; lat: number; lng: number } | null = null;

  /** Tracks the newest datetime.utc we've already ingested, to avoid duplicates. */
  private lastSeenUtc: string | null = null;

  constructor(opts: { apiKey: string; locationId: string; targetParameter?: string }) {
    if (!opts.apiKey) throw new Error("OPENAQ_API_KEY is required");
    if (!opts.locationId) throw new Error("OPENAQ_LOCATION_ID is required");
    this.apiKey = opts.apiKey;
    this.locationId = opts.locationId;
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

  /** Fetches and caches station + sensor metadata. Only called once per process lifetime
   * for MVP — restart the worker if station config changes. */
  private async ensureMetadata(): Promise<void> {
    if (this.sensorMap && this.stationMeta) return;

    const body = await this.request<{ results: OpenAQLocation[] }>(
      `/v3/locations/${this.locationId}`
    );
    const location = body.results[0];
    if (!location) {
      throw new Error(`OpenAQ location ${this.locationId} not found`);
    }

    this.stationMeta = {
      name: location.name,
      lat: location.coordinates.latitude,
      lng: location.coordinates.longitude,
    };

    this.sensorMap = new Map(
      location.sensors.map((s) => [s.id, { parameter: s.parameter.name, unit: s.parameter.units }])
    );
  }

  async fetchLatest(): Promise<NormalizedReading[]> {
    await this.ensureMetadata();
    if (!this.sensorMap || !this.stationMeta) {
      throw new Error("OpenAQ metadata not loaded");
    }

    const body = await this.request<{ results: OpenAQLatestResult[] }>(
      `/v3/locations/${this.locationId}/latest?limit=100`
    );

    const readings: NormalizedReading[] = [];

    for (const r of body.results) {
      const sensorInfo = this.sensorMap.get(r.sensorsId);
      if (!sensorInfo) continue; // sensor not on this station, skip
      if (sensorInfo.parameter !== this.targetParameter) continue; // not the parameter we're tracking

      // Dedup: skip readings we've already seen (same or older than last poll).
      if (this.lastSeenUtc && r.datetime.utc <= this.lastSeenUtc) continue;

      readings.push({
        externalStationId: this.locationId,
        stationName: this.stationMeta.name,
        lat: r.coordinates.latitude ?? this.stationMeta.lat,
        lng: r.coordinates.longitude ?? this.stationMeta.lng,
        parameter: sensorInfo.parameter,
        unit: sensorInfo.unit,
        value: r.value,
        observedAt: new Date(r.datetime.utc),
        externalRef: `${r.sensorsId}:${r.datetime.utc}`,
        rawPayload: r,
      });
    }

    if (readings.length > 0) {
      // Track the newest datetime we've now ingested.
      const newest = readings.reduce((a, b) => (a.observedAt > b.observedAt ? a : b));
      this.lastSeenUtc = newest.observedAt.toISOString();
    }

    return readings;
  }
}
