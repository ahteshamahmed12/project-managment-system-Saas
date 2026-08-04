import * as React from "react";
import { ShieldCheck } from "lucide-react";

interface AuthShellProps {
  eyebrow: string;
  headline: string;
  children: React.ReactNode;
}

export function AuthShell({
  eyebrow,
  headline,
  children,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      {/* Left Side */}
      <aside className="relative hidden overflow-hidden bg-slate-950 lg:flex">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-violet-600 to-slate-950" />

        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-blue-400/30 blur-3xl" />

        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-500/30 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col justify-between p-14 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md border border-white/20">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Auralink
              </h1>

              <p className="text-sm text-white/70">
                Project Management Platform
              </p>
            </div>
          </div>

          {/* Hero Text */}
          <div className="max-w-md">
            <p className="mb-3 text-sm uppercase tracking-[0.25em] text-blue-200">
              {eyebrow}
            </p>

            <h2 className="text-5xl font-bold leading-tight tracking-tight">
              {headline}
            </h2>

            <p className="mt-6 text-lg leading-8 text-white/70">
              Organize projects, collaborate with your team,
              manage tasks, and boost productivity from one
              secure platform.
            </p>
          </div>

          {/* Footer */}
          <div className="text-sm text-white/60">
            © {new Date().getFullYear()} Auralink.
            All rights reserved.
          </div>
        </div>
      </aside>

      {/* Right Side */}
      <main className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-8 lg:px-16">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-lg font-bold">
                Auralink
              </h1>

              <p className="text-sm text-slate-500">
                Project Management
              </p>
            </div>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}