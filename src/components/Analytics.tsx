import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  PieChart as PieIcon,
  Store,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Smartphone,
  Wallet,
} from "lucide-react";
import { Expense } from "../types";
import { formatCurrency } from "../lib/exportUtils";

interface AnalyticsProps {
  expenses: Expense[];
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
  "#14B8A6",
  "#A855F7",
];

export const Analytics: React.FC<AnalyticsProps> = ({ expenses }) => {
  const activeExpenses = expenses.filter((e) => e.status !== "deleted");

  // Totals & Averages
  const totalAmount = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCount = activeExpenses.length;
  const avgExpense = totalCount > 0 ? totalAmount / totalCount : 0;

  const sortedAmounts = [...activeExpenses].sort((a, b) => b.amount - a.amount);
  const largest = sortedAmounts[0];
  const smallest = sortedAmounts[sortedAmounts.length - 1];

  // Cash vs Digital Ratio
  let cashAmount = 0;
  let digitalAmount = 0;
  activeExpenses.forEach((e) => {
    if (e.paymentMethod === "Cash") {
      cashAmount += e.amount;
    } else {
      digitalAmount += e.amount;
    }
  });

  const cashVsDigitalData = [
    { name: "Digital (UPI / Cards / Bank)", value: digitalAmount },
    { name: "Physical Cash", value: cashAmount },
  ];

  // Category Breakdown Data
  const categorySums: Record<string, number> = {};
  activeExpenses.forEach((e) => {
    categorySums[e.category] = (categorySums[e.category] || 0) + e.amount;
  });
  const categoryChartData = Object.entries(categorySums)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Payment Method Breakdown Data
  const paymentSums: Record<string, number> = {};
  activeExpenses.forEach((e) => {
    paymentSums[e.paymentMethod] = (paymentSums[e.paymentMethod] || 0) + e.amount;
  });
  const paymentChartData = Object.entries(paymentSums)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Vendor Breakdown Data
  const vendorSums: Record<string, number> = {};
  activeExpenses.forEach((e) => {
    if (e.vendor) {
      vendorSums[e.vendor] = (vendorSums[e.vendor] || 0) + e.amount;
    }
  });
  const topVendorsData = Object.entries(vendorSums)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Savings / Spending Monthly Trend
  const monthlyAgg: Record<string, number> = {};
  activeExpenses.forEach((e) => {
    const monthKey = e.date.substring(0, 7);
    monthlyAgg[monthKey] = (monthlyAgg[monthKey] || 0) + e.amount;
  });
  const monthlyData = Object.entries(monthlyAgg)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, amount]) => ({ month, amount }));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Interactive Financial Analytics</h2>
        <p className="text-xs text-slate-400">
          In-depth spending breakdown, cash vs digital ratios, and vendor trends for Suryansh Mehta
        </p>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
          <p className="text-[11px] text-slate-400 font-medium">Average Expense per Item</p>
          <p className="text-lg font-bold text-white font-mono">{formatCurrency(avgExpense)}</p>
          <p className="text-[10px] text-slate-500">Across {totalCount} total transactions</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
          <p className="text-[11px] text-slate-400 font-medium">Largest Single Outflow</p>
          <p className="text-lg font-bold text-red-400 font-mono">
            {largest ? formatCurrency(largest.amount) : "₹0"}
          </p>
          <p className="text-[10px] text-slate-400 truncate">{largest?.title || "N/A"}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
          <p className="text-[11px] text-slate-400 font-medium">Smallest Outflow</p>
          <p className="text-lg font-bold text-emerald-400 font-mono">
            {smallest ? formatCurrency(smallest.amount) : "₹0"}
          </p>
          <p className="text-[10px] text-slate-400 truncate">{smallest?.title || "N/A"}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
          <p className="text-[11px] text-slate-400 font-medium">Digital vs Cash Share</p>
          <p className="text-lg font-bold text-blue-400 font-mono">
            {Math.round((digitalAmount / (totalAmount || 1)) * 100)}% Digital
          </p>
          <p className="text-[10px] text-slate-500">
            Cash: {formatCurrency(cashAmount)}
          </p>
        </div>
      </div>

      {/* Charts Row 1: Monthly Bar Chart & Cash vs Digital Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Monthly Expense Accumulation</h3>
            <span className="text-xs font-mono text-slate-400">Recorded Months</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                  }}
                  formatter={(val: any) => [formatCurrency(Number(val)), "Amount"]}
                />
                <Bar dataKey="amount" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Cash vs Digital Split</h3>
            <p className="text-xs text-slate-400">Payment channel safety assessment</p>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cashVsDigitalData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#F59E0B" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                  }}
                  formatter={(val: any) => [formatCurrency(Number(val)), "Spent"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Digital Channels
              </span>
              <strong className="font-mono">{formatCurrency(digitalAmount)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Cash Physical
              </span>
              <strong className="font-mono">{formatCurrency(cashAmount)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Payment Method Breakdown & Top Vendor Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-white">Payment Method Analytics</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentChartData} layout="vertical">
                <XAxis type="number" stroke="#64748B" fontSize={11} hide />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={11} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                  }}
                  formatter={(val: any) => [formatCurrency(Number(val)), "Volume"]}
                />
                <Bar dataKey="value" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-white">Top Vendor Outflows</h3>
          <div className="space-y-2.5">
            {topVendorsData.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">No vendor data logged yet.</p>
            ) : (
              topVendorsData.map((v, i) => {
                const percentage = Math.round((v.value / (totalAmount || 1)) * 100);
                return (
                  <div key={v.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">
                        {i + 1}. {v.name}
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {formatCurrency(v.value)} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
