import path from "node:path";
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

// .env lives at the monorepo root, not inside packages/db.
dotenv.config({ path: path.resolve(__dirname, "../../../.env"), quiet: true });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — check .env at the repo root");
}

// Prisma 7 requires an explicit driver adapter; PrismaClient can no longer
// take a bare connection string. Confirmed against Prisma's own docs.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });

// Re-export generated model/enum types so consumers only need to import
// from @physical/db, never reach into packages/db/generated directly.
export * from "../generated/prisma/client";