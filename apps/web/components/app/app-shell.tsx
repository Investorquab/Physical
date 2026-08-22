"use client";

import { useState } from "react";
import { Sidebar } from "@/components/app/sidebar";
import { MobileSidebar } from "@/components/app/mobile-sidebar";
import { TopBar } from "@/components/app/topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-dvh">
      <Sidebar />
      <MobileSidebar open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

      <div className="md:ml-60">
        <TopBar onMenuClick={() => setMobileNavOpen(true)} />
        <main id="main-content" className="px-4 py-8 md:px-8 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
