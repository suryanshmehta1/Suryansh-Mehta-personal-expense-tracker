import React, { useState } from "react";
import { X, Landmark, Banknote, Save, Wallet } from "lucide-react";
import { AccountBalances, CurrencyCode } from "../types";

interface EditBalancesModalProps {
  isOpen: boolean;
  onClose: () => void;
  balances: AccountBalances;
  onSaveBalances: (newBalances: AccountBalances) => void;
  currency?: CurrencyCode;
}

export const EditBalancesModal: React.FC<EditBalancesModalProps> = ({
  isOpen,
  onClose,
  balances,
  onSaveBalances,
  currency = "INR",
}) => {
  const [bank, setBank] = useState(balances.bankBalance.toString());
  const [cash, setCash] = useState(balances.cashBalance.toString());

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bankVal = parseFloat(bank) || 0;
    const cashVal = parseFloat(cash) || 0;

    onSaveBalances({
      bankBalance: bankVal,
      cashBalance: cashVal,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  const currSymbol = currency === "INR" ? "₹" : "$";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Adjust Account Balances</h2>
              <p className="text-xs text-slate-400">Set available liquid funds in Bank & Cash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-blue-400" />
              <span>Available Bank Balance ({currency})</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">
                {currSymbol}
              </span>
              <input
                type="number"
                step="any"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-base font-bold focus:outline-none focus:border-blue-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Includes digital savings, checking accounts, fixed deposits & liquid funds.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-400" />
              <span>Available Physical Cash Balance ({currency})</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">
                {currSymbol}
              </span>
              <input
                type="number"
                step="any"
                value={cash}
                onChange={(e) => setCash(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-base font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Physical cash held in wallet, drawer, or home petty cash.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex justify-between items-center">
            <span>Total Combined Available Funds:</span>
            <strong className="font-mono text-emerald-400 text-sm font-bold">
              {currSymbol}
              {((parseFloat(bank) || 0) + (parseFloat(cash) || 0)).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </strong>
          </div>

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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Balances</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
