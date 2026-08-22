export function Problem() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-content px-6 py-24 md:py-32">
        <div className="grid gap-12 md:grid-cols-2 md:gap-24">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-text-muted">
              The problem
            </p>
            <h2 className="mt-4 text-balance font-display text-3xl font-semibold leading-tight md:text-4xl">
              Physical infrastructure claims can&apos;t be checked.
            </h2>
          </div>

          <div className="flex flex-col gap-6 text-pretty text-text-muted">
            <p>
              A node operator says their hardware is online. A sensor
              network says it captured real readings. A provider says
              their coverage is real. Right now, the only way to know is
              to trust them, or run your own audit.
            </p>
            <p>
              That doesn&apos;t scale. DePIN networks pay out based on
              claims they can&apos;t independently verify, which means
              rewards leak to fabricated activity and real operators
              compete on a rigged floor.
            </p>
            <p className="text-text">
              PHYSICAL replaces the claim with a proof: an on-chain
              attestation that a physical event actually happened,
              verifiable by anyone, forgeable by no one.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
