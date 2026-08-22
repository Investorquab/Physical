import { Router } from "express";
import { prisma } from "@physical/db";
import { mapProvider, mapStation, mapJob, mapSettlement } from "../mappers";

export const providersRouter = Router();
providersRouter.get("/", async (req, res, next) => {
  try {
    const providers = await prisma.provider.findMany({ orderBy: { createdAt: "asc" } });
    res.json(providers.map(mapProvider));
  } catch (err) {
    next(err);
  }
});

export const stationsRouter = Router();
stationsRouter.get("/", async (req, res, next) => {
  try {
    const { provider } = req.query;
    const stations = await prisma.station.findMany({
      where: provider ? { providerId: provider as string } : undefined,
    });
    res.json(stations.map(mapStation));
  } catch (err) {
    next(err);
  }
});

export const jobsRouter = Router();
jobsRouter.get("/", async (req, res, next) => {
  try {
    const jobs = await prisma.job.findMany();
    res.json(jobs.map(mapJob));
  } catch (err) {
    next(err);
  }
});

export const settlementsRouter = Router();
settlementsRouter.get("/", async (req, res, next) => {
  try {
    const settlements = await prisma.settlement.findMany();
    res.json(settlements.map(mapSettlement));
  } catch (err) {
    next(err);
  }
});
