const columns = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "/app" },
      { label: "Network", href: "/app/network" },
      { label: "Verification", href: "/app/verification" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Architecture", href: "#architecture" },
      { label: "Use cases", href: "#use-cases" },
    ],
  },
  {
    title: "Protocol",
    links: [
      { label: "GitHub", href: "https://github.com" },
      { label: "Documentation", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer>
      <div className="mx-auto max-w-content px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <div>
            <span className="font-display text-lg font-semibold tracking-tight">
              PHYSICAL
            </span>
            <p className="mt-3 max-w-xs text-sm text-text-muted">
              Verifiable attestation for physical infrastructure, built
              on the Attestcoin Protocol.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="font-mono text-xs uppercase tracking-wider text-text-muted">
                  {column.title}
                </h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-text-muted transition-colors hover:text-text"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 border-t border-border/60 pt-8 text-xs text-text-muted">
          © {new Date().getFullYear()} PHYSICAL. Built on Attestcoin Protocol.
        </div>
      </div>
    </footer>
  );
}
