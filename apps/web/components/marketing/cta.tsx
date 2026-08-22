export function Cta() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-content px-6 py-24 text-center md:py-32">
        <h2 className="mx-auto max-w-xl text-balance font-display text-3xl font-semibold leading-tight md:text-4xl">
          Stop paying out on claims you can&apos;t check.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-pretty text-text-muted">
          Connect your infrastructure and start attesting real-world
          events on-chain.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <a
            href="/app"
            className="rounded-base bg-accent px-6 py-3 text-sm font-medium text-bg transition-opacity hover:opacity-90"
          >
            Launch app
          </a>
          <a
            href="#how-it-works"
            className="rounded-base border border-border px-6 py-3 text-sm font-medium text-text transition-colors hover:border-text-muted"
          >
            Read the docs
          </a>
        </div>
      </div>
    </section>
  );
}
