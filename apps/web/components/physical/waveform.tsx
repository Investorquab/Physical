const toneVar = {
  live: "var(--color-live)",
  verified: "var(--color-verified)",
  pending: "var(--color-pending)",
  error: "var(--color-error)",
  accent: "var(--color-accent)",
  muted: "var(--color-text-muted)",
} as const;

export type WaveTone = keyof typeof toneVar;

/**
 * Deterministic pseudo-random path generator, seeded from a real string
 * (an event hash). Same event always produces the same trace. This is
 * a visual signature of the reading, not a fabricated data point.
 */
function seededPath(seed: string, width = 64, height = 22, points = 14) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const next = () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return (h % 1000) / 1000;
  };

  const step = width / (points - 1);
  const mid = height / 2;
  let d = `M0 ${mid.toFixed(1)}`;
  for (let i = 1; i < points; i++) {
    const x = i * step;
    const y = mid + (next() - 0.5) * height * 0.75;
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

interface WaveformProps {
  seed: string;
  tone?: WaveTone;
  width?: number;
  height?: number;
  className?: string;
}

export function Waveform({ seed, tone = "live", width = 64, height = 22, className }: WaveformProps) {
  const color = toneVar[tone];
  const d = seededPath(seed, width, height);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden="true">
      <path d={d} fill="none" stroke={color} strokeWidth="1.25" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

interface WaveformStampProps {
  seed: string;
  tone?: WaveTone;
  stamped?: boolean;
  className?: string;
}

/** A reading with an optional notarization ring drawn around it once verified. */
export function WaveformStamp({ seed, tone = "live", stamped = false, className }: WaveformStampProps) {
  return (
    <span className={`relative inline-flex items-center ${className ?? ""}`}>
      <Waveform seed={seed} tone={tone} width={56} height={20} />
      {stamped && (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          className="ml-1 shrink-0"
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="8" fill="none" stroke="var(--color-verified)" strokeWidth="1" />
          <circle cx="10" cy="10" r="5.5" fill="none" stroke="var(--color-verified)" strokeWidth="0.75" opacity="0.5" />
          <path
            d="M6.5 10.2l2.2 2.2 4.8-4.8"
            fill="none"
            stroke="var(--color-verified)"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}
