"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Building, User, Mail, Lock } from "lucide-react";

type Ripple = { id: number; x: number; y: number; color: string; size: number };

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const tiltRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const lastMove = useRef(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, companyName, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Water ripple ----------
  const addRipple = (x: number, y: number, size = 520) => {
    const id = ++idRef.current;
    const color = Math.random() > 0.5 ? "59,130,246" : "185,28,28";
    setRipples((r) => [...r.slice(-12), { id, x, y, color, size }]);
    setTimeout(() => setRipples((r) => r.filter((i) => i.id !== id)), 3400);
  };

  // Apne aap paani ki boondein girti rehti hain
  useEffect(() => {
    const t = setInterval(() => {
      addRipple(
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight,
        300 + Math.random() * 300
      );
    }, 2200);
    return () => clearInterval(t);
  }, []);

  // ---------- 3D tilt + cursor glow ----------
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    if (innerRef.current) {
      innerRef.current.style.setProperty("--mx", `${e.clientX - r.left}px`);
      innerRef.current.style.setProperty("--my", `${e.clientY - r.top}px`);
    }
    // halki ripple mouse ke peeche
    const now = Date.now();
    if (now - lastMove.current > 450) {
      lastMove.current = now;
      addRipple(e.clientX, e.clientY, 160);
    }
  };
  const handleLeave = () => {
    if (tiltRef.current)
      tiltRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  };

  const inputClass =
    "w-full rounded-xl border border-white/[0.1] bg-black/50 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/40 focus:shadow-[0_0_22px_rgba(59,130,246,0.5)] focus:outline-none transition duration-200";
  const labelClass =
    "text-[11px] font-semibold uppercase tracking-wider text-slate-300 block mb-1";

  return (
    <div
      onClick={(e) => addRipple(e.clientX, e.clientY, 560)}
      className="relative min-h-screen bg-[#04020a] flex items-center justify-center p-4 selection:bg-blue-500 selection:text-white overflow-hidden"
    >
      <style>{`
        @keyframes sfMorphA {
          0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: translate(0,0) rotate(0deg) scale(1); }
          33%     { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; transform: translate(70px,40px) rotate(60deg) scale(1.15); }
          66%     { border-radius: 50% 50% 40% 60% / 40% 70% 40% 60%; transform: translate(-40px,60px) rotate(120deg) scale(0.95); }
        }
        @keyframes sfMorphB {
          0%,100% { border-radius: 40% 60% 60% 40% / 70% 30% 70% 30%; transform: translate(0,0) rotate(0deg) scale(1); }
          50%     { border-radius: 70% 30% 40% 60% / 40% 60% 40% 60%; transform: translate(-80px,-50px) rotate(-90deg) scale(1.2); }
        }
        @keyframes sfSpin { to { transform: rotate(360deg); } }
        @keyframes sfShimmer { 0%{transform:translateX(-120%)} 100%{transform:translateX(250%)} }
        @keyframes sfPulse { 0%,100%{opacity:.6; filter:drop-shadow(0 0 6px rgba(59,130,246,.6))} 50%{opacity:1; filter:drop-shadow(0 0 16px rgba(220,38,38,.8))} }
        @keyframes sfRise { from{opacity:0; transform:translateY(30px) scale(.96)} to{opacity:1; transform:translateY(0) scale(1)} }
        @keyframes sfRipple {
          0%   { transform: translate(-50%,-50%) scale(0); opacity: .95; }
          70%  { opacity: .35; }
          100% { transform: translate(-50%,-50%) scale(1); opacity: 0; }
        }
        @keyframes sfWave { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes sfBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }

        .sf-blob-a { animation: sfMorphA 16s ease-in-out infinite; }
        .sf-blob-b { animation: sfMorphB 20s ease-in-out infinite; }
        .sf-rise { animation: sfRise 1s cubic-bezier(.2,.8,.2,1) both; }
        .sf-tilt { transition: transform .15s ease-out; transform-style: preserve-3d; will-change: transform; }

        .sf-ripple {
          position: absolute; border-radius: 9999px; pointer-events: none;
          border: 2px solid rgba(var(--c), .9);
          box-shadow: 0 0 30px rgba(var(--c), .7), inset 0 0 30px rgba(var(--c), .45);
          animation: sfRipple 3.2s cubic-bezier(.15,.6,.3,1) forwards;
          filter: url(#sfWater);
        }
        .sf-ripple::after {
          content: ""; position: absolute; inset: 14%; border-radius: 9999px;
          border: 1.5px solid rgba(var(--c), .55);
          box-shadow: 0 0 20px rgba(var(--c), .5);
        }

        .sf-border {
          position: relative; border-radius: 1.25rem; padding: 2px; overflow: hidden;
          box-shadow: 0 30px 70px rgba(0,0,0,.75), 0 0 60px rgba(37,99,235,.4), 0 0 90px rgba(185,28,28,.3);
          animation: sfBob 6s ease-in-out infinite;
        }
        .sf-border::before {
          content: ""; position: absolute; inset: -60%;
          background: conic-gradient(from 0deg, transparent 0deg, #3b82f6 70deg, transparent 140deg, #b91c1c 220deg, #ef4444 260deg, transparent 320deg);
          animation: sfSpin 5s linear infinite;
        }
        .sf-inner {
          position: relative; border-radius: calc(1.25rem - 2px);
          background:
            radial-gradient(260px circle at var(--mx, 50%) var(--my, 0%), rgba(59,130,246,.22), rgba(185,28,28,.12) 45%, transparent 70%),
            rgba(6,4,18,.9);
          backdrop-filter: blur(26px);
        }

        .sf-btn { position: relative; overflow: hidden; }
        .sf-btn::after {
          content: ""; position: absolute; top: 0; left: 0; width: 40%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,.4), transparent);
          transform: translateX(-120%); animation: sfShimmer 2.8s ease-in-out infinite;
        }
        .sf-logo { animation: sfPulse 3s ease-in-out infinite; }

        .sf-wave { position: absolute; left: 0; bottom: 0; width: 200%; pointer-events: none; }
        .sf-wave-1 { animation: sfWave 14s linear infinite; opacity: .55; }
        .sf-wave-2 { animation: sfWave 22s linear infinite reverse; opacity: .4; bottom: -10px; }
      `}</style>

      {/* Water distortion filter (ripple ko paani jaisa lehrata hai) */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="sfWater" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="3" result="n">
              <animate attributeName="baseFrequency" dur="8s" values="0.012 0.02;0.02 0.012;0.012 0.02" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="n" scale="26" />
          </filter>
        </defs>
      </svg>

      {/* Liquid blobs */}
      <div className="sf-blob-a pointer-events-none absolute -top-40 right-1/4 w-[540px] h-[540px] bg-gradient-to-tr from-blue-700/45 to-cyan-500/20 blur-[120px]" />
      <div className="sf-blob-b pointer-events-none absolute -bottom-40 left-1/4 w-[520px] h-[520px] bg-gradient-to-tr from-red-900/55 to-red-600/25 blur-[130px]" />
      <div className="sf-blob-b pointer-events-none absolute top-1/3 -left-32 w-[400px] h-[400px] bg-blue-900/40 blur-[120px]" />
      <div className="sf-blob-a pointer-events-none absolute bottom-10 -right-24 w-[380px] h-[380px] bg-red-950/55 blur-[120px]" />

      {/* Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1e293b14_1px,transparent_1px),linear-gradient(to_bottom,#1e293b14_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Waves (neeche paani ki lehrein) */}
      <svg className="sf-wave sf-wave-1" viewBox="0 0 2400 200" preserveAspectRatio="none" height="170">
        <defs>
          <linearGradient id="sfWg1" x1="0" x2="1">
            <stop offset="0" stopColor="#1d4ed8" />
            <stop offset="0.5" stopColor="#7f1d1d" />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        <path fill="url(#sfWg1)" d="M0,100 C150,40 300,160 450,100 C600,40 750,160 900,100 C1050,40 1200,160 1350,100 C1500,40 1650,160 1800,100 C1950,40 2100,160 2250,100 L2400,100 L2400,200 L0,200 Z" />
      </svg>
      <svg className="sf-wave sf-wave-2" viewBox="0 0 2400 200" preserveAspectRatio="none" height="140">
        <path fill="#991b1b" d="M0,120 C200,60 400,180 600,120 C800,60 1000,180 1200,120 C1400,60 1600,180 1800,120 C2000,60 2200,180 2400,120 L2400,200 L0,200 Z" />
      </svg>

      {/* Ripples */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {ripples.map((r) => (
          <span
            key={r.id}
            className="sf-ripple"
            style={{
              left: r.x,
              top: r.y,
              width: r.size,
              height: r.size,
              ["--c" as any]: r.color,
            }}
          />
        ))}
      </div>

      {/* 3D Glow Card */}
      <div
        ref={tiltRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="sf-tilt sf-rise relative z-10 w-full max-w-md"
      >
        <div className="sf-border">
          <div ref={innerRef} className="sf-inner p-8">
            <div className="text-center mb-6">
              <div className="sf-logo inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-red-700 p-[1px] mb-3">
                <div className="h-full w-full bg-[#05030a] rounded-[15px] flex items-center justify-center font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-400">
                  S
                </div>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-[0_0_22px_rgba(59,130,246,0.6)]">
                SalesFlow
              </h1>
              <p className="text-xs text-blue-400 font-medium mt-1">Start your 30-Day Free Trial</p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className={labelClass}>Company Name</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Sales Agency"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@acme.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="sf-btn w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-800 hover:from-blue-500 hover:to-red-700 py-3 text-sm font-bold text-white shadow-[0_0_32px_rgba(37,99,235,0.6),0_0_32px_rgba(185,28,28,0.45)] transition duration-300 hover:scale-[1.03] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Setting up Workspace...
                  </>
                ) : (
                  <>
                    Get Started Free <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}