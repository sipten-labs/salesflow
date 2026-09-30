"use client";

import { useEffect, useState } from "react";
import {
  Users,
  DollarSign,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface StatsData {
  metrics: {
    totalLeads: number;
    newLeads: number;
    qualifiedLeads: number;
    wonDeals: number;
    lostDeals: number;
    pipelineValue: number;
    wonRevenue: number;
    conversionRate: string;
    pendingTasks: number;
    overdueTasks: number;
  };
  leadsBySource: { name: string; count: number }[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function DashboardOverviewPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        const json = await res.json();
        if (res.ok) setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-500">Loading performance analytics...</div>;
  }

  const { metrics, leadsBySource } = data;

  const topCards = [
    { title: "Total Pipeline Value", value: `$${metrics.pipelineValue.toLocaleString()}`, icon: DollarSign, color: "text-blue-400" },
    { title: "Won Revenue", value: `$${metrics.wonRevenue.toLocaleString()}`, icon: Award, color: "text-emerald-400" },
    { title: "Conversion Rate", value: metrics.conversionRate, icon: TrendingUp, color: "text-purple-400" },
    { title: "Total Leads", value: metrics.totalLeads, icon: Users, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Sales Executive Overview</h1>
        <p className="text-sm text-slate-400">Live operational snapshot of active leads, won deals and sales health.</p>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {topCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{card.title}</span>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-3.5">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">New Inbound</p>
          <p className="mt-1 text-lg font-bold text-white flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-blue-500" /> {metrics.newLeads}
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-3.5">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Qualified</p>
          <p className="mt-1 text-lg font-bold text-white flex items-center gap-1.5">
            <Award className="h-4 w-4 text-emerald-500" /> {metrics.qualifiedLeads}
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-3.5">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Pending Tasks</p>
          <p className="mt-1 text-lg font-bold text-white flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-amber-500" /> {metrics.pendingTasks}
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-3.5">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Overdue Tasks</p>
          <p className="mt-1 text-lg font-bold text-red-400 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-red-500" /> {metrics.overdueTasks}
          </p>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Distribution Chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Pipeline Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { stage: "New", count: metrics.newLeads },
                  { stage: "Qualified", count: metrics.qualifiedLeads },
                  { stage: "Won", count: metrics.wonDeals },
                  { stage: "Lost", count: metrics.lostDeals },
                ]}
              >
                <XAxis dataKey="stage" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#fff", borderRadius: "8px" }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Source Breakdown Chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Leads by Channel</h3>
          <div className="h-64 w-full flex items-center justify-center">
            {leadsBySource.length === 0 ? (
              <span className="text-xs text-slate-500">No lead sources recorded yet.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadsBySource}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {leadsBySource.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#fff", borderRadius: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}