const POINTS = [
  4, 6, 5, 9, 7, 14, 11, 18, 22, 17, 25, 21, 30, 26, 35, 31, 40, 33, 45, 38, 52,
  44, 58, 49, 63, 55, 60, 52, 48, 42,
];

function toPath(points: number[], width: number, height: number) {
  const step = width / (points.length - 1);
  const max = Math.max(...points);
  return points
    .map((p, i) => {
      const x = i * step;
      const y = height - (p / max) * height * 0.82 - 6;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

const MARKERS = [
  { i: 6, label: "OBS", color: "text-live" },
  { i: 14, label: "ATT", color: "text-accent" },
  { i: 21, label: "VER", color: "text-verified" },
  { i: 27, label: "SET", color: "text-pending" },
];

export function ReadoutStrip() {
  const width = 620;
  const height = 220;
  const path = toPath(POINTS, width, height);
  const step = width / (POINTS.length - 1);

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height + 40}`} className="w-full">
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={0}
            x2={width}
            y1={(height / 3) * i + 10}
            y2={(height / 3) * i + 10}
            className="text-border"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.5"
          />
        ))}

        <path
          d={path}
          fill="none"
          stroke="url(#trace-gradient)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="trace-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="35%" stopColor="#8B5CF6" />
            <stop offset="70%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {MARKERS.map((m) => {
          const x = m.i * step;
          const y = height - (POINTS[m.i] / Math.max(...POINTS)) * height * 0.82 - 6;
          return (
            <g key={m.label}>
              <line
                x1={x}
                x2={x}
                y1={y}
                y2={height + 22}
                className="text-border"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
              <circle cx={x} cy={y} r="4" className={m.color} fill="currentColor" />
              <text
                x={x}
                y={height + 36}
                textAnchor="middle"
                className={`font-mono text-[10px] ${m.color}`}
                fill="currentColor"
              >
                {m.label}
              </text>
            </g>
          );
        })}

        <line
          x1={width - 2}
          x2={width - 2}
          y1={0}
          y2={height}
          className="text-live motion-safe:animate-pulse"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}