"use client";

import { useEffect, useRef } from "react";

function hash(a: number, b: number) {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

interface Blob {
  lat: number;
  lng: number;
  rLat: number;
  rLng: number;
}

const LANDMASSES: Blob[] = [
  { lat: 48, lng: -105, rLat: 30, rLng: 20 },
  { lat: 20, lng: -100, rLat: 12, rLng: 10 },
  { lat: -8, lng: -62, rLat: 26, rLng: 15 },
  { lat: -30, lng: -65, rLat: 14, rLng: 10 },
  { lat: 12, lng: 18, rLat: 28, rLng: 16 },
  { lat: -22, lng: 24, rLat: 16, rLng: 14 },
  { lat: 52, lng: 15, rLat: 14, rLng: 22 },
  { lat: 60, lng: 60, rLat: 16, rLng: 38 },
  { lat: 20, lng: 80, rLat: 16, rLng: 14 },
  { lat: 5, lng: 105, rLat: 14, rLng: 12 },
];

function inLandmass(lat: number, lng: number): boolean {
  return LANDMASSES.some((b) => {
    const noise = 0.7 + hash(lat * 0.3, lng * 0.3) * 0.6;
    const dLat = (lat - b.lat) / (b.rLat * noise);
    const dLng = (lng - b.lng) / (b.rLng * noise);
    return dLat * dLat + dLng * dLng < 1;
  });
}

function buildPoints() {
  const points: { lat: number; lng: number }[] = [];
  for (let lat = -75; lat <= 75; lat += 3.2) {
    for (let lng = -180; lng <= 180; lng += 3.2) {
      if (inLandmass(lat, lng) && hash(lat, lng) > 0.15) points.push({ lat, lng });
    }
  }
  return points;
}

const SIZE = 400;
const R = 150;
const CENTER = SIZE / 2;

const RINGS = [
  { tilt: 0.15, size: R + 34, rotSpeed: 0.5, rotOffset: 0 },
  { tilt: -0.28, size: R + 52, rotSpeed: 0.3, rotOffset: 2 },
  { tilt: 0.05, size: R + 68, rotSpeed: -0.4, rotOffset: 4 },
];

const SATELLITES = [
  { speed: 0.5, tilt: 0.15, size: R + 34, offset: 0, ringIndex: 0 },
  { speed: -0.35, tilt: -0.28, size: R + 52, offset: 2.4, ringIndex: 1 },
];

export function DotGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);

    const points = buildPoints();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let theta = 0;
    let frameId: number;

    function drawFrame() {
      if (!ctx) return;
      ctx.clearRect(0, 0, SIZE, SIZE);

      ctx.lineWidth = 2.5;
      RINGS.forEach((ring) => {
        const rot = theta * ring.rotSpeed + ring.rotOffset;
        ctx.save();
        ctx.translate(CENTER, CENTER);
        ctx.rotate(rot);
        ctx.scale(1, ring.tilt + 0.35);
        ctx.strokeStyle = "rgba(139,92,246,0.4)";
        ctx.beginPath();
        ctx.arc(0, 0, ring.size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      SATELLITES.forEach((s) => {
        const ring = RINGS[s.ringIndex];
        const angle = theta * s.speed * 40 + s.offset;
        const sx = Math.cos(angle) * s.size;
        const sy = Math.sin(angle) * s.size * (s.tilt + 0.35);
        const rotAngle = theta * ring.rotSpeed + ring.rotOffset;
        const rx = sx * Math.cos(rotAngle) - sy * Math.sin(rotAngle);
        const ry = sx * Math.sin(rotAngle) + sy * Math.cos(rotAngle);
        ctx.fillStyle = "rgba(34,211,238,0.9)";
        ctx.beginPath();
        ctx.arc(CENTER + rx, CENTER + ry, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      points.forEach((p) => {
        const latRad = (p.lat * Math.PI) / 180;
        const lngRad = (p.lng * Math.PI) / 180 + theta;
        const x = R * Math.cos(latRad) * Math.sin(lngRad);
        const y = -R * Math.sin(latRad);
        const z = R * Math.cos(latRad) * Math.cos(lngRad);
        if (z > -R * 0.05) {
          const scale = (z + R) / (2 * R);
          const size = 0.6 + scale * 1.3;
          const alpha = 0.25 + scale * 0.75;
          ctx.fillStyle =
            z > 0 ? `rgba(230,228,236,${alpha})` : `rgba(139,92,246,${alpha * 0.6})`;
          ctx.beginPath();
          ctx.arc(CENTER + x, CENTER + y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    if (reducedMotion) {
      drawFrame();
    } else {
      const loop = () => {
        theta += 0.005;
        drawFrame();
        frameId = requestAnimationFrame(loop);
      };
      frameId = requestAnimationFrame(loop);
    }

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "auto", aspectRatio: "1 / 1" }}
      role="img"
      aria-label="Animated rotating globe representing the global network of connected infrastructure"
    />
  );
}