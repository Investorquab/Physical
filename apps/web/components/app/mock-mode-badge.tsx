import { USE_MOCK } from "@/lib/api/config";

export function MockModeBadge() {
  if (!USE_MOCK) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-pending/30 bg-pending/10 px-2.5 py-1 text-xs font-medium text-pending">
      <span className="size-1.5 rounded-full bg-pending" aria-hidden="true" />
      Mock data
    </span>
  );
}
