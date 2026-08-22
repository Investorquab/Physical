import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Job } from "@physical/shared-types";
import { apiFetch } from "./client";

export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: () => apiFetch("/jobs", z.array(Job)),
  });
}
