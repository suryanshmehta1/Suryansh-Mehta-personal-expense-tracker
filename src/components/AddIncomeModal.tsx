import React, { useState } from "react";
import { X, ArrowDownLeft, Landmark, Banknote, Calendar, Tag, FileText, CheckCircle2 } from "lucide-react";
import { Income, IncomeSource, CurrencyCode } from "../types";

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIncome: (income: Income, autoUpdateBalance: boolean) => void;
  currency?: CurrencyCode;
}

const INCOME_SOURCES: { value: IncomeSource; label: string }[] = [
  { value: "Salary", label: "Salary / Payroll" },
  { value: "Client Payment", label: "Client Payment" },
  { value: "Business Income", label: "Business Revenue" },
  { value: "Freelance", label: "Freelance / Projects" },
  { value: "Investment Returns", label: "Investment & Dividends" },
  { value: "Refund", label: "Refund / Cash Back" },
  { value: "Rental Income", label: "Rental Income" },
  { value: "Gift / Allowance", label: "Gift / Allowance" },
  { value: "Cash Deposit", label: "Cash Deposit" },
  { value: "Other", label: "Other Source" },
];

export const AddIncomeModal: React.FC<AddIncomeModalProps> = ({
  isOpen,
  onClose,
  onAddIncome,
  currency = "INR",
}) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toTimeString().slice(0, 5);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [destinationAccount, setDestinationAccount] = useState<"Bank" | "Cash">("Bank");
  const [source, setSource] = useState<IncomeSource>("Salary");
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState(nowTime);
  const [notes, setNotes] = useState("");
  const [autoUpdateBalance, setAutoUpdateBalance] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid positive amount.");
      return;
    }

    if (!title.trim()) {
      alert("Please enter a title or source description.");
      return;
    }

    const newIncome: Income = {
      id: `inc-${Date.now()}`,
      userId: "suryansh-mehta-001",
      title: title.trim(),
      amount: parsedAmount,
      currency: (currency || "INR") as CurrencyCode,
      date,
      time,
      destinationAccount,
      source,
      notes: notes.trim(),
      status: "received",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddIncome(newIncome, autoUpdateBalance);
    onClose();

    // Reset form
    setTitle("");
    setAmount("");
    setNotes("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Record Received Funds / Income</h2>
              <p className="text-xs text-slate-400">Log incoming payments to Bank or Cash balance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title & Amount */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Payment Title / Source Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. August Salary, Client Invoice #102, Cash Deposit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Amount ({currency}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">
                    {currency === "INR" ? "₹" : "$"}
                  </span>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-base font-bold placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Income Category
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as IncomeSource)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  {INCOME_SOURCES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Destination Account Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Deposit Into Account *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDestinationAccount("Bank")}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  destinationAccount === "Bank"
                    ? "bg-blue-600/20 border-blue-500 text-blue-300"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  destinationAccount === "Bank" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                }`}>
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold">Bank Account</p>
                  <p className="text-[10px] text-slate-400">UPI, NEFT, Cheque, Card</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDestinationAccount("Cash")}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  destinationAccount === "Cash"
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  destinationAccount === "Cash" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                }`}>
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold">Physical Cash</p>
                  <p className="text-[10px] text-slate-400">Wallet, Handheld cash</p>
                </div>
              </button>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Received Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes / Transaction Ref
            </label>
            <input
              type="text"
              placeholder="e.g. NEFT Ref #91823901, Received from ABC Pvt Ltd"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Auto Update Balance Checkbox */}
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={autoUpdateBalance}
              onChange={(e) => setAutoUpdateBalance(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span>
              Automatically add <strong className="text-emerald-400">+{amount || "0"}</strong> to my{" "}
              <strong className="text-white">{destinationAccount === "Bank" ? "Bank Balance" : "Cash Balance"}</strong>
            </span>
          </label>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Funds Received</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
