"use client";

import { usePathname } from "next/navigation";
import { Menu, User } from "lucide-react";
import { navItems, isNavItemActive } from "@/lib/nav-items";
import { MockModeBadge } from "@/components/app/mock-mode-badge";

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname();
  const currentItem = navItems.find((item) => isNavItemActive(item.href, pathname));

  return (
    <header className="safe-top sticky top-0 z-nav flex h-16 items-center justify-between border-b border-border/60 bg-bg/80 px-4 backdrop-blur-sm md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onMenuClick}
          className="flex size-9 items-center justify-center rounded-base text-text-muted transition-colors hover:bg-bg-raised hover:text-text md:hidden"
        >
          <Menu className="size-4" aria-hidden="true" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
          <span className="text-text-muted">PHYSICAL</span>
          {currentItem && (
            <>
              <span className="text-text-muted/50" aria-hidden="true">
                /
              </span>
              <span className="font-medium text-text">{currentItem.label}</span>
            </>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <MockModeBadge />
        <button
          type="button"
          aria-label="Account"
          className="flex size-9 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-text-muted hover:text-text"
        >
          <User className="size-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
