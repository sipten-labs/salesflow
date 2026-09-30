"use client";

import { useEffect, useState } from "react";
import { Check, Shield, Zap, Sparkles, CreditCard } from "lucide-react";

interface BillingData {
  tenant: {
    plan: string;
    maxUsers: number;
    maxLeads: number;
    aiMonthlyCredits: number;
    aiCreditsUsed: number;
    subscriptionStatus: string | null;
  };
  usage: {
    users: number;
    leads: number;
  };
}

const PLANS = [
  {
    id: "STARTER",
    name: "Starter",
    price: "$19",
    features: ["Up to 5 Users", "Up to 2,000 Leads", "Basic Sales Reports", "Email & Phone Tracking"],
  },
  {
    id: "PROFESSIONAL",
    name: "Professional",
    price: "$49",
    popular: true,
    features: [
      "Up to 20 Users",
      "Up to 20,000 Leads",
      "Advanced Sales Pipeline",
      "AI Lead Assistant (250 credits)",
      "CSV Bulk Importer",
    ],
  },
  {
    id: "BUSINESS",
    name: "Business",
    price: "$99",
    features: [
      "Up to 50 Users",
      "Up to 100,000 Leads",
      "Full Pipeline & Analytics",
      "AI Lead Assistant (1,000 credits)",
      "Priority 24/7 Support",
      "Custom Audit Logging",
    ],
  },
];

export default function BillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchBilling = async () => {
    try {
      const res = await fetch("/api/billing");
      const json = await res.json();
      if (res.ok) setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const handlePlanSelect = async (planId: string) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPlan: planId }),
      });
      if (res.ok) {
        await fetchBilling();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-500">Loading subscription details...</div>;
  }

  const { tenant, usage } = data;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-blue-500" /> Subscription & Plans
        </h1>
        <p className="text-sm text-slate-400">Manage company subscription tier, lead capacity, and AI usage quotas.</p>
      </div>

      {/* Workspace Usage Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Current Plan: {tenant.plan}</h3>
            <p className="text-xs text-slate-400">Status: {tenant.subscriptionStatus || "Active"}</p>
          </div>
          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
            Enterprise Guarded
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5">
            <span className="text-xs text-slate-400">Seats Utilized</span>
            <p className="mt-1 text-lg font-bold text-white">
              {usage.users} / {tenant.maxUsers}
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5">
            <span className="text-xs text-slate-400">Lead Volume</span>
            <p className="mt-1 text-lg font-bold text-white">
              {usage.leads} / {tenant.maxLeads.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5">
            <span className="text-xs text-slate-400">AI Credits Used</span>
            <p className="mt-1 text-lg font-bold text-white">
              {tenant.aiCreditsUsed} / {tenant.aiMonthlyCredits}
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = tenant.plan === plan.id;
          return (
            <div
              key={plan.id}
              className={`rounded-xl border p-6 flex flex-col justify-between transition ${
                plan.popular
                  ? "border-blue-500/60 bg-blue-950/10 shadow-lg shadow-blue-500/10"
                  : "border-slate-800 bg-slate-900/40"
              }`}
            >
              <div>
                {plan.popular && (
                  <span className="inline-block rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-2 border border-blue-500/30">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800">
                <button
                  disabled={isCurrent || updating}
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full rounded-lg py-2.5 text-xs font-bold transition ${
                    isCurrent
                      ? "bg-slate-800 text-slate-400 cursor-default"
                      : "bg-blue-600 text-white hover:bg-blue-500"
                  }`}
                >
                  {isCurrent ? "Current Active Plan" : `Upgrade to ${plan.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}