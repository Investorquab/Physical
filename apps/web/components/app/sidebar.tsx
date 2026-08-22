"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, isNavItemActive } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="safe-left fixed inset-y-0 left-0 z-nav hidden w-60 flex-col border-r border-border/60 bg-bg md:flex">
      <div className="flex h-16 items-center border-b border-border/60 px-6">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          PHYSICAL
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive = isNavItemActive(item.href, pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-base px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-text-muted hover:bg-bg-raised hover:text-text"
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
