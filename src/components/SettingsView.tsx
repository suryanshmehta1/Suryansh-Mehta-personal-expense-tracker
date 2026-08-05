import React, { useState } from "react";
import {
  Settings,
  User,
  Moon,
  Sun,
  Database,
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  Check,
} from "lucide-react";
import { UserProfile, CurrencyCode, Expense } from "../types";

interface SettingsViewProps {
  user: UserProfile;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  expenses: Expense[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  theme,
  onToggleTheme,
  onUpdateUser,
  expenses,
}) => {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [currency, setCurrency] = useState<CurrencyCode>(user.currency || "INR");
  const [savedMsg, setSavedMsg] = useState("");

  const handleSaveProfile = () => {
    onUpdateUser({ displayName, currency });
    setSavedMsg("Settings saved successfully!");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  const handleBackupJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(expenses, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `Mehta_Tracker_Backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">System & Profile Settings</h2>
        <p className="text-xs text-slate-400">
          Preferences, currency default, data backup, and database options
        </p>
      </div>

      {savedMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* User Profile Box */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" /> User Profile Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Default Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white"
            >
              <option value="INR">INR (₹ Rupees)</option>
              <option value="USD">USD ($ Dollars)</option>
              <option value="EUR">EUR (€ Euros)</option>
              <option value="GBP">GBP (£ Pounds)</option>
              <option value="AED">AED (Dirhams)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20"
        >
          Save Changes
        </button>
      </div>

      {/* Appearance & Theme */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
        <h3 className="text-sm font-bold text-white">Appearance & Theme</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-200">Dark / Light Mode</p>
            <p className="text-[11px] text-slate-400">Current mode: {theme}</p>
          </div>
          <button
            onClick={onToggleTheme}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            <span>Toggle Theme</span>
          </button>
        </div>
      </div>

      {/* Backup & Database Management */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" /> Data Backup & Security
        </h3>

        <div className="space-y-3 text-xs">
          <p className="text-slate-400">
            Your expense, income, and account balance data is safely persisted in Google Cloud Firestore.
            You can export a complete JSON copy of your records anytime.
          </p>

          <button
            onClick={handleBackupJSON}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Download Full JSON Backup</span>
          </button>
        </div>
      </div>

      {/* Developer Footer */}
      <footer className="pt-6 pb-2 text-center text-xs text-slate-400 border-t border-slate-800/80 font-medium">
        Designed & Developed by <span className="text-slate-200 font-bold">Suryansh Mehta</span>
      </footer>
    </div>
  );
};
