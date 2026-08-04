import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  FileText,
  Calendar,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Expense } from "../types";
import { exportToCSV, exportToExcel, exportToPDF, formatCurrency } from "../lib/exportUtils";

interface GoogleSheetsExportViewProps {
  expenses: Expense[];
}

export const GoogleSheetsExportView: React.FC<GoogleSheetsExportViewProps> = ({
  expenses,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const [copied, setCopied] = useState(false);

  const activeExpenses = expenses.filter(
    (e) => e.status !== "deleted" && e.date.startsWith(selectedMonth)
  );

  const totalMonthAmount = activeExpenses.reduce((s, e) => s + e.amount, 0);

  const handleCopyGoogleSheetsFormat = () => {
    const headers = [
      "Date",
      "Title",
      "Category",
      "Sub Category",
      "Amount (INR)",
      "Payment Method",
      "Vendor",
      "Transaction ID",
      "Notes",
    ];

    const rows = activeExpenses.map((e) => [
      e.date,
      e.title,
      e.category,
      e.subCategory || "",
      e.amount,
      e.paymentMethod,
      e.vendor || "",
      e.paymentDetails?.bank?.transactionId ||
        e.paymentDetails?.upi?.transactionId ||
        "",
      e.notes || "",
    ]);

    const tabSeparated = [
      headers.join("\t"),
      ...rows.map((r) => r.join("\t")),
    ].join("\n");

    navigator.clipboard.writeText(tabSeparated);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 border border-slate-800 shadow-xl space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Google Sheets Synchronization & Export Center
            </h2>
            <p className="text-xs text-slate-300">
              Export Suryansh Mehta's monthly records directly to Google Sheets, Excel, or PDF
            </p>
          </div>
        </div>
      </div>

      {/* Month Selector & Summary Bar */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Select Month to Sync</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono font-bold block"
            />
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400">Total Monthly Expenditure</span>
            <p className="text-2xl font-black text-emerald-400 font-mono">
              {formatCurrency(totalMonthAmount)}
            </p>
            <p className="text-[11px] text-slate-500">{activeExpenses.length} records ready</p>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={handleCopyGoogleSheetsFormat}
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all text-left space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Copy className="w-4 h-4" /> Copy for Google Sheets
              </span>
              {copied && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Copy tab-formatted row data. Paste directly into any Google Spreadsheet (`Ctrl+V`).
            </p>
          </button>

          <button
            onClick={() =>
              exportToExcel(
                activeExpenses,
                `Mehta_Expenses_${selectedMonth}.xlsx`
              )
            }
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition-all text-left space-y-2"
          >
            <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
              <Download className="w-4 h-4" /> Download Excel (.xlsx)
            </span>
            <p className="text-[11px] text-slate-400 leading-normal">
              Download formatted Microsoft Excel workbook with formulas and headers.
            </p>
          </button>

          <button
            onClick={() =>
              exportToPDF(
                activeExpenses,
                undefined,
                `Mehta_Expenses_${selectedMonth}.pdf`
              )
            }
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 transition-all text-left space-y-2"
          >
            <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Download PDF Report
            </span>
            <p className="text-[11px] text-slate-400 leading-normal">
              Generate printable PDF summary report for audit or filing.
            </p>
          </button>
        </div>
      </div>

      {/* Preview Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
        <h3 className="text-sm font-bold text-white">Google Sheets Sync Data Preview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Title</th>
                <th className="p-2.5">Category</th>
                <th className="p-2.5">Payment Method</th>
                <th className="p-2.5 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {activeExpenses.slice(0, 10).map((e) => (
                <tr key={e.id}>
                  <td className="p-2.5 text-slate-400">{e.date}</td>
                  <td className="p-2.5 font-sans font-semibold text-slate-100">{e.title}</td>
                  <td className="p-2.5">{e.category}</td>
                  <td className="p-2.5 text-blue-400">{e.paymentMethod}</td>
                  <td className="p-2.5 text-right text-emerald-400 font-bold">
                    {formatCurrency(e.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
