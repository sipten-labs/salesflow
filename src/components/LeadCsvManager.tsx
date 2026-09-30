"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Download, Upload, AlertCircle, CheckCircle2, FileSpreadsheet } from "lucide-react";

interface Props {
  currentLeads: any[];
  onImportComplete: () => void;
}

export default function LeadCsvManager({ currentLeads, onImportComplete }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [failedRows, setFailedRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Export Leads to CSV
  const handleExport = () => {
    if (!currentLeads || currentLeads.length === 0) {
      alert("No leads to export.");
      return;
    }

    const exportRows = currentLeads.map((l) => ({
      FullName: l.fullName,
      Company: l.companyName || "",
      Email: l.email,
      Phone: l.phone || "",
      Status: l.status,
      DealValue: l.estimatedValue,
    }));

    const csv = Papa.unparse(exportRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `salesflow_leads_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Read and parse incoming CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMessage(null);
    setFailedRows([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const formatted = results.data.map((row: any) => ({
          fullName: row["Full Name"] || row["fullName"] || row["Name"] || "",
          companyName: row["Company"] || row["companyName"] || "",
          email: row["Email"] || row["email"] || "",
          phone: row["Phone"] || row["phone"] || "",
          estimatedValue: row["Value"] || row["estimatedValue"] || row["Deal Value"] || 0,
        }));
        setParsedData(formatted);
      },
    });
  };

  // 3. Send parsed batch to API
  const handleStartImport = async () => {
    if (parsedData.length === 0) return;
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsedData }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      setStatusMessage(`Successfully imported ${data.importedCount} leads! Rejected ${data.failedCount} duplicates/invalids.`);
      setFailedRows(data.failedRecords || []);
      setParsedData([]);
      onImportComplete();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
        >
          <Upload className="h-4 w-4" /> Import CSV
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-bold text-white">Import Leads (CSV)</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <div className="rounded-lg border-2 border-dashed border-slate-800 bg-slate-900/30 p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
              />
              <p className="mt-2 text-[11px] text-slate-500">Columns supported: Name, Company, Email, Phone, Value</p>
            </div>

            {statusMessage && (
              <div className="rounded-md bg-blue-500/10 p-3 text-xs text-blue-400 border border-blue-500/20 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {parsedData.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-300 mb-2">Preview ({parsedData.length} records ready)</p>
                <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/50 p-2 text-xs text-slate-300">
                  {parsedData.slice(0, 5).map((row, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-slate-800/40 last:border-none">
                      <span>{row.fullName} ({row.companyName || "No Company"})</span>
                      <span className="text-slate-500">{row.email}</span>
                    </div>
                  ))}
                  {parsedData.length > 5 && <div className="text-[11px] text-slate-500 pt-1">+ {parsedData.length - 5} more records</div>}
                </div>
              </div>
            )}

            {failedRows.length > 0 && (
              <div className="max-h-32 overflow-y-auto rounded-md bg-red-500/10 p-2 border border-red-500/20 text-xs text-red-400">
                <div className="font-semibold flex items-center gap-1.5 mb-1">
                  <AlertCircle className="h-3.5 w-3.5" /> Rejections Report ({failedRows.length})
                </div>
                {failedRows.slice(0, 5).map((f, i) => (
                  <div key={i} className="text-[11px]">Row {f.row}: {f.email || "Missing Email"} — {f.reason}</div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-900"
              >
                Close
              </button>
              <button
                disabled={parsedData.length === 0 || loading}
                onClick={handleStartImport}
                className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-40"
              >
                {loading ? "Importing Data..." : `Confirm & Import ${parsedData.length} Records`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}