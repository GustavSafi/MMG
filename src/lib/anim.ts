"use client";

import { useSyncExternalStore } from "react";

/* Small animation helpers shared by the interactive demos. */

export type Pt = { x: number; y: number };

const QUERY = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/** True when the visitor has not asked for reduced motion. False during SSR. */
export function useMotionOk() {
  return useSyncExternalStore(subscribe, () => !window.matchMedia(QUERY).matches, () => false);
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/** Runs onUpdate(0..1) over `ms`. Resolves false if cancelled along the way. */
export function tween(ms: number, onUpdate: (t: number) => void, cancelled: () => boolean): Promise<boolean> {
  return new Promise((resolve) => {
    if (ms <= 0) {
      onUpdate(1);
      resolve(!cancelled());
      return;
    }
    const start = performance.now();
    const frame = (now: number) => {
      if (cancelled()) return resolve(false);
      const t = Math.min(1, (now - start) / ms);
      onUpdate(ease(t));
      if (t < 1) requestAnimationFrame(frame);
      else resolve(true);
    };
    requestAnimationFrame(frame);
  });
}

export function wait(ms: number, cancelled: () => boolean): Promise<boolean> {
  return new Promise((resolve) => {
    if (ms <= 0) return resolve(!cancelled());
    setTimeout(() => resolve(!cancelled()), ms);
  });
}

export const lerp = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
