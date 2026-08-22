import { Settings } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Account, API access, and notification preferences."
      />
      <EmptyState
        icon={Settings}
        title="Settings aren't wired up yet"
        description="This section will hold your account details, API keys, and notification preferences once the settings API is available."
      />
    </>
  );
}
