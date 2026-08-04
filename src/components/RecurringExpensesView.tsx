import React, { useState } from "react";
import { Repeat, Plus, Calendar, Check, X, Bell } from "lucide-react";
import { RecurringExpense } from "../types";
import { formatCurrency } from "../lib/exportUtils";

interface RecurringExpensesViewProps {
  recurringList: RecurringExpense[];
  onAddRecurring: (item: Omit<RecurringExpense, "id" | "userId">) => void;
  onToggleActive: (id: string) => void;
}

export const RecurringExpensesView: React.FC<RecurringExpensesViewProps> = ({
  recurringList,
  onAddRecurring,
  onToggleActive,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [frequency, setFrequency] = useState<"Monthly" | "Weekly" | "Quarterly" | "Yearly">("Monthly");
  const [category, setCategory] = useState("Subscriptions");
  const [paymentMethod, setPaymentMethod] = useState<any>("Credit Card");
  const [nextDueDate, setNextDueDate] = useState(() => new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    onAddRecurring({
      title,
      amount: Number(amount),
      currency: "INR",
      frequency,
      category,
      paymentMethod,
      nextDueDate,
      active: true,
    });

    setTitle("");
    setAmount("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Recurring Expenses & Subscriptions</h2>
          <p className="text-xs text-slate-400">
            Track automated bills, software subscriptions, SIPs, and membership dues for Suryansh Mehta
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Recurring Bill</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recurringList.map((rec) => (
          <div
            key={rec.id}
            className={`p-5 rounded-2xl bg-slate-900 border transition-all ${
              rec.active ? "border-slate-800" : "border-slate-800/40 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                  {rec.frequency} • {rec.category}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{rec.title}</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Next Due:{" "}
                  <strong className="text-slate-200 font-mono">{rec.nextDueDate}</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {formatCurrency(rec.amount, rec.currency)}
                </span>
                <div className="mt-2">
                  <button
                    onClick={() => onToggleActive(rec.id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                      rec.active
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-800 text-slate-500 border-slate-700"
                    }`}
                  >
                    {rec.active ? "Active Auto-Pay" : "Paused"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 text-slate-100 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Add Recurring Subscription</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Hosting or Netflix"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="1250"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Next Due Date</label>
                  <input
                    type="date"
                    required
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Save Recurring
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
