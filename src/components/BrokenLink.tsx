"use client";

import Link from "next/link";
import { useRef, useState } from "react";

/*
  A broken link in the node network. Drag the loose node back to its partner
  (or press it with the keyboard) to repair the link and reveal the way home.
*/

const A = { x: 140, y: 170 };
const START = { x: 470, y: 90 };
const SNAP = 46;

export default function BrokenLink() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pos, setPos] = useState(START);
  const [dragging, setDragging] = useState(false);
  const [fixed, setFixed] = useState(false);

  const target = { x: A.x + 150, y: A.y };

  const toSvg = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return pos;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const m = svg.getScreenCTM();
    if (!m) return pos;
    const p = pt.matrixTransform(m.inverse());
    return { x: Math.max(20, Math.min(580, p.x)), y: Math.max(20, Math.min(300, p.y)) };
  };

  const onDown = (e: React.PointerEvent<SVGGElement>) => {
    if (fixed) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onMove = (e: React.PointerEvent<SVGGElement>) => {
    if (!dragging || fixed) return;
    const p = toSvg(e);
    if (Math.hypot(p.x - target.x, p.y - target.y) < SNAP) {
      setPos(target);
      setFixed(true);
      setDragging(false);
    } else {
      setPos(p);
    }
  };
  const onUp = () => setDragging(false);

  const repair = () => {
    setPos(target);
    setFixed(true);
  };

  // Broken edge: two stubs pointing at each other with a gap in the middle
  const dx = pos.x - A.x;
  const dy = pos.y - A.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const stub = Math.min(70, len / 2 - 14);

  return (
    <div className="flex flex-col items-center">
      <svg
        ref={svgRef}
        viewBox="0 0 600 320"
        className="w-full max-w-2xl touch-none select-none"
        role="img"
        aria-label={fixed ? "The link is repaired" : "A broken link between two nodes"}
      >
        <defs>
          <linearGradient id="bl-line" gradientUnits="userSpaceOnUse" x1={A.x} y1={A.y} x2={pos.x} y2={pos.y}>
            <stop offset="0" stopColor="#7DD3FC" />
            <stop offset="1" stopColor="#A78BFA" />
          </linearGradient>
          <radialGradient id="bl-glow-c">
            <stop offset="0" stopColor="#7DD3FC" stopOpacity="0.85" />
            <stop offset="1" stopColor="#7DD3FC" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bl-glow-v">
            <stop offset="0" stopColor="#A78BFA" stopOpacity="0.85" />
            <stop offset="1" stopColor="#A78BFA" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* faint neighbours so it reads as part of a network */}
        <g stroke="#6C7DB8" strokeOpacity={0.3} strokeWidth={1}>
          <line x1={A.x} y1={A.y} x2={60} y2={80} />
          <line x1={A.x} y1={A.y} x2={70} y2={265} />
          <line x1={60} y1={80} x2={210} y2={40} />
          <line x1={target.x} y1={target.y} x2={420} y2={250} opacity={fixed ? 1 : 0.35} />
          <line x1={420} y1={250} x2={540} y2={200} />
          <line x1={540} y1={200} x2={560} y2={60} />
        </g>
        <g fill="#8FA0D6">
          {[
            [60, 80],
            [70, 265],
            [210, 40],
            [420, 250],
            [540, 200],
            [560, 60],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={3} />
          ))}
        </g>

        {fixed ? (
          <line x1={A.x} y1={A.y} x2={pos.x} y2={pos.y} stroke="url(#bl-line)" strokeWidth={3} strokeLinecap="round" />
        ) : (
          <g stroke="#9AA6C4" strokeWidth={2} strokeLinecap="round" strokeDasharray="5 6">
            <line x1={A.x} y1={A.y} x2={A.x + ux * stub} y2={A.y + uy * stub} />
            <line x1={pos.x} y1={pos.y} x2={pos.x - ux * stub} y2={pos.y - uy * stub} />
          </g>
        )}

        {/* fixed node */}
        <circle cx={A.x} cy={A.y} r={fixed ? 34 : 24} fill="url(#bl-glow-c)" opacity={0.6} style={{ transition: "r .4s" }} />
        <circle cx={A.x} cy={A.y} r={11} fill="#0B1328" stroke="#7DD3FC" strokeWidth={2} />
        <circle cx={A.x} cy={A.y} r={4} fill="#BAE6FD" />

        {/* loose node */}
        <g
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          style={{ cursor: fixed ? "default" : dragging ? "grabbing" : "grab" }}
        >
          <circle cx={pos.x} cy={pos.y} r={34} fill="transparent" />
          <circle cx={pos.x} cy={pos.y} r={fixed ? 34 : 24} fill="url(#bl-glow-v)" opacity={0.6} style={{ transition: "r .4s" }} />
          <circle cx={pos.x} cy={pos.y} r={11} fill="#0B1328" stroke="#A78BFA" strokeWidth={2} />
          <circle cx={pos.x} cy={pos.y} r={4} fill="#DDD6FE" />
          {!fixed && !dragging && (
            <text x={pos.x} y={pos.y - 26} textAnchor="middle" fontSize={13} fill="#9AA6C4">
              Drag me
            </text>
          )}
        </g>
      </svg>

      <div className="mt-6 min-h-[6.5rem] flex flex-col items-center text-center" aria-live="polite">
        {fixed ? (
          <>
            <p className="text-lg text-fg">Link repaired.</p>
            <Link
              href="/"
              className="signal-bg mt-4 rounded-full px-6 py-3 font-semibold text-night hover:brightness-110"
            >
              Back home
            </Link>
          </>
        ) : (
          <>
            <p className="text-muted">Drag the loose node back to reconnect the link.</p>
            <button
              type="button"
              onClick={repair}
              className="mt-3 text-sm text-faint underline underline-offset-4 hover:text-cyan"
            >
              Repair it for me
            </button>
          </>
        )}
      </div>
    </div>
  );
}
