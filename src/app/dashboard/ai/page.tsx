"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, Copy, Check, TrendingUp, AlertCircle, Mail, Send } from "lucide-react";

interface Lead {
  id: string;
  fullName: string;
  companyName: string | null;
  estimatedValue: number;
  status: string;
  leadSource: string | null;
}

interface AIAnalysis {
  summary: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  suggestedNextAction: string;
  suggestedFollowUpEmail: string;
}

export default function AIAssistantPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // Leads fetch karna
  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch("/api/leads");
        const data = await res.json();
        if (data.leads && data.leads.length > 0) {
          setLeads(data.leads);
          setSelectedLeadId(data.leads[0].id);
        }
      } catch (err) {
        console.error("Failed to load leads", err);
      } finally {
        setLoadingLeads(false);
      }
    }
    fetchLeads();
  }, []);

  // Strategy generate karna
  const handleGenerateStrategy = async () => {
    if (!selectedLeadId) return;
    setAnalyzing(true);
    setError("");

    try {
      const res = await fetch("/api/leads/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: selectedLeadId }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(typeof data.error === "object" ? JSON.stringify(data.error) : data.error || "Analysis failed");
      }

      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message || "Failed to generate AI Strategy");
    } finally {
      setAnalyzing(false);
    }
  };

  const copyToClipboard = () => {
    if (!analysis?.suggestedFollowUpEmail) return;
    navigator.clipboard.writeText(analysis.suggestedFollowUpEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto selection:bg-cyan-500 selection:text-white">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-400" />
          <h1 className="text-2xl font-black text-white tracking-tight">AI Sales Strategist</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Powered by <span className="text-cyan-400 font-semibold">Google Gemini 3.8 Flash</span> to automatically qualify deals and generate custom sales pitches.
        </p>
      </div>

      {/* Selector Section Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#070e24]/70 backdrop-blur-xl p-5 shadow-lg shadow-black/40">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
          Select Lead to Analyze
        </label>

        {loadingLeads ? (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" /> Loading leads...
          </div>
        ) : leads.length === 0 ? (
          <p className="text-xs text-slate-400">No leads found. Please add leads from the Leads page first.</p>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="flex-1 rounded-xl border border-white/[0.1] bg-black/40 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id} className="bg-slate-900 text-white">
                  {l.fullName} ({l.companyName || "No Company"}) - ${l.estimatedValue}
                </option>
              ))}
            </select>

            <button
              onClick={handleGenerateStrategy}
              disabled={analyzing}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 px-6 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.35)] transition duration-200 hover:scale-[1.02] disabled:opacity-60"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing Deal...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate AI Strategy
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <pre className="whitespace-pre-wrap font-sans">{error}</pre>
          </div>
        )}
      </div>

      {/* Output Results Grid */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
          {/* Left Column: Priority & Summary */}
          <div className="space-y-5">
            {/* Priority & Deal Summary Card */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#070e24]/70 backdrop-blur-xl p-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Deal Priority
                </span>
                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                    analysis.priority === "HIGH"
                      ? "bg-red-500/10 text-red-400 border-red-500/30"
                      : analysis.priority === "MEDIUM"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  {analysis.priority} PRIORITY
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-bold text-white mb-2">Deal Summary</h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-black/30 p-3.5 rounded-xl border border-white/[0.04]">
                  {analysis.summary}
                </p>
              </div>
            </div>

            {/* Recommended Next Action Card */}
            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-950/20 to-slate-900/40 backdrop-blur-xl p-5 shadow-lg">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block mb-2">
                Recommended Action
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {analysis.suggestedNextAction}
              </p>
            </div>
          </div>

          {/* Right Column: Personalized Outreach Pitch */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#070e24]/70 backdrop-blur-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-cyan-400" />
                  Personalized Outreach Pitch
                </span>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-500/30 bg-cyan-950/30 transition"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy Pitch
                    </>
                  )}
                </button>
              </div>

              <div className="w-full rounded-xl border border-white/[0.08] bg-black/40 p-4 text-xs text-slate-200 font-mono leading-relaxed max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                {analysis.suggestedFollowUpEmail}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] text-[11px] text-slate-500 mt-4">
              <span>Model: Google Gemini 3.8 Flash</span>
              <span>1 AI credit applied</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}