import { Router } from "express";
import { prisma } from "@physical/db";
import { mapEvent } from "../mappers";

export const eventsRouter = Router();

eventsRouter.get("/", async (req, res, next) => {
  try {
    const { provider, status } = req.query;

    const events = await prisma.event.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(provider
          ? { rawEvent: { station: { providerId: provider as string } } }
          : {}),
      },
      orderBy: { observedAt: "desc" },
      include: {
        rawEvent: { include: { station: true } },
        sourceSubmission: {
          include: { attestation: { include: { verification: true } } },
        },
      },
    });

    res.json(events.map(mapEvent));
  } catch (err) {
    next(err);
  }
});

eventsRouter.get("/:id", async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        rawEvent: { include: { station: true } },
        sourceSubmission: {
          include: { attestation: { include: { verification: true } } },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Event not found" } });
    }

    res.json(mapEvent(event));
  } catch (err) {
    next(err);
  }
});
