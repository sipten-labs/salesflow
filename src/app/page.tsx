"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { ArrowRight, CheckCircle2, Sparkles, Kanban, Shield, PlayCircle, Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [demoLoading, setDemoLoading] = useState(false);

  // Bina email dale Instant Demo me login karna
  const handleInstantDemo = async () => {
    try {
      setDemoLoading(true);
      const res = await fetch("/api/auth/demo", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        const loginRes = await signIn("credentials", {
          redirect: false,
          email: data.email,
          password: data.password,
        });

        if (loginRes?.ok) {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-100 overflow-hidden flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-blue-600/30 to-cyan-400/20 blur-[140px] rounded-full -z-10" />

      {/* Header Navigation */}
      <header className="border-b border-white/[0.08] bg-[#030712]/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-500/30">
              S
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              SalesFlow
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleInstantDemo}
              disabled={demoLoading}
              className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 transition flex items-center gap-1.5"
            >
              {demoLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
              Instant Live Demo
            </button>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs sm:text-sm font-semibold text-white transition shadow-md shadow-blue-600/30"
            >
              Start 30-Day Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.25)] mb-8">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span>Special Offer: 30-Day Full Access Free Trial</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
          Manage B2B Sales & Pipeline <br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
            Powered by Autonomous AI
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          See everything in action right now without entering an email, or start your 1-month free trial to manage your own pipeline.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
          <button
            onClick={handleInstantDemo}
            disabled={demoLoading}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(6,182,212,0.35)] transition hover:scale-[1.02]"
          >
            {demoLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading Live Demo...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" />
                Explore Demo (No Email Needed)
              </>
            )}
          </button>

          <Link
            href="/register"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.15] bg-white/[0.04] backdrop-blur-lg hover:bg-white/[0.08] px-6 py-3.5 text-sm font-semibold text-slate-200 transition"
          >
            Start 1-Month Free Trial <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Badges with 3.8 Flash */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Full 30 Days Free</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Instant Access (Zero Setup)</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Gemini 3.8 Flash Included</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#030712]/80 backdrop-blur py-6 text-center text-xs text-slate-500">
        © 2026 SalesFlow CRM. 100% Secure Enterprise Platform.
      </footer>
    </div>
  );
}