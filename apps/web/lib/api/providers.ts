import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Provider } from "@physical/shared-types";
import { apiFetch } from "./client";

export function useProviders() {
  return useQuery({
    queryKey: ["providers"],
    queryFn: () => apiFetch("/providers", z.array(Provider)),
  });
}
