import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Settlement } from "@physical/shared-types";
import { apiFetch } from "./client";

export function useSettlements() {
  return useQuery({
    queryKey: ["settlements"],
    queryFn: () => apiFetch("/settlements", z.array(Settlement)),
  });
}
