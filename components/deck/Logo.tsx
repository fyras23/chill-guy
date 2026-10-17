import React from "react";
import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Chill Guy Home"
      className={`inline-flex items-center gap-3.5 group select-none ${className}`}
    >
      {/* Original sleepy crescent-moon face in ultramarine (#1A2A86) and butter (#FCEFB4) */}
      <svg
        width="42"
        height="42"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-10 h-10 shrink-0 drop-shadow-[2px_2px_0_#1A2A86] transition-transform group-hover:rotate-6"
        aria-hidden="true"
      >
        {/* Crescent moon shape */}
        <path
          d="M32 4C20 6 10 16 10 28C10 40 20 48 32 48C36 48 39.5 47 42 45.5C36 43 28 36 28 26C28 16 35 9 42 6.5C39 4.8 35.5 4 32 4Z"
          fill="#FFF9E0"
          stroke="#1A2A86"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Sleepy half-closed eye */}
        <path
          d="M20 22C22 25 25 25 27 22"
          stroke="#1A2A86"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Eyelash details */}
        <path
          d="M23.5 24.5V27"
          stroke="#1A2A86"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Gentle smiling mouth */}
        <path
          d="M20 31C22 33 24 33 26 31"
          stroke="#1A2A86"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Nightcap / cute accessory touch: little sleepy zzz or star */}
        <circle cx="36" cy="12" r="2" fill="#FF8A4C" stroke="#1A2A86" strokeWidth="1.5" />
      </svg>

      <span className="font-display font-bold text-2xl md:text-3xl tracking-tight text-primary">
        Chill Guy
      </span>
    </Link>
  );
}

