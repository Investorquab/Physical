const toneVar = {
  live: "var(--color-live)",
  verified: "var(--color-verified)",
  pending: "var(--color-pending)",
  error: "var(--color-error)",
  accent: "var(--color-accent)",
  muted: "var(--color-text-muted)",
} as const;

export type MarkerTone = keyof typeof toneVar;

interface SurveyMarkerProps {
  size?: number;
  tone?: MarkerTone;
  pulse?: boolean;
  className?: string;
}

export function SurveyMarker({
  size = 20,
  tone = "live",
  pulse = false,
  className,
}: SurveyMarkerProps) {
  const color = toneVar[tone];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      className={className}
      aria-hidden="true"
    >
      {pulse && (
        <circle
          className="marker-pulse-ring"
          cx="10"
          cy="10"
          r="4"
          fill="none"
          stroke={color}
          strokeWidth="1"
        />
      )}
      <circle cx="10" cy="10" r="6" fill="none" stroke={color} strokeWidth="1" />
      <circle cx="10" cy="10" r="1.6" fill={color} />
      <line x1="10" y1="1" x2="10" y2="3.5" stroke={color} strokeWidth="1" />
      <line x1="10" y1="16.5" x2="10" y2="19" stroke={color} strokeWidth="1" />
      <line x1="1" y1="10" x2="3.5" y2="10" stroke={color} strokeWidth="1" />
      <line x1="16.5" y1="10" x2="19" y2="10" stroke={color} strokeWidth="1" />
    </svg>
  );
}
