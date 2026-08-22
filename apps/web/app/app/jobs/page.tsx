"use client";

import { ListChecks } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useJobs } from "@/lib/api/jobs";

export default function JobsPage() {
  const { data, isLoading, isError } = useJobs();

  return (
    <>
      <PageHeader
        title="Jobs"
        description="Automation rules that trigger settlements when their conditions are met."
      />

      {isLoading && <TableSkeleton rows={3} />}

      {isError && (
        <EmptyState
          icon={ListChecks}
          title="Couldn't load jobs"
          description="Something went wrong fetching job data. Try refreshing the page."
        />
      )}

      {!isLoading && !isError && data && data.length === 0 && (
        <EmptyState
          icon={ListChecks}
          title="No jobs configured"
          description="Automation rules will appear here once they're created."
        />
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between rounded-base border border-border p-5"
            >
              <div>
                <h3 className="font-display text-base font-semibold">{job.name}</h3>
                <p className="mt-1 font-mono text-xs text-text-muted">
                  {String(job.actionJson.actionType ?? "custom action")}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                  job.isActive
                    ? "bg-verified/10 text-verified"
                    : "bg-bg-raised text-text-muted"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${job.isActive ? "bg-verified" : "bg-text-muted"}`}
                  aria-hidden="true"
                />
                {job.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
