import React, { useState } from "react";
import {
  PieChart as PieIcon,
  Plus,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  SlidersHorizontal,
  Edit2,
  AlertCircle,
} from "lucide-react";
import { BudgetConfig, Expense, CategoryType } from "../types";
import { formatCurrency } from "../lib/exportUtils";

interface BudgetsViewProps {
  budget: BudgetConfig;
  expenses: Expense[];
  onUpdateBudget: (newBudget: BudgetConfig) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budget,
  expenses,
  onUpdateBudget,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [overallLimit, setOverallLimit] = useState(budget.overallLimit || 125000);
  const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>(
    budget.categoryLimits || {}
  );

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Current month active expenses
  const currentMonthExpenses = expenses.filter(
    (e) => e.status !== "deleted" && e.date.startsWith(currentMonthStr)
  );

  const totalSpentThisMonth = currentMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const overallPercentage = Math.round((totalSpentThisMonth / (overallLimit || 1)) * 100);

  // Category spent map
  const categorySpentMap: Record<string, number> = {};
  currentMonthExpenses.forEach((e) => {
    categorySpentMap[e.category] = (categorySpentMap[e.category] || 0) + e.amount;
  });

  const handleSave = () => {
    onUpdateBudget({
      ...budget,
      overallLimit: Number(overallLimit),
      categoryLimits,
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  const handleCategoryLimitChange = (cat: string, limitVal: number) => {
    setCategoryLimits((prev) => ({
      ...prev,
      [cat]: limitVal,
    }));
  };

  const getStatusColor = (perc: number) => {
    if (perc >= 100) return "text-red-400 bg-red-500/10 border-red-500/30";
    if (perc >= 90) return "text-orange-400 bg-orange-500/10 border-orange-500/30";
    if (perc >= 75) return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    if (perc >= 50) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  };

  const getProgressColorClass = (perc: number) => {
    if (perc >= 100) return "bg-red-500";
    if (perc >= 90) return "bg-orange-500";
    if (perc >= 75) return "bg-amber-500";
    if (perc >= 50) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Monthly Budget & Category Guardrails</h2>
          <p className="text-xs text-slate-400">
            Monitor spending limits, warning thresholds (50%, 75%, 90%, 100%), and active alerts
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all self-start sm:self-auto"
        >
          <SlidersHorizontal className="w-4 h-4 text-blue-400" />
          <span>{isEditing ? "Close Editor" : "Configure Limits"}</span>
        </button>
      </div>

      {/* Overall Budget Overview Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Overall Monthly Budget ({currentMonthStr})
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {formatCurrency(totalSpentThisMonth)}
              </span>
              <span className="text-sm text-slate-400 font-mono">
                / {formatCurrency(overallLimit)}
              </span>
            </div>
          </div>

          <div
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 ${getStatusColor(
              overallPercentage
            )}`}
          >
            {overallPercentage >= 90 ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>
              {overallPercentage >= 100
                ? "Budget Exceeded!"
                : overallPercentage >= 90
                ? "90%+ Critical Limit"
                : overallPercentage >= 75
                ? "75%+ High Warning"
                : overallPercentage >= 50
                ? "50%+ Halfway Threshold"
                : "Healthy Range"}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 rounded-full ${getProgressColorClass(
                overallPercentage
              )}`}
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>0%</span>
            <span>50%</span>
            <span>75%</span>
            <span>90%</span>
            <span>100% ({formatCurrency(overallLimit)})</span>
          </div>
        </div>

        {/* Edit Overall Limit Form */}
        {isEditing && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 pt-4">
            <label className="text-xs font-semibold text-slate-300">Set Monthly Overall Limit (₹)</label>
            <div className="flex gap-3">
              <input
                type="number"
                value={overallLimit}
                onChange={(e) => setOverallLimit(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono font-bold"
              />
              <button
                onClick={handleSave}
                className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-600/20"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category Budgets Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white">Category Specific Budgets & Progress</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(categoryLimits).map(([catName, limitVal]) => {
            const numLimit = Number(limitVal) || 1;
            const spent = categorySpentMap[catName] || 0;
            const perc = Math.round((spent / numLimit) * 100);

            return (
              <div
                key={catName}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-md hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white">{catName}</span>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {formatCurrency(spent)} / {formatCurrency(numLimit)}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(
                      perc
                    )}`}
                  >
                    {perc}%
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${getProgressColorClass(
                      perc
                    )}`}
                    style={{ width: `${Math.min(perc, 100)}%` }}
                  />
                </div>

                {isEditing && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-400">Limit ₹</span>
                    <input
                      type="number"
                      value={limitVal}
                      onChange={(e) =>
                        handleCategoryLimitChange(catName, Number(e.target.value))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
