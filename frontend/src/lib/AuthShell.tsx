import * as React from "react";
import { ShieldCheck } from "lucide-react";

interface AuthShellProps {
  eyebrow: string;
  headline: string;
  children: React.ReactNode;
}

export function AuthShell({ eyebrow, headline, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen w-full bg-ink-50">
      {/* Brand panel */}
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-ink-950 p-12 text-white lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-linear-to-br from-brand-600 via-violet-500/60 to-ink-950"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 translate-x-1/4 translate-y-1/4 rounded-full bg-violet-500/40 blur-3xl"
        />

        <div className="relative z-10 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            Auralink
          </span>
        </div>

        <div className="relative z-10 max-w-sm">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-white/70">
            {eyebrow}
          </p>
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight">
            {headline}
          </h2>
        </div>

        <p className="relative z-10 text-xs text-white/50">
          © {new Date().getFullYear()} Auralink. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-105">{children}</div>
      </div>
    </div>
  );
}
