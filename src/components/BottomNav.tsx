import React from "react";
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  BarChart3,
  Bot,
  FileSpreadsheet,
} from "lucide-react";
import { NavTab } from "./Sidebar";

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenAddExpense: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAddExpense,
}) => {
  const navItems = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "history", label: "History", icon: Receipt },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "ai_advisor", label: "Flash AI", icon: Bot },
    { id: "reports", label: "Sheets", icon: FileSpreadsheet },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-3 py-2 flex items-center justify-around">
      {navItems.slice(0, 2).map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id as NavTab)}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
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
        className="-mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 border-2 border-slate-900 active:scale-95 transition-transform"
        aria-label="Add Expense"
      >
        <PlusCircle className="w-6 h-6 text-white" />
      </button>

      {navItems.slice(2).map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id as NavTab)}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isActive ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
