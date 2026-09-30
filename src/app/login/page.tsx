"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Sparkles, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030712] flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-white overflow-hidden">
      {/* 3D Dynamic Ambient Glow Orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-blue-600/25 blur-[140px] rounded-full animate-pulse" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/20 blur-[150px] rounded-full animate-pulse" />
      
      {/* Subtle Grid Canvas */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* 3D Glassmorphism Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#070e24]/70 backdrop-blur-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(37,99,235,0.15)] transition duration-500 hover:border-cyan-500/30">
        
        {/* Glow Accent Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1px] shadow-lg shadow-blue-500/30 mb-3">
            <div className="h-full w-full bg-[#030712] rounded-[15px] flex items-center justify-center font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              S
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            SalesFlow
          </h1>
          <p className="text-xs text-slate-400 mt-1">Sign in to your sales workspace</p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-xl border border-white/[0.08] bg-black/40 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 focus:outline-none transition duration-200"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.08] bg-black/40 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 focus:outline-none transition duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 py-3 text-sm font-bold text-white shadow-[0_0_25px_rgba(6,182,212,0.35)] transition duration-300 hover:scale-[1.02] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Need a workspace?{" "}
          <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}