import { NextResponse } from "next/server";
import { z } from "zod";
import { Job } from "@physical/shared-types";

const mockJobs: Job[] = [
  {
    id: "job_1",
    name: "PM2.5 threshold payout",
    conditionJson: { parameter: "pm25", operator: "gt", value: 35 },
    actionJson: { type: "settlement", actionType: "air_quality_alert_payout" },
    isActive: true,
  },
  {
    id: "job_2",
    name: "Daily station uptime credit",
    conditionJson: { parameter: "uptime", operator: "gte", value: 0.98 },
    actionJson: { type: "settlement", actionType: "uptime_credit" },
    isActive: true,
  },
  {
    id: "job_3",
    name: "Legacy coverage bonus (disabled)",
    conditionJson: { parameter: "coverage", operator: "gte", value: 0.9 },
    actionJson: { type: "settlement", actionType: "coverage_bonus" },
    isActive: false,
  },
];

export async function GET() {
  const data = z.array(Job).parse(mockJobs);
  return NextResponse.json(data);
}
