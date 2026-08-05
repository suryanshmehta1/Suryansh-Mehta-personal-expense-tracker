import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit2,
  Eye,
  RotateCcw,
  Download,
  Calendar,
  CreditCard,
  Tag,
  MapPin,
  Store,
  DollarSign,
  FileText,
  X,
  CheckCircle2,
  Share2,
  Check,
} from "lucide-react";
import { Expense, SearchFilterState, PaymentMethod } from "../types";
import { formatCurrency, exportToCSV } from "../lib/exportUtils";

interface ExpenseHistoryProps {
  expenses: Expense[];
  onEditExpense: (exp: Expense) => void;
  onSoftDeleteExpense: (expId: string) => void;
  onRestoreExpense: (expId: string) => void;
  onOpenAddExpense: () => void;
  onMarkReimbursed?: (exp: Expense) => void;
}

export const ExpenseHistory: React.FC<ExpenseHistoryProps> = ({
  expenses,
  onEditExpense,
  onSoftDeleteExpense,
  onRestoreExpense,
  onOpenAddExpense,
  onMarkReimbursed,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<SearchFilterState["dateRange"]>("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState("all");
  const [minAmount, setMinAmount] = useState<number | "">("");
  const [maxAmount, setMaxAmount] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<SearchFilterState["sortBy"]>("date_desc");

  // Selected expense for detailed modal
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);

  // Soft deleted undo notification queue
  const [lastDeletedId, setLastDeletedId] = useState<string | null>(null);

  // Filter logic
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const currentYearStr = `${now.getFullYear()}`;

    return expenses.filter((e) => {
      // Don't show permanently deleted unless in recycle state
      if (e.status === "deleted") return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const txnId =
          e.paymentDetails?.bank?.transactionId ||
          e.paymentDetails?.upi?.transactionId ||
          "";
        const matches =
          e.title.toLowerCase().includes(q) ||
          e.amount.toString().includes(q) ||
          e.date.includes(q) ||
          (e.vendor && e.vendor.toLowerCase().includes(q)) ||
          e.category.toLowerCase().includes(q) ||
          e.paymentMethod.toLowerCase().includes(q) ||
          (e.notes && e.notes.toLowerCase().includes(q)) ||
          txnId.toLowerCase().includes(q);

        if (!matches) return false;
      }

      // Date Range Filter
      if (dateRange === "today" && e.date !== todayStr) return false;
      if (dateRange === "yesterday" && e.date !== yesterdayStr) return false;
      if (dateRange === "this_month" && !e.date.startsWith(currentMonthStr)) return false;
      if (dateRange === "this_year" && !e.date.startsWith(currentYearStr)) return false;

      // Category Filter
      if (selectedCategory !== "all" && e.category !== selectedCategory) return false;

      // Payment Method Filter
      if (
        selectedPaymentMethod !== "all" &&
        e.paymentMethod !== selectedPaymentMethod
      )
        return false;

      // Vendor Filter
      if (selectedVendor !== "all" && e.vendor !== selectedVendor) return false;

      // Min / Max Amount
      if (minAmount !== "" && e.amount < Number(minAmount)) return false;
      if (maxAmount !== "" && e.amount > Number(maxAmount)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "date_desc") return b.date.localeCompare(a.date);
      if (sortBy === "date_asc") return a.date.localeCompare(b.date);
      if (sortBy === "amount_desc") return b.amount - a.amount;
      if (sortBy === "amount_asc") return a.amount - b.amount;
      if (sortBy === "title_asc") return a.title.localeCompare(b.title);
      return 0;
    });
  }, [
    expenses,
    searchQuery,
    dateRange,
    selectedCategory,
    selectedPaymentMethod,
    selectedVendor,
    minAmount,
    maxAmount,
    sortBy,
  ]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to soft delete this expense record?")) {
      onSoftDeleteExpense(id);
      setLastDeletedId(id);
      setTimeout(() => {
        setLastDeletedId(null);
      }, 7000); // 7s undo window
    }
  };

  const categories = Array.from(new Set(expenses.map((e) => e.category)));
  const vendors = Array.from(new Set(expenses.map((e) => e.vendor).filter(Boolean)));
  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Expense Records & Search</h2>
          <p className="text-xs text-slate-400">
            Browse, search, filter, and audit all recorded expenses for Suryansh Mehta
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(filteredExpenses, "Mehta_Expenses_Filtered.csv")}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all"
          >
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Title, Vendor, Amount, Transaction ID, Category, Notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          {/* Date Range */}
          <div>
            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_month">This Month</option>
              <option value="this_year">This Year</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Payment Method</label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
            >
              <option value="all">All Methods</option>
              <option value="UPI">UPI / Apps</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="PhonePe">PhonePe</option>
              <option value="Paytm">Paytm</option>
              <option value="Google Pay">Google Pay</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
              <option value="title_asc">Title (A-Z)</option>
            </select>
          </div>

          {/* Min Amount */}
          <div>
            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Min ₹</label>
            <input
              type="number"
              placeholder="0"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
            />
          </div>

          {/* Max Amount */}
          <div>
            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Max ₹</label>
            <input
              type="number"
              placeholder="50000"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
            />
          </div>
        </div>

        {/* Filter Summary Banner */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Showing <strong className="text-white">{filteredExpenses.length}</strong> records
          </span>
          <span>
            Filtered Total:{" "}
            <strong className="text-emerald-400 font-mono">
              {formatCurrency(totalFilteredAmount)}
            </strong>
          </span>
        </div>
      </div>

      {/* Undo Toast Notification */}
      {lastDeletedId && (
        <div className="p-3 rounded-xl bg-blue-950 border border-blue-800 text-blue-200 text-xs flex items-center justify-between shadow-lg">
          <span>Expense moved to trash bin.</span>
          <button
            onClick={() => {
              onRestoreExpense(lastDeletedId);
              setLastDeletedId(null);
            }}
            className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Undo Delete
          </button>
        </div>
      )}

      {/* Expenses Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Title / Vendor</th>
              <th className="p-3">Category</th>
              <th className="p-3">Payment Method</th>
              <th className="p-3 text-right">Amount</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  No matching expense records found. Try adjusting filters or search query.
                </td>
              </tr>
            ) : (
              filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono text-slate-400">{exp.date}</td>
                  <td className="p-3 font-semibold text-slate-100">
                    <div>{exp.title}</div>
                    {exp.isSharedForOther && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-medium">
                          Owed by: {exp.paidForPersonName || "Someone"}
                        </span>
                      </div>
                    )}
                    {exp.vendor && (
                      <span className="text-[10px] text-slate-400 font-normal block">
                        {exp.vendor}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-3 text-blue-400 font-medium">{exp.paymentMethod}</td>
                  <td className="p-3 text-right font-bold text-emerald-400 font-mono">
                    {formatCurrency(exp.amount, exp.currency)}
                  </td>
                  <td className="p-3 text-center">
                    {exp.isSharedForOther ? (
                      exp.isReimbursed ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                          Reimbursed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold animate-pulse">
                          Pending Return
                        </span>
                      )
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                        {exp.status}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {exp.isSharedForOther && !exp.isReimbursed && (
                        <>
                          <a
                            href={`https://wa.me/${exp.paidForPersonContact?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                              `Hi ${exp.paidForPersonName || "there"}, I paid ${formatCurrency(exp.amount, exp.currency)} for "${exp.title}" on ${exp.date}. Please settle via UPI when convenient!`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/60 transition-colors"
                            title="Send WhatsApp Payment Reminder"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </a>
                          {onMarkReimbursed && (
                            <button
                              onClick={() => onMarkReimbursed(exp)}
                              className="p-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-800 text-amber-300 border border-amber-700/60 transition-colors"
                              title="Mark Money Returned / Reimbursed"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => setViewingExpense(exp)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="View Full Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditExpense(exp)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors"
                        title="Edit Expense"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 transition-colors"
                        title="Soft Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detailed Expense Modal */}
      {viewingExpense && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Expense Details
                </span>
                <h3 className="text-base font-bold text-white">{viewingExpense.title}</h3>
              </div>
              <button
                onClick={() => setViewingExpense(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Total Amount</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {formatCurrency(viewingExpense.amount, viewingExpense.currency)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <p>
                  <strong className="text-slate-400">Date:</strong> {viewingExpense.date} {viewingExpense.time}
                </p>
                <p>
                  <strong className="text-slate-400">Category:</strong> {viewingExpense.category}
                </p>
                <p>
                  <strong className="text-slate-400">Subcategory:</strong>{" "}
                  {viewingExpense.subCategory || "N/A"}
                </p>
                <p>
                  <strong className="text-slate-400">Vendor:</strong> {viewingExpense.vendor || "N/A"}
                </p>
                <p>
                  <strong className="text-slate-400">Payment Mode:</strong>{" "}
                  {viewingExpense.paymentMethod}
                </p>
                <p>
                  <strong className="text-slate-400">Location:</strong>{" "}
                  {viewingExpense.location || "N/A"}
                </p>
              </div>

              {/* Payment Details Sub-section */}
              {viewingExpense.paymentDetails && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-[11px] font-mono">
                  <p className="text-blue-400 font-bold font-sans">Payment Channel Details</p>
                  {viewingExpense.paymentDetails.bank && (
                    <>
                      <p>Bank: {viewingExpense.paymentDetails.bank.bankName}</p>
                      <p>Txn ID: {viewingExpense.paymentDetails.bank.transactionId}</p>
                    </>
                  )}
                  {viewingExpense.paymentDetails.upi && (
                    <>
                      <p>UPI App: {viewingExpense.paymentDetails.upi.upiApp}</p>
                      <p>Txn ID: {viewingExpense.paymentDetails.upi.transactionId}</p>
                      <p>Receiver: {viewingExpense.paymentDetails.upi.receiverName}</p>
                    </>
                  )}
                  {viewingExpense.paymentDetails.card && (
                    <>
                      <p>
                        Card: {viewingExpense.paymentDetails.card.cardType} (ending{" "}
                        {viewingExpense.paymentDetails.card.last4Digits})
                      </p>
                      <p>Bank: {viewingExpense.paymentDetails.card.bankName}</p>
                    </>
                  )}
                </div>
              )}

              {viewingExpense.notes && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Notes</p>
                  <p className="text-slate-200 mt-0.5">{viewingExpense.notes}</p>
                </div>
              )}

              {viewingExpense.receiptUrl && (
                <div className="space-y-1">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Receipt Attachment</p>
                  <img
                    src={viewingExpense.receiptUrl}
                    alt="Receipt Attachment"
                    className="max-h-48 rounded-xl border border-slate-800 object-contain bg-black w-full"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  const exp = viewingExpense;
                  setViewingExpense(null);
                  onEditExpense(exp);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white"
              >
                Edit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
