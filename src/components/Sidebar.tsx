import React from "react";
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  BarChart3,
  PieChart,
  Repeat,
  FileSpreadsheet,
  Bot,
  Settings,
  Sparkles,
} from "lucide-react";

export type NavTab =
  | "dashboard"
  | "history"
  | "analytics"
  | "budgets"
  | "recurring"
  | "reports"
  | "ai_advisor"
  | "settings";

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenAddExpense: () => void;
  onOpenScanReceipt: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenAddExpense,
  onOpenScanReceipt,
}) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "history", label: "Expense Records", icon: Receipt },
    { id: "analytics", label: "Analytics & Trends", icon: BarChart3 },
    { id: "budgets", label: "Monthly Budgets", icon: PieChart },
    { id: "recurring", label: "Recurring Bills", icon: Repeat },
    { id: "reports", label: "Google Sheets & Reports", icon: FileSpreadsheet },
    { id: "ai_advisor", label: "Flash AI Advisor", icon: Bot, highlight: true },
    { id: "settings", label: "Settings & Backup", icon: Settings },
  ];

  return (
    <aside className="w-64 hidden md:flex flex-col border-r border-slate-800 bg-slate-900/90 text-slate-300 min-h-[calc(100vh-61px)] p-4 shrink-0 justify-between">
      <div className="space-y-6">
        {/* Quick Action Box */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/60 space-y-2.5">
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Quick Actions
          </p>
          <button
            onClick={onOpenAddExpense}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record New Expense</span>
          </button>
          <button
            onClick={onOpenScanReceipt}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI Receipt OCR</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Navigation
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as NavTab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? "text-blue-400"
                      : item.highlight
                      ? "text-emerald-400"
                      : "text-slate-400"
                  }`}
                />
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Account Info & Footer */}
      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-slate-400 text-[11px] space-y-1.5 shadow-inner">
        <div className="flex items-center justify-between">
          <p className="font-bold text-slate-200">Suryansh Mehta</p>
          <span className="text-[10px] text-emerald-400 font-mono">INR (₹)</span>
        </div>
        <p className="text-emerald-400 text-[10px] flex items-center gap-1 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Firestore Sync Connected
        </p>
        <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-medium text-center">
          Designed & Developed by <strong className="text-slate-200">Suryansh Mehta</strong>
        </div>
      </div>
    </aside>
  );
};
