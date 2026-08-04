import { Expense, BudgetConfig, RecurringExpense, AccountBalances, Income } from "../types";

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const lastMonthStr = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

export const INITIAL_MOCK_EXPENSES: Expense[] = [];

export const DEFAULT_BALANCES: AccountBalances = {
  cashBalance: 1570,
  bankBalance: 6927.86,
  updatedAt: new Date().toISOString(),
};

export const INITIAL_INCOMES: Income[] = [];

export const DEFAULT_BUDGET: BudgetConfig = {
  id: "budget-curr",
  userId: "suryansh-mehta-001",
  month: `${currentYear}-${currentMonth}`,
  overallLimit: 125000,
  categoryLimits: {
    Food: 20000,
    Travel: 15000,
    Fuel: 10000,
    Shopping: 25000,
    Electronics: 30000,
    Subscriptions: 20000,
    Utilities: 10000,
    Investments: 30000,
    Office: 25000,
  },
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_RECURRING: RecurringExpense[] = [];
