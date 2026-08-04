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
  Building2,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from "lucide-react";
import { Expense, Income, AccountBalances } from "../types";
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  exportIncomesToExcel,
  exportAccountReportToPDF,
  formatCurrency,
} from "../lib/exportUtils";

interface GoogleSheetsExportViewProps {
  expenses: Expense[];
  incomes?: Income[];
  balances?: AccountBalances;
}

export const GoogleSheetsExportView: React.FC<GoogleSheetsExportViewProps> = ({
  expenses,
  incomes = [],
  balances = { cashBalance: 1570, bankBalance: 6927.86, updatedAt: new Date().toISOString() },
}) => {
  const [activeReportTab, setActiveReportTab] = useState<"expenses" | "accounts">("expenses");

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const [copiedExpenses, setCopiedExpenses] = useState(false);
  const [copiedIncomes, setCopiedIncomes] = useState(false);
  const [accountFilter, setAccountFilter] = useState<"All" | "Bank" | "Cash">("All");

  const activeExpenses = expenses.filter(
    (e) => e.status !== "deleted" && e.date.startsWith(selectedMonth)
  );

  const activeIncomes = incomes.filter(
    (i) => i.status !== "deleted" && (accountFilter === "All" || i.destinationAccount === accountFilter)
  );

  const totalMonthAmount = activeExpenses.reduce((s, e) => s + e.amount, 0);
  const totalIncomesAmount = activeIncomes.reduce((s, i) => s + i.amount, 0);

  // Cashflow totals
  const totalSpentCash = expenses
    .filter((e) => e.status !== "deleted" && e.paymentMethod === "Cash")
    .reduce((s, e) => s + e.amount, 0);

  const totalSpentBank = expenses
    .filter((e) => e.status !== "deleted" && e.paymentMethod !== "Cash")
    .reduce((s, e) => s + e.amount, 0);

  const totalIncomeCash = incomes
    .filter((i) => i.status !== "deleted" && i.destinationAccount === "Cash")
    .reduce((s, i) => s + i.amount, 0);

  const totalIncomeBank = incomes
    .filter((i) => i.status !== "deleted" && i.destinationAccount === "Bank")
    .reduce((s, i) => s + i.amount, 0);

  const handleCopyExpensesGoogleSheets = () => {
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
    setCopiedExpenses(true);
    setTimeout(() => setCopiedExpenses(false), 3000);
  };

  const handleCopyIncomesGoogleSheets = () => {
    const headers = [
      "Date",
      "Time",
      "Source / Title",
      "Category",
      "Amount Received (INR)",
      "Destination Account",
      "Notes",
    ];

    const rows = activeIncomes.map((i) => [
      i.date,
      i.time || "",
      i.title,
      i.source,
      i.amount,
      i.destinationAccount,
      i.notes || "",
    ]);

    const tabSeparated = [
      headers.join("\t"),
      ...rows.map((r) => r.join("\t")),
    ].join("\n");

    navigator.clipboard.writeText(tabSeparated);
    setCopiedIncomes(true);
    setTimeout(() => setCopiedIncomes(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Suryansh Mehta's Sync & Reports Center
                <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" /> Real-time Cloud Sync
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Generate financial reports and export expenses & cash/bank account balances directly to Google Sheets or PDF
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveReportTab("expenses")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeReportTab === "expenses"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Expense Reports
            </button>
            <button
              onClick={() => setActiveReportTab("accounts")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeReportTab === "accounts"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Cash & Bank Report
            </button>
          </div>
        </div>
      </div>

      {/* 1. EXPENSES REPORT TAB */}
      {activeReportTab === "expenses" && (
        <div className="space-y-6">
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
                onClick={handleCopyExpensesGoogleSheets}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all text-left space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Copy className="w-4 h-4" /> Copy for Google Sheets
                  </span>
                  {copiedExpenses && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Copy tab-formatted expense rows. Paste directly into any Google Spreadsheet (`Ctrl+V`).
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
      )}

      {/* 2. CASH & BANK ACCOUNT REPORT TAB */}
      {activeReportTab === "accounts" && (
        <div className="space-y-6">
          {/* Real-time Liquid Account Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cash Balance */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-400" /> Physical Cash Balance
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-mono">
                  Cash Account
                </span>
              </div>
              <p className="text-2xl font-black text-white font-mono">
                {formatCurrency(balances.cashBalance)}
              </p>
              <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span>Received: +{formatCurrency(totalIncomeCash)}</span>
                <span className="text-rose-400">Spent: -{formatCurrency(totalSpentCash)}</span>
              </div>
            </div>

            {/* Bank Balance */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-400" /> Bank Account Balance
                </span>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-mono">
                  Bank / UPI
                </span>
              </div>
              <p className="text-2xl font-black text-white font-mono">
                {formatCurrency(balances.bankBalance)}
              </p>
              <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span>Received: +{formatCurrency(totalIncomeBank)}</span>
                <span className="text-rose-400">Spent: -{formatCurrency(totalSpentBank)}</span>
              </div>
            </div>

            {/* Total Liquid Wealth */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> Total Liquid Wealth
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">
                  Cash + Bank
                </span>
              </div>
              <p className="text-2xl font-black text-emerald-400 font-mono">
                {formatCurrency(balances.cashBalance + balances.bankBalance)}
              </p>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                Recorded & Synced across all connected devices
              </div>
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Export Cash & Bank Accounts Report
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={handleCopyIncomesGoogleSheets}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all text-left space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Copy className="w-4 h-4" /> Copy Received Funds
                  </span>
                  {copiedIncomes && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Copy tab-separated received funds data for Google Sheets.
                </p>
              </button>

              <button
                onClick={() => exportIncomesToExcel(incomes, balances)}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition-all text-left space-y-2"
              >
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <Download className="w-4 h-4" /> Download Funds Excel (.xlsx)
                </span>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Export complete income log and account balance summary to Excel workbook.
                </p>
              </button>

              <button
                onClick={() => exportAccountReportToPDF(incomes, expenses, balances)}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 transition-all text-left space-y-2"
              >
                <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Cash & Bank PDF Statement
                </span>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Generate printable PDF account balance statement and audit report.
                </p>
              </button>
            </div>
          </div>

          {/* Received Funds Preview Table */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-white">Received Funds Logged</h3>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400">Account:</span>
                {(["All", "Bank", "Cash"] as const).map((acc) => (
                  <button
                    key={acc}
                    onClick={() => setAccountFilter(acc)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      accountFilter === acc
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                    }`}
                  >
                    {acc}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Payment Source / Title</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Destination</th>
                    <th className="p-2.5 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {activeIncomes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500 font-sans">
                        No income or received funds logged yet for this filter.
                      </td>
                    </tr>
                  ) : (
                    activeIncomes.map((inc) => (
                      <tr key={inc.id}>
                        <td className="p-2.5 text-slate-400">{inc.date}</td>
                        <td className="p-2.5 font-sans font-semibold text-slate-100">{inc.title}</td>
                        <td className="p-2.5">{inc.source}</td>
                        <td className="p-2.5 text-blue-400">{inc.destinationAccount}</td>
                        <td className="p-2.5 text-right text-emerald-400 font-bold">
                          +{formatCurrency(inc.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

