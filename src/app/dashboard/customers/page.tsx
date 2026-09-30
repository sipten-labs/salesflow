"use client";

import { useEffect, useState } from "react";
import { Building, Mail, Phone, Search } from "lucide-react";

interface Customer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  totalRevenue: number;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      if (res.ok) setCustomers(data.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.contactName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Customers</h1>
          <p className="text-sm text-slate-400">View converted clients and account details.</p>
        </div>
      </div>

      <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-300 w-full max-w-md">
        <Search className="h-4 w-4 text-slate-500 mr-2" />
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-sm w-full outline-none placeholder:text-slate-500 text-white"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 shadow-sm">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-6 py-3.5">Company</th>
              <th className="px-6 py-3.5">Primary Contact</th>
              <th className="px-6 py-3.5">Communication</th>
              <th className="px-6 py-3.5">Total Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  Loading customers...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  No customers found yet. Win and convert leads from the pipeline.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition">
                  <td className="px-6 py-4 font-semibold text-white flex items-center gap-2">
                    <Building className="h-4 w-4 text-blue-400" />
                    {c.companyName}
                  </td>
                  <td className="px-6 py-4 text-slate-300">{c.contactName}</td>
                  <td className="px-6 py-4 space-y-0.5 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3" /> {c.email}
                    </div>
                    {c.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3" /> {c.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-400">
                    ${c.totalRevenue.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}