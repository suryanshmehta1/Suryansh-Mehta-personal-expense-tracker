import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar, NavTab } from "./components/Sidebar";
import { BottomNav } from "./components/BottomNav";
import { Dashboard } from "./components/Dashboard";
import { ExpenseHistory } from "./components/ExpenseHistory";
import { AddExpenseModal } from "./components/AddExpenseModal";
import { ReceiptOcrModal } from "./components/ReceiptOcrModal";
import { Analytics } from "./components/Analytics";
import { BudgetsView } from "./components/BudgetsView";
import { RecurringExpensesView } from "./components/RecurringExpensesView";
import { FlashAiAdvisor } from "./components/FlashAiAdvisor";
import { GoogleSheetsExportView } from "./components/GoogleSheetsExportView";
import { SettingsView } from "./components/SettingsView";

import {
  Expense,
  BudgetConfig,
  RecurringExpense,
  UserProfile,
} from "./types";
import {
  INITIAL_MOCK_EXPENSES,
  DEFAULT_BUDGET,
  DEFAULT_RECURRING,
} from "./lib/mockSeed";
import { SURYANSH_DEFAULT_USER, db, auth } from "./lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

export default function App() {
  const [user, setUser] = useState<UserProfile>(SURYANSH_DEFAULT_USER);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");

  // Expenses State
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem("mehta_expenses_v2");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_MOCK_EXPENSES;
  });

  // Budget State
  const [budget, setBudget] = useState<BudgetConfig>(() => {
    const saved = localStorage.getItem("mehta_budget_v2");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_BUDGET;
  });

  // Recurring Expenses State
  const [recurringList, setRecurringList] = useState<RecurringExpense[]>(() => {
    const saved = localStorage.getItem("mehta_recurring_v2");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_RECURRING;
  });

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("mehta_expenses_v2", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("mehta_budget_v2", JSON.stringify(budget));
  }, [budget]);

  useEffect(() => {
    localStorage.setItem("mehta_recurring_v2", JSON.stringify(recurringList));
  }, [recurringList]);

  // Firestore initial load & sync attempt
  useEffect(() => {
    async function loadFirestoreData() {
      try {
        const uid = user.uid;
        const colRef = collection(db, "users", uid, "expenses");
        const snapshot = await getDocs(colRef);
        if (!snapshot.empty) {
          const loaded: Expense[] = [];
          snapshot.forEach((doc) => {
            loaded.push(doc.data() as Expense);
          });
          setExpenses(loaded);
        }
      } catch (err) {
        console.log("Firestore load fallback to local state:", err);
      }
    }
    loadFirestoreData();
  }, [user.uid]);

  // Handle Save Expense (Add or Edit)
  const handleSaveExpense = async (
    expenseData: Omit<Expense, "id" | "userId" | "createdAt" | "updatedAt">
  ) => {
    const nowIso = new Date().toISOString();

    if (editingExpense) {
      // Edit mode
      const updated: Expense = {
        ...editingExpense,
        ...expenseData,
        updatedAt: nowIso,
      };

      setExpenses((prev) => prev.map((e) => (e.id === editingExpense.id ? updated : e)));
      setEditingExpense(null);

      try {
        await setDoc(doc(db, "users", user.uid, "expenses", updated.id), updated);
      } catch (e) {
        console.log("Firestore sync warning:", e);
      }
    } else {
      // New Expense
      const newExp: Expense = {
        id: `exp-${Date.now()}`,
        userId: user.uid,
        ...expenseData,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      setExpenses((prev) => [newExp, ...prev]);

      try {
        await setDoc(doc(db, "users", user.uid, "expenses", newExp.id), newExp);
      } catch (e) {
        console.log("Firestore sync warning:", e);
      }
    }
  };

  // Handle Soft Delete
  const handleSoftDeleteExpense = async (id: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "deleted" } : e))
    );

    try {
      await deleteDoc(doc(db, "users", user.uid, "expenses", id));
    } catch (e) {
      console.log("Firestore delete warning:", e);
    }
  };

  // Handle Restore
  const handleRestoreExpense = (id: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "paid" } : e))
    );
  };

  // Handle Receipt OCR Auto Populate
  const handleReceiptExtracted = (data: Partial<Expense>) => {
    setEditingExpense(null);
    setIsAddModalOpen(true);
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleResetSeedData = () => {
    setExpenses([]);
    setBudget(DEFAULT_BUDGET);
    setRecurringList([]);
    localStorage.removeItem("mehta_expenses_v1");
    localStorage.removeItem("mehta_budget_v1");
    localStorage.removeItem("mehta_recurring_v1");
    localStorage.removeItem("mehta_expenses_v2");
    localStorage.removeItem("mehta_budget_v2");
    localStorage.removeItem("mehta_recurring_v2");
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"
      }`}
    >
      {/* Top Navbar */}
      <Navbar
        user={user}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenAddExpense={() => {
          setEditingExpense(null);
          setIsAddModalOpen(true);
        }}
        onOpenAiAdvisor={() => setActiveTab("ai_advisor")}
        onOpenSheetsSync={() => setActiveTab("reports")}
        onOpenReceiptScan={() => setIsOcrModalOpen(true)}
      />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          onOpenAddExpense={() => {
            setEditingExpense(null);
            setIsAddModalOpen(true);
          }}
          onOpenScanReceipt={() => setIsOcrModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === "dashboard" && (
            <Dashboard
              expenses={expenses}
              budget={budget}
              onOpenAddExpense={() => {
                setEditingExpense(null);
                setIsAddModalOpen(true);
              }}
              onOpenAiAdvisor={() => setActiveTab("ai_advisor")}
              onOpenReceiptScan={() => setIsOcrModalOpen(true)}
              onSelectExpense={(exp) => {
                setEditingExpense(exp);
                setIsAddModalOpen(true);
              }}
            />
          )}

          {activeTab === "history" && (
            <ExpenseHistory
              expenses={expenses}
              onEditExpense={(exp) => {
                setEditingExpense(exp);
                setIsAddModalOpen(true);
              }}
              onSoftDeleteExpense={handleSoftDeleteExpense}
              onRestoreExpense={handleRestoreExpense}
              onOpenAddExpense={() => {
                setEditingExpense(null);
                setIsAddModalOpen(true);
              }}
            />
          )}

          {activeTab === "analytics" && <Analytics expenses={expenses} />}

          {activeTab === "budgets" && (
            <BudgetsView
              budget={budget}
              expenses={expenses}
              onUpdateBudget={(b) => setBudget(b)}
            />
          )}

          {activeTab === "recurring" && (
            <RecurringExpensesView
              recurringList={recurringList}
              onAddRecurring={(item) =>
                setRecurringList((prev) => [
                  { id: `rec-${Date.now()}`, userId: user.uid, ...item },
                  ...prev,
                ])
              }
              onToggleActive={(id) =>
                setRecurringList((prev) =>
                  prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
                )
              }
            />
          )}

          {activeTab === "reports" && (
            <GoogleSheetsExportView expenses={expenses} />
          )}

          {activeTab === "ai_advisor" && <FlashAiAdvisor expenses={expenses} />}

          {activeTab === "settings" && (
            <SettingsView
              user={user}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
              expenses={expenses}
              onResetSeedData={handleResetSeedData}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenAddExpense={() => {
          setEditingExpense(null);
          setIsAddModalOpen(true);
        }}
      />

      {/* Add / Edit Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingExpense(null);
        }}
        onSaveExpense={handleSaveExpense}
        initialExpense={editingExpense}
        onScanReceiptRequest={() => {
          setIsAddModalOpen(false);
          setIsOcrModalOpen(true);
        }}
      />

      {/* Receipt OCR Scanner Modal */}
      <ReceiptOcrModal
        isOpen={isOcrModalOpen}
        onClose={() => setIsOcrModalOpen(false)}
        onReceiptExtracted={handleReceiptExtracted}
      />
    </div>
  );
}
