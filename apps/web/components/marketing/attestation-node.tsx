export function AttestationNode() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[480px]" aria-hidden="true">
      <div className="absolute inset-0 blur-3xl">
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/30" />
        <div className="absolute left-1/3 top-1/3 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-live/20" />
      </div>

      <svg viewBox="0 0 480 480" className="relative h-full w-full">
        <defs>
          <linearGradient id="facet-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="facet-b" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#6D28D9" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="facet-c" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <radialGradient id="core-glow" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#E4E2EC" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#8B5CF6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {[
          { x: 70, y: 120, delay: 0 },
          { x: 40, y: 300, delay: 0.6 },
          { x: 120, y: 410, delay: 1.2 },
          { x: 410, y: 90, delay: 0.3 },
          { x: 440, y: 260, delay: 0.9 },
          { x: 360, y: 420, delay: 1.5 },
        ].map((pt, i) => (
          <g key={i}>
            <line
              x1={240}
              y1={240}
              x2={pt.x}
              y2={pt.y}
              stroke="currentColor"
              className="text-border"
              strokeWidth="1"
            />
            <circle
              cx={pt.x}
              cy={pt.y}
              r="3.5"
              className="text-live motion-safe:animate-trace-pulse"
              fill="currentColor"
              style={{ animationDelay: `${pt.delay}s` }}
            />
          </g>
        ))}

        <g transform="translate(240,240)">
          <polygon points="0,-110 78,-38 0,-6 -78,-38" fill="url(#facet-c)" opacity="0.95" />
          <polygon points="-78,-38 0,-6 0,86 -95,10" fill="url(#facet-b)" />
          <polygon points="78,-38 0,-6 0,86 95,10" fill="url(#facet-a)" />
          <polygon points="-95,10 0,86 95,10 0,58" fill="#0A0A0F" opacity="0.35" />
          <ellipse cx="0" cy="-10" rx="130" ry="130" fill="url(#core-glow)" />
          <polygon
            points="0,-110 78,-38 0,-6 -78,-38"
            fill="none"
            stroke="#E4E2EC"
            strokeOpacity="0.25"
            strokeWidth="1"
          />
        </g>
      </svg>
    </div>
  );
}