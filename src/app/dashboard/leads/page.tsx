"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Mail, Phone, Building } from "lucide-react";
import LeadCsvManager from "@/components/LeadCsvManager";

interface Lead {
  id: string;
  fullName: string;
  companyName: string | null;
  email: string;
  phone: string | null;
  status: string;
  estimatedValue: number;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const [newLead, setNewLead] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    estimatedValue: "",
    notes: "",
  });

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (res.ok) setLeads(data.leads || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create lead");

      setIsModalOpen(false);
      setNewLead({
        fullName: "",
        companyName: "",
        email: "",
        phone: "",
        estimatedValue: "",
        notes: "",
      });
      fetchLeads();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.fullName.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.companyName && l.companyName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Leads</h1>
          <p className="text-sm text-slate-400">Manage and track your incoming prospective deals.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* CSV Import & Export Buttons */}
          <LeadCsvManager currentLeads={filteredLeads} onImportComplete={fetchLeads} />
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg hover:bg-blue-500 transition"
          >
            <Plus className="h-4 w-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-300 w-full max-w-md">
        <Search className="h-4 w-4 text-slate-500 mr-2" />
        <input
          type="text"
          placeholder="Search by name, company, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-sm w-full outline-none placeholder:text-slate-500 text-white"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 shadow-sm">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-6 py-3.5">Name</th>
              <th className="px-6 py-3.5">Company</th>
              <th className="px-6 py-3.5">Contact</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Deal Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  Loading leads...
                </td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No leads found. Click "+ Add Lead" or "Import CSV" to add data.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-800/30 transition">
                  <td className="px-6 py-4 font-semibold text-white">{lead.fullName}</td>
                  <td className="px-6 py-4 text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5" />
                      {lead.companyName || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-y-0.5 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3" /> {lead.email}
                    </div>
                    {lead.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3" /> {lead.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-emerald-400 font-semibold">
                    ${lead.estimatedValue.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">Create New Lead</h2>
            <p className="mt-1 text-xs text-slate-400">Add client contact and initial deal metrics.</p>

            {formError && (
              <div className="mt-4 rounded-md bg-red-500/10 p-3 text-xs text-red-400 border border-red-500/20">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateLead} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs uppercase font-medium text-slate-300">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newLead.fullName}
                  onChange={(e) => setNewLead({ ...newLead, fullName: e.target.value })}
                  placeholder="Sarah Connor"
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase font-medium text-slate-300">Company</label>
                  <input
                    type="text"
                    value={newLead.companyName}
                    onChange={(e) => setNewLead({ ...newLead, companyName: e.target.value })}
                    placeholder="Acme Corp"
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase font-medium text-slate-300">Estimated Value ($)</label>
                  <input
                    type="number"
                    value={newLead.estimatedValue}
                    onChange={(e) => setNewLead({ ...newLead, estimatedValue: e.target.value })}
                    placeholder="5000"
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase font-medium text-slate-300">Email *</label>
                  <input
                    type="email"
                    required
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    placeholder="sarah@acme.com"
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase font-medium text-slate-300">Phone</label>
                  <input
                    type="tel"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    placeholder="+1 555-0199"
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {formLoading ? "Saving..." : "Save Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}