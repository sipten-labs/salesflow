"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Kanban,
  CheckSquare,
  Sparkles,
  ShieldCheck,
  CreditCard,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/dashboard/leads", icon: Users },
  { label: "Pipeline", href: "/dashboard/pipeline", icon: Kanban },
  { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { label: "AI Assistant", href: "/dashboard/ai", icon: Sparkles },
  { label: "Team", href: "/dashboard/team", icon: ShieldCheck },
  { label: "Billing & Plans", href: "/dashboard/billing", icon: CreditCard },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="relative flex min-h-screen bg-[#030712] text-slate-100 overflow-hidden">
      {/* Ambient Blue Background Glow Behind Dashboard */}
      <div className="pointer-events-none fixed top-0 left-64 w-[600px] h-[500px] bg-blue-600/10 blur-[160px] rounded-full -z-10" />
      <div className="pointer-events-none fixed bottom-0 right-0 w-[500px] h-[400px] bg-cyan-500/10 blur-[150px] rounded-full -z-10" />

      {/* Sidebar with Glass Frosting */}
      <aside className="w-64 border-r border-white/[0.08] bg-[#050b1d]/70 backdrop-blur-2xl p-5 flex flex-col justify-between hidden md:flex z-20">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1px] shadow-lg shadow-blue-500/30">
              <div className="w-full h-full bg-[#030712] rounded-[11px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 text-lg">
                S
              </div>
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-tight drop-shadow-[0_0_12px_rgba(59,130,246,0.4)]">
                SalesFlow
              </span>
              <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
                Enterprise Cloud
              </span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600/20 to-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/[0.08] bg-[#050b1d]/60 backdrop-blur-xl px-6 flex items-center justify-between md:hidden z-10">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
              S
            </div>
            <span className="font-bold text-white text-sm">SalesFlow</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Sign Out
          </button>
        </header>

        <main className="p-6 md:p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}