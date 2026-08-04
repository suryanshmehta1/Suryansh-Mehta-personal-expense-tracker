import React from "react";
import {
  TrendingUp,
  CreditCard,
  PlusCircle,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Bot,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { Expense, BudgetConfig } from "../types";
import { formatCurrency } from "../lib/exportUtils";

interface DashboardProps {
  expenses: Expense[];
  budget: BudgetConfig;
  onOpenAddExpense: () => void;
  onOpenAiAdvisor: () => void;
  onOpenReceiptScan: () => void;
  onSelectExpense: (exp: Expense) => void;
}

const COLORS = [
  "#2563EB",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
  "#64748B",
];

export const Dashboard: React.FC<DashboardProps> = ({
  expenses,
  budget,
  onOpenAddExpense,
  onOpenAiAdvisor,
  onOpenReceiptScan,
  onSelectExpense,
}) => {
  const activeExpenses = expenses.filter((e) => e.status !== "deleted");

  // Time calculations
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentYearStr = `${now.getFullYear()}`;

  // 1. Today's Expenses
  const todayExpenses = activeExpenses.filter((e) => e.date === todayStr);
  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // 2. This Week Expenses (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const weekExpenses = activeExpenses.filter((e) => new Date(e.date) >= sevenDaysAgo);
  const weekTotal = weekExpenses.reduce((sum, e) => sum + e.amount, 0);

  // 3. This Month Expenses
  const monthExpenses = activeExpenses.filter((e) => e.date.startsWith(currentMonthStr));
  const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // 4. This Year Expenses
  const yearExpenses = activeExpenses.filter((e) => e.date.startsWith(currentYearStr));
  const yearTotal = yearExpenses.reduce((sum, e) => sum + e.amount, 0);

  // 5. Total Expenses
  const grandTotal = activeExpenses.reduce((sum, e) => sum + e.amount, 0);

  // 6. Average Daily Spending (based on days elapsed in month)
  const daysInMonth = now.getDate() || 1;
  const avgDaily = monthTotal / daysInMonth;

  // 7. Highest & Lowest Expense
  const sortedAmounts = [...activeExpenses].sort((a, b) => b.amount - a.amount);
  const highestExp = sortedAmounts[0];
  const lowestExp = sortedAmounts[sortedAmounts.length - 1];

  // 8. Most Used Payment Method
  const paymentCounts: Record<string, number> = {};
  activeExpenses.forEach((e) => {
    paymentCounts[e.paymentMethod] = (paymentCounts[e.paymentMethod] || 0) + 1;
  });
  const mostUsedMethod =
    Object.entries(paymentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "UPI";

  // 9. Most Expensive Category
  const catSums: Record<string, number> = {};
  monthExpenses.forEach((e) => {
    catSums[e.category] = (catSums[e.category] || 0) + e.amount;
  });
  const topCategoryEntry = Object.entries(catSums).sort((a, b) => b[1] - a[1])[0];
  const topCategory = topCategoryEntry?.[0] || "Food";
  const topCategoryAmount = topCategoryEntry?.[1] || 0;

  // Chart 1: Category Breakdown for Pie Chart
  const categoryChartData = Object.entries(catSums).map(([name, value]) => ({
    name,
    value,
  }));

  // Chart 2: Payment Method Breakdown
  const methodSums: Record<string, number> = {};
  activeExpenses.forEach((e) => {
    methodSums[e.paymentMethod] = (methodSums[e.paymentMethod] || 0) + e.amount;
  });
  const paymentChartData = Object.entries(methodSums).map(([name, value]) => ({
    name,
    value,
  }));

  // Chart 3: Monthly Trend Data
  const monthlyAgg: Record<string, number> = {};
  activeExpenses.forEach((e) => {
    const monthKey = e.date.substring(0, 7); // YYYY-MM
    monthlyAgg[monthKey] = (monthlyAgg[monthKey] || 0) + e.amount;
  });
  const trendData = Object.entries(monthlyAgg)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, amount]) => ({ month, amount }));

  // Budget progress
  const budgetUtilization = Math.round((monthTotal / (budget.overallLimit || 125000)) * 100);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-6 border border-slate-800 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
                Real-Time Financial Hub
              </p>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
              Welcome back, Suryansh Mehta
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              You've recorded <strong className="text-white">{activeExpenses.length} expenses</strong> this period.
              Monthly budget utilization is at{" "}
              <strong className={budgetUtilization > 90 ? "text-red-400 font-mono" : "text-emerald-400 font-mono"}>
                {budgetUtilization}%
              </strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenReceiptScan}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>AI Receipt Scan</span>
            </button>
            <button
              onClick={onOpenAiAdvisor}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600/30 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 transition-all"
            >
              <Bot className="w-4 h-4 text-blue-400" />
              <span>Flash AI Insights</span>
            </button>
            <button
              onClick={onOpenAddExpense}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Today */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400">Today's Expense</p>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-bold text-white font-mono tracking-tight">
            {formatCurrency(todayTotal)}
          </p>
          <p className="text-[11px] text-slate-500">{todayExpenses.length} transactions today</p>
        </div>

        {/* Metric 2: This Week */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400">This Week</p>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-bold text-white font-mono tracking-tight">
            {formatCurrency(weekTotal)}
          </p>
          <p className="text-[11px] text-slate-500">Last 7 calendar days</p>
        </div>

        {/* Metric 3: This Month */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400">This Month</p>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-bold text-white font-mono tracking-tight">
            {formatCurrency(monthTotal)}
          </p>
          <p className="text-[11px] text-slate-400">
            Budget Limit: <span className="font-mono">{formatCurrency(budget.overallLimit)}</span>
          </p>
        </div>

        {/* Metric 4: Average Daily Spending */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400">Daily Average</p>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-bold text-white font-mono tracking-tight">
            {formatCurrency(avgDaily)}
          </p>
          <p className="text-[11px] text-slate-500">Avg over {daysInMonth} days this month</p>
        </div>
      </div>

      {/* Secondary Metrics Row (Highest, Lowest, Most Used Payment, Top Category) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Highest Expense</p>
            <p className="text-xs font-bold text-slate-200 font-mono">
              {highestExp ? formatCurrency(highestExp.amount) : "₹0"}
            </p>
            <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
              {highestExp?.title || "N/A"}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <ArrowDownRight className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Lowest Expense</p>
            <p className="text-xs font-bold text-slate-200 font-mono">
              {lowestExp ? formatCurrency(lowestExp.amount) : "₹0"}
            </p>
            <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
              {lowestExp?.title || "N/A"}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Top Payment Mode</p>
            <p className="text-xs font-bold text-slate-200">{mostUsedMethod}</p>
            <p className="text-[10px] text-slate-500">{paymentCounts[mostUsedMethod] || 0} times used</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <PieChartIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Top Category</p>
            <p className="text-xs font-bold text-slate-200">{topCategory}</p>
            <p className="text-[10px] text-slate-500 font-mono">{formatCurrency(topCategoryAmount)}</p>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Monthly Trend Area Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Monthly Spending Trend</h3>
              <p className="text-xs text-slate-400">Expense accumulation over months</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
              Total: {formatCurrency(grandTotal)}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                  }}
                  formatter={(value: any) => [formatCurrency(Number(value)), "Spending"]}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Pie Chart */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Category Breakdown</h3>
            <p className="text-xs text-slate-400">Expense proportion this month</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                  }}
                  formatter={(val: any) => [formatCurrency(Number(val)), "Amount"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-2 border-t border-slate-800">
            {categoryChartData.slice(0, 6).map((c, idx) => (
              <div key={c.name} className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-slate-300 truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Expenses List Widget */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Latest recorded items for Suryansh Mehta</p>
          </div>
          <button
            onClick={onOpenAddExpense}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>+ Record New</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Title / Vendor</th>
                <th className="p-3">Category</th>
                <th className="p-3">Payment Method</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Receipt className="w-8 h-8 text-slate-600" />
                      <p className="text-sm font-semibold text-slate-300">Fresh Workspace — No expenses recorded yet</p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Click <strong className="text-emerald-400">"+ Add Expense"</strong> or <strong className="text-blue-400">"AI Receipt Scan"</strong> to record your first transaction!
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                activeExpenses.slice(0, 6).map((exp) => (
                  <tr
                    key={exp.id}
                    onClick={() => onSelectExpense(exp)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-mono text-slate-400">{exp.date}</td>
                    <td className="p-3 font-semibold text-slate-100">
                      {exp.title}
                      {exp.vendor && (
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {exp.vendor}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-blue-400 font-medium">{exp.paymentMethod}</span>
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-400 font-mono">
                      {formatCurrency(exp.amount, exp.currency)}
                    </td>
                    <td className="p-3 text-center">
                      <button className="px-2.5 py-1 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg">
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
