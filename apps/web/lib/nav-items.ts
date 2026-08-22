import {
  LayoutDashboard,
  Share2,
  Server,
  Radio,
  ListChecks,
  ShieldCheck,
  Landmark,
  Activity,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/app", label: "Overview", icon: LayoutDashboard },
  { href: "/app/network", label: "Network", icon: Share2 },
  { href: "/app/providers", label: "Providers", icon: Server },
  { href: "/app/events", label: "Events", icon: Radio },
  { href: "/app/jobs", label: "Jobs", icon: ListChecks },
  { href: "/app/verification", label: "Verification", icon: ShieldCheck },
  { href: "/app/settlements", label: "Settlements", icon: Landmark },
  { href: "/app/activity", label: "Activity", icon: Activity },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function isNavItemActive(itemHref: string, pathname: string) {
  return itemHref === "/app" ? pathname === "/app" : pathname.startsWith(itemHref);
}
