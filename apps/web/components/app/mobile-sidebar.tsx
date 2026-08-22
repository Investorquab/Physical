"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { navItems, isNavItemActive } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-overlay bg-black/60 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content
          className="safe-left fixed inset-y-0 left-0 z-modal flex w-64 flex-col border-r border-border bg-bg outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left"
          aria-label="Navigation"
        >
          <div className="flex h-16 items-center justify-between border-b border-border/60 px-6">
            <Dialog.Title asChild>
              <Link
                href="/"
                className="font-display text-lg font-semibold tracking-tight"
                onClick={() => onOpenChange(false)}
              >
                PHYSICAL
              </Link>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close navigation"
                className="flex size-8 items-center justify-center rounded-base text-text-muted transition-colors hover:bg-bg-raised hover:text-text"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </Dialog.Close>
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
                  onClick={() => onOpenChange(false)}
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
