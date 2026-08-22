import { NextResponse } from "next/server";
import { z } from "zod";
import { Station } from "@physical/shared-types";

const mockStations: Station[] = [
  { id: "stn_1", providerId: "prov_1", externalStationId: "NG-014", name: "Northgate - Downtown", lat: 6.5244, lng: 3.3792 },
  { id: "stn_2", providerId: "prov_1", externalStationId: "NG-027", name: "Northgate - Harbor Rd", lat: 6.4531, lng: 3.3958 },
  { id: "stn_3", providerId: "prov_2", externalStationId: "CS-002", name: "Coastal - Pier 4", lat: 6.4281, lng: 3.4219 },
  { id: "stn_4", providerId: "prov_3", externalStationId: "HL-101", name: "Highland - Ridge Station", lat: 6.6018, lng: 3.3515 },
];

export async function GET() {
  const data = z.array(Station).parse(mockStations);
  return NextResponse.json(data);
}
