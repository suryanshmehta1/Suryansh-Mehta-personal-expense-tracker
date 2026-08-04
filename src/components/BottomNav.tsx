import React, { useState } from "react";
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  BarChart3,
  Bot,
  FileSpreadsheet,
  PieChart,
  Repeat,
  Settings,
  MoreHorizontal,
  X,
  Sparkles,
} from "lucide-react";
import { NavTab } from "./Sidebar";

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenAddExpense: () => void;
  onOpenScanReceipt?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAddExpense,
  onOpenScanReceipt,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const primaryItems = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "history", label: "Records", icon: Receipt },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "ai_advisor", label: "Flash AI", icon: Bot },
  ];

  const allItems = [
    { id: "dashboard", label: "Dashboard Home", icon: LayoutDashboard, desc: "Overview & quick stats" },
    { id: "history", label: "Expense Records", icon: Receipt, desc: "Search & filter transactions" },
    { id: "analytics", label: "Analytics & Trends", icon: BarChart3, desc: "Charts & spending graphs" },
    { id: "budgets", label: "Monthly Budgets", icon: PieChart, desc: "Category limits & guardrails" },
    { id: "recurring", label: "Recurring Bills", icon: Repeat, desc: "Subscriptions & automated dues" },
    { id: "reports", label: "Google Sheets Export", icon: FileSpreadsheet, desc: "Export to Excel, PDF & Sheets" },
    { id: "ai_advisor", label: "Flash AI Advisor", icon: Bot, desc: "AI optimization & price check" },
    { id: "settings", label: "Settings & Backup", icon: Settings, desc: "System preferences & data" },
  ];

  const handleSelectTab = (tab: NavTab) => {
    onTabChange(tab);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* Mobile More Drawer Sheet */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">All App Sections</h3>
                <p className="text-xs text-slate-400">Navigate to any feature on mobile</p>
              </div>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions in Sheet */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenAddExpense();
                }}
                className="flex items-center justify-center gap-2 py-3 px-3 text-xs font-bold rounded-xl bg-emerald-600 text-white shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add Expense</span>
              </button>
              {onOpenScanReceipt && (
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenScanReceipt();
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-3 text-xs font-semibold rounded-xl bg-slate-800 text-blue-400 border border-slate-700"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>AI OCR Scan</span>
                </button>
              )}
            </div>

            {/* Grid of Navigation Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {allItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id as NavTab)}
                    className={`flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${
                      isActive
                        ? "bg-blue-600/20 border border-blue-500/40 text-blue-300"
                        : "bg-slate-950/60 border border-slate-800/80 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{item.label}</p>
                      <p className="text-[10px] text-slate-400">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 flex items-center justify-around">
        {primaryItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id as NavTab)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 min-h-[44px] justify-center text-[10px] font-medium transition-colors ${
                isActive ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Floating Center Add Button */}
        <button
          onClick={onOpenAddExpense}
          className="-mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 border-2 border-slate-900 active:scale-95 transition-transform shrink-0"
          aria-label="Add Expense"
        >
          <PlusCircle className="w-6 h-6 text-white" />
        </button>

        {primaryItems.slice(2).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id as NavTab)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 min-h-[44px] justify-center text-[10px] font-medium transition-colors ${
                isActive ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* More Menu Trigger */}
        <button
          onClick={() => setShowMoreMenu(true)}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 min-h-[44px] justify-center text-[10px] font-medium transition-colors ${
            showMoreMenu ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span>More</span>
        </button>
      </div>
    </>
  );
};

