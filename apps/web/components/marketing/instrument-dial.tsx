"use client";

import { useEffect, useState } from "react";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export function InstrumentDial() {
  const reducedMotion = usePrefersReducedMotion();

  const spin = (from: number, to: number, dur: string) =>
    reducedMotion ? undefined : (
      <animateTransform
        attributeName="transform"
        type="rotate"
        from={`${from} 140 140`}
        to={`${to} 140 140`}
        dur={dur}
        repeatCount="indefinite"
      />
    );

  return (
    <svg viewBox="0 0 280 280" className="w-full" role="img" aria-label="Animated verification instrument dial">
      <g stroke="#4A4A56" strokeWidth="1.5">
        <circle cx="140" cy="140" r="132" fill="none" />
      </g>
      <g stroke="#4A4A56" strokeWidth="1.5">
        <line x1="140" y1="4" x2="140" y2="20" />
        <line x1="140" y1="260" x2="140" y2="276" />
        <line x1="4" y1="140" x2="20" y2="140" />
        <line x1="260" y1="140" x2="276" y2="140" />
      </g>
      <g stroke="#3A3A45" strokeWidth="1">
        {[30, 60, 120, 150, 210, 240, 300, 330].map((deg) => (
          <line key={deg} x1="140" y1="8" x2="140" y2="16" transform={`rotate(${deg} 140 140)`} />
        ))}
      </g>
      <g stroke="#8B5CF6" strokeWidth="1.75" fill="none" opacity="0.6">
        <ellipse cx="140" cy="140" rx="105" ry="105" />
        <ellipse cx="140" cy="140" rx="105" ry="52">{spin(0, 360, "18s")}</ellipse>
        <ellipse cx="140" cy="140" rx="105" ry="52" transform="rotate(60 140 140)">{spin(60, 420, "18s")}</ellipse>
        <ellipse cx="140" cy="140" rx="105" ry="52" transform="rotate(120 140 140)">{spin(120, 480, "18s")}</ellipse>
      </g>
      <circle cx="140" cy="140" r="3.5" fill="#22D3EE" />
      <g fill="#22D3EE">
        <circle cx="245" cy="140" r="3.5">{spin(0, 360, "18s")}</circle>
        <circle cx="35" cy="140" r="3.5">{spin(180, 540, "18s")}</circle>
      </g>
      <g>
        {spin(0, 360, "7s")}
        <circle cx="140" cy="18" r="3.5" fill="#F59E0B" />
      </g>
    </svg>
  );
}