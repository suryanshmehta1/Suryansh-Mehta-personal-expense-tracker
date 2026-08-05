import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar, NavTab } from "./components/Sidebar";
import { BottomNav } from "./components/BottomNav";
import { Dashboard } from "./components/Dashboard";
import { ExpenseHistory } from "./components/ExpenseHistory";
import { AddExpenseModal } from "./components/AddExpenseModal";
import { ReceiptOcrModal } from "./components/ReceiptOcrModal";
import { AddIncomeModal } from "./components/AddIncomeModal";
import { EditBalancesModal } from "./components/EditBalancesModal";
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
  AccountBalances,
  Income,
} from "./types";
import {
  INITIAL_MOCK_EXPENSES,
  DEFAULT_BUDGET,
  DEFAULT_RECURRING,
  DEFAULT_BALANCES,
  INITIAL_INCOMES,
} from "./lib/mockSeed";
import { SURYANSH_DEFAULT_USER, db, auth } from "./lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
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

  // Account Balances State
  const [balances, setBalances] = useState<AccountBalances>(() => {
    const saved = localStorage.getItem("mehta_balances_v2");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_BALANCES;
  });

  // Incomes State (Funds Received)
  const [incomes, setIncomes] = useState<Income[]>(() => {
    const saved = localStorage.getItem("mehta_incomes_v2");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_INCOMES;
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
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isEditBalancesOpen, setIsEditBalancesOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("mehta_expenses_v2", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("mehta_balances_v2", JSON.stringify(balances));
  }, [balances]);

  useEffect(() => {
    localStorage.setItem("mehta_incomes_v2", JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem("mehta_budget_v2", JSON.stringify(budget));
  }, [budget]);

  useEffect(() => {
    localStorage.setItem("mehta_recurring_v2", JSON.stringify(recurringList));
  }, [recurringList]);

  // Firestore real-time synchronization across devices
  useEffect(() => {
    const uid = user.uid;
    let unsubscribeExpenses: () => void;
    let unsubscribeIncomes: () => void;
    let unsubscribeBalances: () => void;

    try {
      // 1. Real-time Expenses Listener
      const expensesCol = collection(db, "users", uid, "expenses");
      unsubscribeExpenses = onSnapshot(
        expensesCol,
        async (snapshot) => {
          if (!snapshot.empty) {
            const loaded: Expense[] = [];
            snapshot.forEach((doc) => {
              loaded.push(doc.data() as Expense);
            });
            // Sort by date/time descending
            loaded.sort((a, b) => new Date(`${b.date}T${b.time || "00:00"}`).getTime() - new Date(`${a.date}T${a.time || "00:00"}`).getTime());
            setExpenses(loaded);
          } else {
            // Seed initial default expenses to Firestore if empty
            for (const exp of INITIAL_MOCK_EXPENSES) {
              try {
                await setDoc(doc(db, "users", uid, "expenses", exp.id), exp);
              } catch (e) {
                console.log("Error seeding initial expense:", e);
              }
            }
            setExpenses(INITIAL_MOCK_EXPENSES);
          }
        },
        (err) => console.log("Firestore expenses subscription error:", err)
      );

      // 2. Real-time Incomes Listener
      const incomesCol = collection(db, "users", uid, "incomes");
      unsubscribeIncomes = onSnapshot(
        incomesCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const loadedIncomes: Income[] = [];
            snapshot.forEach((doc) => {
              loadedIncomes.push(doc.data() as Income);
            });
            loadedIncomes.sort((a, b) => new Date(`${b.date}T${b.time || "00:00"}`).getTime() - new Date(`${a.date}T${a.time || "00:00"}`).getTime());
            setIncomes(loadedIncomes);
          }
        },
        (err) => console.log("Firestore incomes subscription error:", err)
      );

      // 3. Real-time Account Balances Listener
      const balancesDocRef = doc(db, "users", uid, "account", "balances");
      unsubscribeBalances = onSnapshot(
        balancesDocRef,
        async (docSnap) => {
          if (docSnap.exists()) {
            setBalances(docSnap.data() as AccountBalances);
          } else {
            // Seed initial balances to Firestore (₹1,570 Cash & ₹6,927.86 Bank)
            const initial: AccountBalances = DEFAULT_BALANCES;
            try {
              await setDoc(balancesDocRef, initial);
              setBalances(initial);
            } catch (e) {
              console.log("Error seeding initial balances:", e);
            }
          }
        },
        (err) => console.log("Firestore balances subscription error:", err)
      );
    } catch (err) {
      console.log("Firestore subscription setup fallback:", err);
    }

    return () => {
      if (unsubscribeExpenses) unsubscribeExpenses();
      if (unsubscribeIncomes) unsubscribeIncomes();
      if (unsubscribeBalances) unsubscribeBalances();
    };
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

      // Deduct from Cash or Bank balance automatically
      let updatedBalances: AccountBalances | null = null;
      setBalances((prev) => {
        if (expenseData.paymentMethod === "Cash") {
          updatedBalances = {
            ...prev,
            cashBalance: Math.max(0, prev.cashBalance - expenseData.amount),
            updatedAt: nowIso,
          };
        } else {
          updatedBalances = {
            ...prev,
            bankBalance: Math.max(0, prev.bankBalance - expenseData.amount),
            updatedAt: nowIso,
          };
        }
        return updatedBalances;
      });

      try {
        await setDoc(doc(db, "users", user.uid, "expenses", newExp.id), newExp);
        if (updatedBalances) {
          await setDoc(doc(db, "users", user.uid, "account", "balances"), updatedBalances);
        }
      } catch (e) {
        console.log("Firestore sync warning:", e);
      }
    }
  };

  // Handle Add Income (Received Funds)
  const handleAddIncome = async (income: Income, autoUpdateBalance: boolean) => {
    setIncomes((prev) => [income, ...prev]);

    let updatedBalances: AccountBalances | null = null;
    if (autoUpdateBalance) {
      setBalances((prev) => {
        if (income.destinationAccount === "Bank") {
          updatedBalances = {
            ...prev,
            bankBalance: prev.bankBalance + income.amount,
            updatedAt: new Date().toISOString(),
          };
        } else {
          updatedBalances = {
            ...prev,
            cashBalance: prev.cashBalance + income.amount,
            updatedAt: new Date().toISOString(),
          };
        }
        return updatedBalances;
      });
    }

    try {
      await setDoc(doc(db, "users", user.uid, "incomes", income.id), income);
      if (updatedBalances) {
        await setDoc(doc(db, "users", user.uid, "account", "balances"), updatedBalances);
      }
    } catch (e) {
      console.log("Firestore income sync warning:", e);
    }
  };

  // Handle Direct Balances Edit
  const handleSaveBalances = async (newBalances: AccountBalances) => {
    setBalances(newBalances);
    try {
      await setDoc(doc(db, "users", user.uid, "account", "balances"), newBalances);
    } catch (e) {
      console.log("Firestore balances sync warning:", e);
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

  // Handle Reimbursement (Money Returned)
  const handleMarkReimbursed = async (exp: Expense) => {
    const updatedExp: Expense = {
      ...exp,
      isReimbursed: true,
      reimbursedAt: new Date().toISOString(),
    };

    setExpenses((prev) =>
      prev.map((e) => (e.id === exp.id ? updatedExp : e))
    );

    // Automatically credit the money back to user balance
    let updatedBalances: AccountBalances | null = null;
    setBalances((prev) => {
      const returnAmt = Number(exp.amount || 0);
      if (exp.paymentMethod === "Cash") {
        updatedBalances = {
          ...prev,
          cashBalance: prev.cashBalance + returnAmt,
          updatedAt: new Date().toISOString(),
        };
      } else {
        updatedBalances = {
          ...prev,
          bankBalance: prev.bankBalance + returnAmt,
          updatedAt: new Date().toISOString(),
        };
      }
      return updatedBalances;
    });

    try {
      await setDoc(doc(db, "users", user.uid, "expenses", exp.id), updatedExp);
      if (updatedBalances) {
        await setDoc(doc(db, "users", user.uid, "account", "balances"), updatedBalances);
      }
    } catch (e) {
      console.log("Firestore reimbursement sync warning:", e);
    }
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
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

        {/* Main Content Area with Mobile Bottom Nav Clearance */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto pb-28 md:pb-8">
          {activeTab === "dashboard" && (
            <Dashboard
              expenses={expenses}
              budget={budget}
              balances={balances}
              incomes={incomes}
              onOpenAddExpense={() => {
                setEditingExpense(null);
                setIsAddModalOpen(true);
              }}
              onOpenAddIncome={() => setIsAddIncomeOpen(true)}
              onOpenEditBalances={() => setIsEditBalancesOpen(true)}
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
              onMarkReimbursed={handleMarkReimbursed}
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
            <GoogleSheetsExportView
              expenses={expenses}
              incomes={incomes}
              balances={balances}
            />
          )}

          {activeTab === "ai_advisor" && <FlashAiAdvisor expenses={expenses} />}

          {activeTab === "settings" && (
            <SettingsView
              user={user}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
              expenses={expenses}
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
        onOpenScanReceipt={() => setIsOcrModalOpen(true)}
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

      {/* Add Received Funds / Income Modal */}
      <AddIncomeModal
        isOpen={isAddIncomeOpen}
        onClose={() => setIsAddIncomeOpen(false)}
        onAddIncome={handleAddIncome}
        currency={user.currency}
      />

      {/* Edit Balances Modal */}
      <EditBalancesModal
        isOpen={isEditBalancesOpen}
        onClose={() => setIsEditBalancesOpen(false)}
        balances={balances}
        onSaveBalances={handleSaveBalances}
        currency={user.currency}
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
