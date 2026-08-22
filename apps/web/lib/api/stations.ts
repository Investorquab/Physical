import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Station } from "@physical/shared-types";
import { apiFetch } from "./client";

export function useStations() {
  return useQuery({
    queryKey: ["stations"],
    queryFn: () => apiFetch("/stations", z.array(Station)),
  });
}
