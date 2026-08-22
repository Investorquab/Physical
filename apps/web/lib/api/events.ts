import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { PhysicalEvent } from "@physical/shared-types";
import { apiFetch } from "./client";

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: () => apiFetch("/events", z.array(PhysicalEvent)),
  });
}
