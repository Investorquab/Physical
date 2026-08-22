/// A single normalized reading, ready to be stored and submitted on-chain.
/// This is the shape EVERY provider adapter must produce — OpenAQ today,
/// potentially Open-Meteo or another provider later, without touching
/// anything downstream of fetchLatest().
export interface NormalizedReading {
  /** The provider's own identifier for the station/sensor, e.g. OpenAQ's numeric location id */
  externalStationId: string;
  stationName: string;
  lat: number;
  lng: number;
  /** e.g. "pm25" */
  parameter: string;
  /** e.g. "µg/m³" */
  unit: string;
  value: number;
  observedAt: Date;
  /** Unique-per-reading string used for dedup (e.g. `${sensorId}:${datetimeUtc}`) */
  externalRef: string;
  /** The raw provider response for this reading — stored verbatim for provenance */
  rawPayload: unknown;
}

export interface DataProviderAdapter {
  /** Provider name as stored in the `providers` table, e.g. "OpenAQ" */
  readonly name: string;
  readonly sourceType: string;
  readonly baseUrl: string;

  /** Fetch the latest reading(s) since the last poll. */
  fetchLatest(): Promise<NormalizedReading[]>;
}
