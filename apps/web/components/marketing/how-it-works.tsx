const STAGES = [
  {
    n: "01",
    label: "Observed",
    color: "text-live",
    dot: "bg-live",
    body: "A physical event happens: a sensor reads a value, a node completes uptime, a provider serves a request. The source system captures it at the point of origin.",
  },
  {
    n: "02",
    label: "Attested",
    color: "text-accent",
    dot: "bg-accent",
    body: "The event is signed and submitted to the Attestcoin Protocol as a structured claim, tied to the identity of the reporting infrastructure.",
  },
  {
    n: "03",
    label: "Verified",
    color: "text-verified",
    dot: "bg-verified",
    body: "Independent verification checks the claim against protocol rules and cross-references from other sources before it's accepted as true.",
  },
  {
    n: "04",
    label: "Settled",
    color: "text-pending",
    dot: "bg-pending",
    body: "Once verified, the event is final on-chain. Rewards, records, and downstream systems can rely on it without re-checking the source.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-content px-6">
        <p className="font-mono text-xs uppercase tracking-wider text-text-muted">
          How it works
        </p>
        <h2 className="mt-3 max-w-lg text-balance font-display text-4xl font-semibold leading-tight">
          Four stages, one continuous proof.
        </h2>

        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-[13px] hidden h-px bg-gradient-to-r from-live via-accent to-pending opacity-40 md:block" />

          <div className="grid gap-10 md:grid-cols-4 md:gap-6">
            {STAGES.map((s) => (
              <div key={s.n} className="relative">
                <div className="relative z-10 flex items-center gap-3 md:block">
                  <span
                    className={`relative flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-border bg-bg ${s.color}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                  </span>
                  <div className="flex items-baseline gap-2 md:mt-4 md:block">
                    <span className="font-mono text-xs text-text-muted">{s.n}</span>
                    <h3 className={`font-display text-lg font-semibold ${s.color} md:mt-1`}>
                      {s.label}
                    </h3>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}