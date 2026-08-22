import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-base border border-dashed border-border px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full border border-border bg-bg-raised">
        <Icon className="size-5 text-text-muted" aria-hidden="true" />
      </div>
      <h2 className="mt-6 font-display text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-sm text-pretty text-sm text-text-muted">
        {description}
      </p>
      {actionLabel && actionHref && (
        <a
          href={actionHref}
          className="mt-6 rounded-base border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:border-text-muted"
        >
          {actionLabel}
        </a>
      )}
    </div>
  );
}
