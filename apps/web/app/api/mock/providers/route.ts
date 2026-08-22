import { NextResponse } from "next/server";
import { z } from "zod";
import { Provider } from "@physical/shared-types";

const mockProviders: Provider[] = [
  {
    id: "prov_1",
    name: "Northgate Air Monitors",
    sourceType: "air_quality",
    baseUrl: "https://api.northgate-air.example.com",
    status: "CONNECTED",
    createdAt: "2026-07-02T09:00:00.000Z",
  },
  {
    id: "prov_2",
    name: "Coastal Sensor Network",
    sourceType: "air_quality",
    baseUrl: "https://api.coastal-sensors.example.com",
    status: "DEGRADED",
    createdAt: "2026-07-15T11:30:00.000Z",
  },
  {
    id: "prov_3",
    name: "Highland Monitoring Co.",
    sourceType: "air_quality",
    baseUrl: "https://api.highland-monitoring.example.com",
    status: "DISCONNECTED",
    createdAt: "2026-06-28T14:00:00.000Z",
  },
];

export async function GET() {
  const data = z.array(Provider).parse(mockProviders);
  return NextResponse.json(data);
}
