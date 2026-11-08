"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { CONTACT } from "@/content";

/*
  Two channels drawn as links between "You" and "Gustav". Hovering a card
  lights its channel; copying the email address or opening a channel sends a
  signal along it.
*/

type Channel = "email" | "linkedin";

const PATHS: Record<Channel, string> = {
  email: "M90 140 C 290 20, 510 20, 710 140",
  linkedin: "M90 140 C 290 260, 510 260, 710 140",
};

const QUERY = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

function Signal({ channel, shot }: { channel: Channel; shot: number }) {
  const a = useRef<SVGAnimateMotionElement>(null);
  const b = useRef<SVGAnimateMotionElement>(null);
  useEffect(() => {
    if (shot === 0) return;
    a.current?.beginElement();
    b.current?.beginElement();
  }, [shot]);
  return (
    <g>
      <circle r={16} fill="url(#cp-glow)" opacity={0}>
        <animateMotion ref={a} path={PATHS[channel]} dur="1.1s" begin="indefinite" fill="remove" />
        <animate attributeName="opacity" values="0;1;1;0" dur="1.1s" begin={`cp-${channel}-go.begin`} />
      </circle>
      <circle r={4} fill="#F0F9FF" opacity={0}>
        <animateMotion
          ref={b}
          id={`cp-${channel}-go`}
          path={PATHS[channel]}
          dur="1.1s"
          begin="indefinite"
          fill="remove"
        />
        <animate attributeName="opacity" values="0;1;1;0" dur="1.1s" begin={`cp-${channel}-go.begin`} />
      </circle>
    </g>
  );
}

export default function ContactPanel() {
  const [hover, setHover] = useState<Channel | null>(null);
  const [copied, setCopied] = useState(false);
  const [shots, setShots] = useState<Record<Channel, number>>({ email: 0, linkedin: 0 });
  const motionOk = useSyncExternalStore(subscribe, () => !window.matchMedia(QUERY).matches, () => false);

  const send = (c: Channel) => {
    setShots((s) => ({ ...s, [c]: s[c] + 1 }));
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setCopied(true);
      send("email");
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${CONTACT.email}`;
    }
  };

  const lit = (c: Channel) => hover === c;

  return (
    <div>
      <svg viewBox="0 0 800 280" className="w-full max-w-3xl mx-auto" role="img" aria-label="Two ways to reach Gustav: email and LinkedIn">
        <defs>
          <radialGradient id="cp-glow">
            <stop offset="0" stopColor="#7DD3FC" stopOpacity="0.9" />
            <stop offset="1" stopColor="#7DD3FC" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cp-glow-v">
            <stop offset="0" stopColor="#A78BFA" stopOpacity="0.9" />
            <stop offset="1" stopColor="#A78BFA" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cp-line" gradientUnits="userSpaceOnUse" x1="90" y1="0" x2="710" y2="0">
            <stop offset="0" stopColor="#7DD3FC" />
            <stop offset="1" stopColor="#A78BFA" />
          </linearGradient>
        </defs>

        {(Object.keys(PATHS) as Channel[]).map((c) => (
          <g key={c}>
            <path
              d={PATHS[c]}
              fill="none"
              stroke="url(#cp-line)"
              strokeWidth={lit(c) ? 2.6 : 1.4}
              strokeOpacity={lit(c) ? 0.95 : 0.4}
              strokeDasharray={lit(c) ? "none" : "4 7"}
              style={{ transition: "stroke-width .25s, stroke-opacity .25s" }}
            />
            {motionOk && (
              <circle r={2.4} fill={c === "email" ? "#BAE6FD" : "#DDD6FE"} opacity={lit(c) ? 0.95 : 0.45}>
                <animateMotion path={PATHS[c]} dur={c === "email" ? "5s" : "6.5s"} repeatCount="indefinite" />
              </circle>
            )}
            {motionOk && <Signal channel={c} shot={shots[c]} />}
            <text
              x={400}
              y={c === "email" ? 34 : 262}
              textAnchor="middle"
              fontSize={15}
              fontWeight={600}
              fill={lit(c) ? "#E8ECF7" : "#9AA6C4"}
              style={{ transition: "fill .25s" }}
            >
              {c === "email" ? "Email" : "LinkedIn"}
            </text>
          </g>
        ))}

        {/* You */}
        <circle cx={90} cy={140} r={30} fill="url(#cp-glow)" opacity={0.45} />
        <circle cx={90} cy={140} r={11} fill="#0B1328" stroke="#7DD3FC" strokeWidth={2} />
        <circle cx={90} cy={140} r={4} fill="#BAE6FD" />
        <text x={90} y={188} textAnchor="middle" fontSize={15} fontWeight={600} fill="#E8ECF7">
          You
        </text>

        {/* Gustav */}
        <circle cx={710} cy={140} r={30} fill="url(#cp-glow-v)" opacity={0.45}>
          {motionOk && (
            <animate attributeName="r" values="30;50;30" dur="0.7s" begin="cp-email-go.end; cp-linkedin-go.end" />
          )}
        </circle>
        <circle cx={710} cy={140} r={11} fill="#0B1328" stroke="#A78BFA" strokeWidth={2} />
        <circle cx={710} cy={140} r={4} fill="#DDD6FE" />
        <text x={710} y={188} textAnchor="middle" fontSize={15} fontWeight={600} fill="#E8ECF7">
          Gustav
        </text>
      </svg>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        <div
          onMouseEnter={() => setHover("email")}
          onMouseLeave={() => setHover(null)}
          onFocus={() => setHover("email")}
          onBlur={() => setHover(null)}
          className={`rounded-2xl border p-6 transition-colors ${lit("email") ? "border-cyan/50 bg-raised/80" : "border-line bg-deep/70"}`}
        >
          <h2 className="text-sm font-medium text-faint">Email</h2>
          <p className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight break-all">{CONTACT.email}</p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={copy}
              className="signal-bg inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-night hover:brightness-110"
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied" : "Copy address"}
            </button>
            <a
              href={`mailto:${CONTACT.email}`}
              onClick={() => send("email")}
              className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium hover:border-cyan/60 hover:text-cyan"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Write an email
            </a>
          </div>
          <p className="sr-only" aria-live="polite">
            {copied ? "Email address copied" : ""}
          </p>
        </div>

        <div
          onMouseEnter={() => setHover("linkedin")}
          onMouseLeave={() => setHover(null)}
          onFocus={() => setHover("linkedin")}
          onBlur={() => setHover(null)}
          className={`rounded-2xl border p-6 transition-colors ${lit("linkedin") ? "border-violet/50 bg-raised/80" : "border-line bg-deep/70"}`}
        >
          <h2 className="text-sm font-medium text-faint">LinkedIn</h2>
          <p className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight">Gustav Safi</p>
          <div className="mt-5">
            <a
              href={CONTACT.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => send("linkedin")}
              className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium hover:border-violet/60 hover:text-violet"
            >
              Open profile
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-muted">
        My code is on{" "}
        <a href={CONTACT.github} target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline underline-offset-4">
          GitHub
        </a>
        .
      </p>
    </div>
  );
}
