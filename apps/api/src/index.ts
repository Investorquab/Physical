import path from "node:path";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { eventsRouter } from "./routes/events";
import { providersRouter, stationsRouter, jobsRouter, settlementsRouter } from "./routes/simple";
import { activityRouter } from "./routes/activity";

dotenv.config({ path: path.resolve(__dirname, "../../../.env"), quiet: true });

const app = express();
const PORT = process.env.API_PORT ?? 4001;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:3000";

app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: "100kb" }));

// Basic abuse protection — generous enough for normal dashboard polling.
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/healthz", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/events", eventsRouter);
app.use("/api/v1/providers", providersRouter);
app.use("/api/v1/stations", stationsRouter);
app.use("/api/v1/jobs", jobsRouter);
app.use("/api/v1/settlements", settlementsRouter);
app.use("/api/v1/activity", activityRouter);

// 404 for anything unmatched, in our own error shape.
app.use((req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
});

// Central error handler — never leak stack traces to the client.
app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[api] unhandled error:", err);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
});

app.listen(PORT, () => {
  console.log(`[api] listening on :${PORT} (CORS origin: ${CORS_ORIGIN})`);
});
