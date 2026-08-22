import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { ActivityItem } from "@physical/shared-types";
import { apiFetch } from "./client";

export function useActivity() {
  return useQuery({
    queryKey: ["activity"],
    queryFn: () => apiFetch("/activity", z.array(ActivityItem)),
  });
}
