import { NextResponse } from "next/server";
import { z } from "zod";
import { Settlement } from "@physical/shared-types";

const mockSettlements: Settlement[] = [
  {
    id: "stl_1",
    jobRunId: "run_1",
    creditcoinTxHash: "0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
    actionType: "air_quality_alert_payout",
    status: "CONFIRMED",
    explorerUrl: "https://explorer.creditcoin.org/tx/0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
  },
  {
    id: "stl_2",
    jobRunId: "run_2",
    creditcoinTxHash: "0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1",
    actionType: "uptime_credit",
    status: "PENDING",
    explorerUrl: "https://explorer.creditcoin.org/tx/0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1",
  },
  {
    id: "stl_3",
    jobRunId: "run_3",
    creditcoinTxHash: "0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
    actionType: "air_quality_alert_payout",
    status: "FAILED",
    explorerUrl: "https://explorer.creditcoin.org/tx/0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
  },
];

export async function GET() {
  const data = z.array(Settlement).parse(mockSettlements);
  return NextResponse.json(data);
}
