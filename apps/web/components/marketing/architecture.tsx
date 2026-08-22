const layers = [
  {
    label: "Physical layer",
    detail: "Nodes, sensors, and providers generating real-world events",
    color: "text-live",
    border: "border-live/40",
  },
  {
    label: "Ingestion workers",
    detail: "Capture and sign raw events at the source",
    color: "text-accent",
    border: "border-accent/40",
  },
  {
    label: "Attestcoin Protocol",
    detail: "Verifies claims on-chain against protocol rules",
    color: "text-verified",
    border: "border-verified/40",
  },
  {
    label: "Settlement",
    detail: "Finalized, queryable proof. Rewards and records follow",
    color: "text-pending",
    border: "border-pending/40",
  },
];

export function Architecture() {
  return (
    <section id="architecture" className="border-b border-border/60">
      <div className="mx-auto max-w-content px-6 py-24 md:py-32">
        <div className="grid gap-12 md:grid-cols-2 md:gap-24">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-text-muted">
              Architecture
            </p>
            <h2 className="mt-4 text-balance font-display text-3xl font-semibold leading-tight md:text-4xl">
              Four layers, each independently verifiable.
            </h2>
            <p className="mt-6 max-w-md text-pretty text-text-muted">
              Every layer only trusts the layer below it because that
              layer's output is itself checkable, so there's no single
              point where you have to just take someone's word for it.
            </p>
          </div>

          <div className="flex flex-col md:pl-10">
            {layers.map((layer, i) => (
              <div key={layer.label} className="relative pl-10">
                {i < layers.length - 1 && (
                  <div
                    className="absolute left-[7px] top-7 h-[calc(100%-1.75rem)] w-px bg-border"
                    aria-hidden="true"
                  />
                )}
                <div
                  className={`absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 bg-bg ${layer.border}`}
                  aria-hidden="true"
                />
                <div className={`pb-12 ${i === layers.length - 1 ? "pb-0" : ""}`}>
                  <h3 className={`font-display text-base font-semibold ${layer.color}`}>
                    {layer.label}
                  </h3>
                  <p className="mt-1.5 text-sm text-text-muted">{layer.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
