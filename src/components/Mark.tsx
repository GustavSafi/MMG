import { useId } from "react";

export default function Mark({ className = "" }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7DD3FC" />
          <stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
      <path d="M5 7 12 18 19 6M5 7l14-1" fill="none" stroke={`url(#${id})`} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="5" cy="7" r="2.6" fill="#7DD3FC" />
      <circle cx="19" cy="6" r="2.6" fill="#A78BFA" />
      <circle cx="12" cy="18" r="2.6" fill="#C4B5FD" />
    </svg>
  );
}
