import { DotGlobe } from "./dot-globe";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="mx-auto grid max-w-content items-center gap-12 px-6 py-24 md:grid-cols-2 md:py-32">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-bg-raised px-3 py-1 font-mono text-xs uppercase tracking-wider text-text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-live" />
            Attestcoin Protocol
          </p>

          <h1 className="text-balance font-display text-5xl font-semibold leading-[1.05] md:text-7xl">
            Real world.
            <br />
            <span className="bg-gradient-to-r from-live to-accent bg-clip-text text-transparent">
              Verified on-chain.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-pretty text-lg text-text-muted">
            PHYSICAL turns readings from existing infrastructure, sensors,
            providers, networks already in the world, into cryptographically
            verified on-chain state. Nothing fabricated. Nothing simulated.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a href="/app" className="rounded-full bg-gradient-to-r from-accent to-live px-6 py-3 text-sm font-medium text-bg shadow-[0_0_30px_-8px_rgba(139,92,246,0.6)] transition-transform hover:scale-[1.02]">
              Launch app
            </a>
            <a href="#how-it-works" className="rounded-full border border-border px-6 py-3 text-sm font-medium text-text transition-colors hover:border-text-muted">
              How it works
            </a>
          </div>
        </div>

        <DotGlobe />
      </div>
    </section>
  );
}