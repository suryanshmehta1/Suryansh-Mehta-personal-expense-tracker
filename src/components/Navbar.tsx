import React from "react";
import {
  Wallet,
  PlusCircle,
  Bot,
  FileSpreadsheet,
  Sun,
  Moon,
  ShieldCheck,
  UserCheck,
  LogOut,
  Sparkles,
} from "lucide-react";
import { UserProfile } from "../types";

interface NavbarProps {
  user: UserProfile | null;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onOpenAddExpense: () => void;
  onOpenAiAdvisor: () => void;
  onOpenSheetsSync: () => void;
  onOpenReceiptScan: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  theme,
  onToggleTheme,
  onOpenAddExpense,
  onOpenAiAdvisor,
  onOpenSheetsSync,
  onOpenReceiptScan,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-slate-900/80 border-b border-slate-800 text-slate-100 px-4 lg:px-8 py-3.5 flex items-center justify-between transition-colors">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white font-sans">
              Mehta Expense Tracker
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Pro
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Smart Personal Expense Recording & Financial Tracking System
          </p>
        </div>
      </div>

      {/* Center / Right Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* OCR Receipt Scanner Button */}
        <button
          onClick={onOpenReceiptScan}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          title="Scan receipt with Gemini AI Vision"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Scan Receipt</span>
        </button>

        {/* Google Sheets Sync Button */}
        <button
          onClick={onOpenSheetsSync}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Google Sheets</span>
        </button>

        {/* AI Advisor Button */}
        <button
          onClick={onOpenAiAdvisor}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/20 transition-all"
        >
          <Bot className="w-4 h-4 text-emerald-300" />
          <span className="hidden xs:inline">Flash AI</span>
        </button>

        {/* Quick Add Expense */}
        <button
          onClick={onOpenAddExpense}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Expense</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          title="Toggle Theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-300" />
          )}
        </button>

        {/* User Profile Badge */}
        <div className="pl-2 border-l border-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-blue-500/30 bg-slate-800 flex items-center justify-center">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCheck className="w-4 h-4 text-blue-400" />
            )}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-none">
              {user?.displayName || "Suryansh Mehta"}
            </p>
            <p className="text-[10px] text-emerald-400 leading-tight mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5" /> Verified Account
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
