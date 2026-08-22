"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const links = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#use-cases", label: "Use cases" },
  { href: "#architecture", label: "Architecture" },
];

export function Nav() {
  return (
    <header className="safe-top sticky top-0 z-nav border-b border-border/60 bg-bg/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          PHYSICAL
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-text-muted transition-colors hover:text-text"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          href="/app"
          className={cn(
            "rounded-base border border-accent/40 bg-accent/10 px-4 py-2",
            "text-sm font-medium text-accent transition-colors hover:bg-accent/20"
          )}
        >
          Launch app
        </Link>
      </div>
    </header>
  );
}
