export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "AED" | "CAD";

export type PaymentMethod =
  | "Cash"
  | "UPI"
  | "PhonePe"
  | "Google Pay"
  | "Paytm"
  | "Bank Transfer"
  | "Debit Card"
  | "Credit Card"
  | "Net Banking"
  | "Cheque"
  | "EMI"
  | "Wallet"
  | "Amazon Pay"
  | "BHIM"
  | "Razorpay"
  | "Cash on Delivery"
  | "Business Account"
  | "Personal Account"
  | "Other";

export interface BankDetails {
  bankName?: string;
  accountNumber?: string;
  transactionId?: string;
  referenceNumber?: string;
}

export interface UpiDetails {
  upiApp?: string;
  transactionId?: string;
  receiverName?: string;
}

export interface CardDetails {
  cardType?: "Visa" | "Mastercard" | "RuPay" | "American Express" | "Other";
  last4Digits?: string;
  bankName?: string;
}

export interface PaymentDetails {
  bank?: BankDetails;
  upi?: UpiDetails;
  card?: CardDetails;
  customMethodName?: string;
}

export type CategoryType =
  | "Food"
  | "Travel"
  | "Fuel"
  | "Shopping"
  | "Medical"
  | "Business"
  | "Office"
  | "Salary"
  | "Education"
  | "Entertainment"
  | "Subscriptions"
  | "Utilities"
  | "Internet"
  | "Electricity"
  | "Water"
  | "Rent"
  | "EMI"
  | "Insurance"
  | "Investments"
  | "Gifts"
  | "Donation"
  | "Clothing"
  | "Jewelry"
  | "Electronics"
  | "Maintenance"
  | "Vehicle"
  | "Household"
  | "Others";

export interface Expense {
  id: string;
  userId: string;
  title: string;
  description?: string;
  amount: number;
  currency: CurrencyCode;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  category: CategoryType | string;
  subCategory?: string;
  vendor?: string;
  location?: string;
  paymentMethod: PaymentMethod;
  paymentDetails?: PaymentDetails;
  receiptUrl?: string; // Base64 or uploaded URL
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  status: "paid" | "pending" | "cancelled" | "deleted";
  createdAt: string;
  updatedAt: string;
}

export interface CategoryBudget {
  category: string;
  limitAmount: number;
}

export interface BudgetConfig {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  overallLimit: number;
  categoryLimits: Record<string, number>;
  updatedAt: string;
}

export interface RecurringExpense {
  id: string;
  userId: string;
  title: string;
  amount: number;
  currency: CurrencyCode;
  frequency: "Monthly" | "Weekly" | "Quarterly" | "Yearly";
  category: string;
  paymentMethod: PaymentMethod;
  nextDueDate: string; // YYYY-MM-DD
  active: boolean;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  modelUsed?: string;
  thinkingText?: string;
  groundingChunks?: Array<{
    web?: {
      uri: string;
      title: string;
    };
  }>;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  currency: CurrencyCode;
  theme: "dark" | "light";
  monthlyBudgetLimit: number;
}

export interface AccountBalances {
  cashBalance: number;
  bankBalance: number;
  updatedAt: string;
}

export type IncomeSource =
  | "Salary"
  | "Client Payment"
  | "Business Income"
  | "Freelance"
  | "Investment Returns"
  | "Refund"
  | "Rental Income"
  | "Gift / Allowance"
  | "Cash Deposit"
  | "Other";

export interface Income {
  id: string;
  userId: string;
  title: string;
  amount: number;
  currency: CurrencyCode;
  date: string; // YYYY-MM-DD
  time?: string;
  destinationAccount: "Bank" | "Cash";
  source: IncomeSource | string;
  notes?: string;
  status: "received" | "deleted";
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilterState {
  searchQuery: string;
  dateRange: "all" | "today" | "yesterday" | "this_week" | "this_month" | "this_year" | "custom";
  startDate?: string;
  endDate?: string;
  category: string;
  paymentMethod: string;
  minAmount?: number;
  maxAmount?: number;
  vendor?: string;
  sortBy: "date_desc" | "date_asc" | "amount_desc" | "amount_asc" | "title_asc";
}
