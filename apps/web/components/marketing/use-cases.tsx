import { Server, Radio, Wifi, ShieldCheck } from "lucide-react";

const USE_CASES = [
  {
    icon: Server,
    label: "Node networks",
    color: "text-live",
    ring: "hover:shadow-[0_0_0_1px_theme(colors.live/0.4),0_0_40px_-12px_theme(colors.live/0.5)]",
    body: "Prove uptime and bandwidth claims from decentralized compute or storage nodes without trusting the operator's own dashboard.",
  },
  {
    icon: Radio,
    label: "Sensor & IoT data",
    color: "text-accent",
    ring: "hover:shadow-[0_0_0_1px_theme(colors.accent/0.4),0_0_40px_-12px_theme(colors.accent/0.5)]",
    body: "Attest environmental, industrial, or logistics sensor readings at the point of capture, so downstream consumers don't need to trust the device owner.",
  },
  {
    icon: Wifi,
    label: "Coverage & connectivity",
    color: "text-verified",
    ring: "hover:shadow-[0_0_0_1px_theme(colors.verified/0.4),0_0_40px_-12px_theme(colors.verified/0.5)]",
    body: "Verify that a wireless, energy, or connectivity provider actually served the area they're claiming, and get paid against proof instead of self-reporting.",
  },
  {
    icon: ShieldCheck,
    label: "Parametric settlement",
    color: "text-pending",
    ring: "hover:shadow-[0_0_0_1px_theme(colors.pending/0.4),0_0_40px_-12px_theme(colors.pending/0.5)]",
    body: "Trigger insurance or service-level payouts automatically once a physical condition is verified on-chain, no manual claims review.",
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-content px-6">
        <p className="font-mono text-xs uppercase tracking-wider text-text-muted">
          Use cases
        </p>
        <h2 className="mt-3 max-w-lg text-balance font-display text-4xl font-semibold leading-tight">
          Built for anyone paying out on physical claims.
        </h2>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {USE_CASES.map((u) => {
            const Icon = u.icon;
            return (
              <div
                key={u.label}
                className={`rounded-2xl border border-border bg-bg-raised p-6 transition-shadow duration-300 ${u.ring}`}
              >
                <span
                  className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg ${u.color}`}
                >
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <h3 className={`font-display text-base font-semibold ${u.color}`}>
                  {u.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{u.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}