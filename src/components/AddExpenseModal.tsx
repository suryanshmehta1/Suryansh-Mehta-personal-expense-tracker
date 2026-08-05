import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  Mic,
  MicOff,
  Sparkles,
  CreditCard,
  Building2,
  Smartphone,
  Tag,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Store,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  Expense,
  PaymentMethod,
  CategoryType,
  CurrencyCode,
  PaymentDetails,
} from "../types";
import { formatCurrency } from "../lib/exportUtils";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expense: Omit<Expense, "id" | "userId" | "createdAt" | "updatedAt">) => void;
  initialExpense?: Expense | null;
  onScanReceiptRequest?: () => void;
}

const CATEGORIES: CategoryType[] = [
  "Food",
  "Travel",
  "Fuel",
  "Shopping",
  "Medical",
  "Business",
  "Office",
  "Salary",
  "Education",
  "Entertainment",
  "Subscriptions",
  "Utilities",
  "Internet",
  "Electricity",
  "Water",
  "Rent",
  "EMI",
  "Insurance",
  "Investments",
  "Gifts",
  "Donation",
  "Clothing",
  "Jewelry",
  "Electronics",
  "Maintenance",
  "Vehicle",
  "Household",
  "Others",
];

const PAYMENT_METHODS: PaymentMethod[] = [
  "Cash",
  "UPI",
  "PhonePe",
  "Google Pay",
  "Paytm",
  "Bank Transfer",
  "Debit Card",
  "Credit Card",
  "Net Banking",
  "Cheque",
  "EMI",
  "Wallet",
  "Amazon Pay",
  "BHIM",
  "Razorpay",
  "Cash on Delivery",
  "Business Account",
  "Personal Account",
  "Other",
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
  initialExpense,
  onScanReceiptRequest,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [currency, setCurrency] = useState<CurrencyCode>("INR");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
  const [category, setCategory] = useState<CategoryType | string>("Food");
  const [customCategory, setCustomCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [vendor, setVendor] = useState("");
  const [location, setLocation] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");

  // Dynamic Payment Method Fields
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");

  const [upiApp, setUpiApp] = useState("PhonePe");
  const [receiverName, setReceiverName] = useState("");

  const [cardType, setCardType] = useState<"Visa" | "Mastercard" | "RuPay" | "American Express" | "Other">("Visa");
  const [last4Digits, setLast4Digits] = useState("");

  const [customPaymentMethod, setCustomPaymentMethod] = useState("");

  const [receiptUrl, setReceiptUrl] = useState<string | undefined>("");
  const [notes, setNotes] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);

  // Shared / Owed Expense State
  const [isSharedForOther, setIsSharedForOther] = useState(false);
  const [paidForPersonName, setPaidForPersonName] = useState("");
  const [paidForPersonContact, setPaidForPersonContact] = useState("");

  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState("");

  useEffect(() => {
    if (initialExpense) {
      setTitle(initialExpense.title || "");
      setDescription(initialExpense.description || "");
      setAmount(initialExpense.amount || "");
      setCurrency(initialExpense.currency || "INR");
      setDate(initialExpense.date || new Date().toISOString().split("T")[0]);
      setTime(initialExpense.time || "12:00");
      setCategory(initialExpense.category || "Food");
      setSubCategory(initialExpense.subCategory || "");
      setVendor(initialExpense.vendor || "");
      setLocation(initialExpense.location || "");
      setPaymentMethod(initialExpense.paymentMethod || "UPI");
      setNotes(initialExpense.notes || "");
      setTags(initialExpense.tags || []);
      setIsRecurring(!!initialExpense.isRecurring);
      setIsSharedForOther(!!initialExpense.isSharedForOther);
      setPaidForPersonName(initialExpense.paidForPersonName || "");
      setPaidForPersonContact(initialExpense.paidForPersonContact || "");
      setReceiptUrl(initialExpense.receiptUrl || "");

      if (initialExpense.paymentDetails?.bank) {
        setBankName(initialExpense.paymentDetails.bank.bankName || "");
        setAccountNumber(initialExpense.paymentDetails.bank.accountNumber || "");
        setTransactionId(initialExpense.paymentDetails.bank.transactionId || "");
        setReferenceNumber(initialExpense.paymentDetails.bank.referenceNumber || "");
      }
      if (initialExpense.paymentDetails?.upi) {
        setUpiApp(initialExpense.paymentDetails.upi.upiApp || "PhonePe");
        setTransactionId(initialExpense.paymentDetails.upi.transactionId || "");
        setReceiverName(initialExpense.paymentDetails.upi.receiverName || "");
      }
      if (initialExpense.paymentDetails?.card) {
        setCardType(initialExpense.paymentDetails.card.cardType || "Visa");
        setLast4Digits(initialExpense.paymentDetails.card.last4Digits || "");
        setBankName(initialExpense.paymentDetails.card.bankName || "");
      }
      if (initialExpense.paymentDetails?.customMethodName) {
        setCustomPaymentMethod(initialExpense.paymentDetails.customMethodName);
      }
    }
  }, [initialExpense, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    setIsListening(true);
    setVoiceFeedback("Listening... Speak expense details like 'Spent 500 rupees at Starbucks for Coffee using PhonePe'");

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceFeedback(`Captured: "${transcript}"`);
      setIsListening(false);

      // Simple voice parsing logic
      const numMatch = transcript.match(/(\d+)/);
      if (numMatch) {
        setAmount(Number(numMatch[0]));
      }

      if (/starbucks|swiggy|zomato|amazon|uber|ola|hp|petrol|d-mart|ikea/i.test(transcript)) {
        const vendorMatch = transcript.match(/at\s+([a-zA-Z\s]+)|on\s+([a-zA-Z\s]+)/i);
        if (vendorMatch) {
          setVendor(vendorMatch[1] || vendorMatch[2]);
        }
      }

      if (/phonepe/i.test(transcript)) setPaymentMethod("PhonePe");
      else if (/paytm/i.test(transcript)) setPaymentMethod("Paytm");
      else if (/google pay|gpay/i.test(transcript)) setPaymentMethod("Google Pay");
      else if (/card/i.test(transcript)) setPaymentMethod("Credit Card");
      else if (/cash/i.test(transcript)) setPaymentMethod("Cash");

      setTitle(transcript);
    };

    recognition.onerror = (e: any) => {
      console.error(e);
      setIsListening(false);
      setVoiceFeedback("Voice recognition error. Please try typing.");
    };

    recognition.start();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) {
      alert("Please provide at least Title and Amount.");
      return;
    }

    const finalCategory = category === "Others" && customCategory ? customCategory : category;

    const paymentDetails: PaymentDetails = {};
    if (["Bank Transfer", "Net Banking", "Cheque"].includes(paymentMethod)) {
      paymentDetails.bank = {
        bankName,
        accountNumber,
        transactionId,
        referenceNumber,
      };
    } else if (["UPI", "PhonePe", "Google Pay", "Paytm", "BHIM", "Amazon Pay", "Razorpay"].includes(paymentMethod)) {
      paymentDetails.upi = {
        upiApp: paymentMethod === "UPI" ? upiApp : paymentMethod,
        transactionId,
        receiverName,
      };
    } else if (["Credit Card", "Debit Card"].includes(paymentMethod)) {
      paymentDetails.card = {
        cardType,
        last4Digits,
        bankName,
      };
    } else if (paymentMethod === "Other") {
      paymentDetails.customMethodName = customPaymentMethod;
    }

    onSaveExpense({
      title,
      description,
      amount: Number(amount),
      currency,
      date,
      time,
      category: finalCategory,
      subCategory,
      vendor,
      location,
      paymentMethod,
      paymentDetails,
      receiptUrl,
      notes,
      tags,
      isRecurring,
      isSharedForOther,
      paidForPersonName,
      paidForPersonContact,
      status: "paid",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans">
                {initialExpense ? "Edit Expense Record" : "Record Expense"}
              </h2>
              <p className="text-xs text-slate-400">
                Enter expense details for Suryansh Mehta's records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onScanReceiptRequest && (
              <button
                type="button"
                onClick={onScanReceiptRequest}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>OCR Receipt Scan</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Voice Feedback Banner */}
        {voiceFeedback && (
          <div className="bg-blue-950/80 border-b border-blue-800/50 px-6 py-2 text-xs text-blue-300 flex items-center justify-between">
            <span>{voiceFeedback}</span>
            <button onClick={() => setVoiceFeedback("")} className="text-blue-400 hover:text-white">
              Dismiss
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Main Title & Amount Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                Expense Title <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Swiggy Gourmet Dinner or MacBook Hub"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  title="Speak to dictate expense details"
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors ${
                    isListening ? "bg-red-500/20 text-red-400 animate-pulse" : "hover:bg-slate-800"
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-blue-400" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                Amount <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="INR">₹ INR</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                  <option value="GBP">£ GBP</option>
                  <option value="AED">AED</option>
                </select>
                <input
                  type="number"
                  required
                  step="any"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {category === "Others" && (
                <input
                  type="text"
                  placeholder="Specify Custom Category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Sub Category (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Dining Out, Petrol, Software"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Vendor & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-slate-400" /> Vendor / Shop Name
              </label>
              <input
                type="text"
                placeholder="e.g. HPCL, Apple Store, Swiggy, Amazon"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location / City
              </label>
              <input
                type="text"
                placeholder="e.g. Gurugram, DLF Phase 3, Online"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Payment Method Selector (Most Important Feature) */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-blue-400 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Payment Method Selection
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-blue-500"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Payment Method Sub-Fields */}
            {["Bank Transfer", "Net Banking", "Cheque"].includes(paymentMethod) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Bank Name</label>
                  <input
                    type="text"
                    placeholder="e.g. ICICI Bank, HDFC Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Account Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="Last digits e.g. 5810"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Transaction ID</label>
                  <input
                    type="text"
                    placeholder="e.g. ICICIRN0091823"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Reference Number</label>
                  <input
                    type="text"
                    placeholder="e.g. REF-FEATH-9921"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            )}

            {["UPI", "PhonePe", "Google Pay", "Paytm", "BHIM", "Amazon Pay", "Razorpay"].includes(paymentMethod) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">UPI App / Gateway</label>
                  <input
                    type="text"
                    placeholder="e.g. PhonePe, Paytm, GPay"
                    value={upiApp}
                    onChange={(e) => setUpiApp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Transaction ID</label>
                  <input
                    type="text"
                    placeholder="e.g. T2408032115998"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Receiver Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Swiggy, Merchant VPA"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            )}

            {["Credit Card", "Debit Card"].includes(paymentMethod) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Card Type</label>
                  <select
                    value={cardType}
                    onChange={(e) => setCardType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="RuPay">RuPay</option>
                    <option value="American Express">American Express</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="e.g. 4821"
                    value={last4Digits}
                    onChange={(e) => setLast4Digits(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Issuing Bank</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Regalia"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            )}

            {paymentMethod === "Other" && (
              <div className="pt-2 border-t border-slate-800 space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Custom Payment Method Name</label>
                <input
                  type="text"
                  placeholder="Specify custom payment channel"
                  value={customPaymentMethod}
                  onChange={(e) => setCustomPaymentMethod(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            )}
          </div>

          {/* Description & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Description</label>
              <textarea
                rows={2}
                placeholder="Brief summary of item or purpose"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Notes / Remarks</label>
              <textarea
                rows={2}
                placeholder="Additional details or GST claiming info"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Tags & Recurring Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add tag e.g. Work"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[11px]"
                  >
                    #{t}
                    <button type="button" onClick={() => handleRemoveTag(t)} className="hover:text-red-400">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200">Recurring Expense</p>
                  <p className="text-[10px] text-slate-400">Mark if this bill repeats monthly or weekly</p>
                </div>
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500"
                />
              </div>

              {/* Paid for someone else / Shared Owed Expense Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-400">Paid for Someone Else / Owed Expense</p>
                    <p className="text-[10px] text-slate-400">Enable to track money owed to you and send payment reminder</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSharedForOther}
                    onChange={(e) => setIsSharedForOther(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500"
                  />
                </div>

                {isSharedForOther && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800 animate-in fade-in">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-300 block mb-1">Person's Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma, Aman"
                        value={paidForPersonName}
                        onChange={(e) => setPaidForPersonName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-300 block mb-1">Phone / UPI VPA (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. 9876543210 or rahul@upi"
                        value={paidForPersonContact}
                        onChange={(e) => setPaidForPersonContact(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Receipt Attachment Upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-slate-400" /> Receipt / Invoice Attachment
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition-colors">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Choose Image or Receipt PDF</span>
                <input type="file" accept="image/*,.pdf" onChange={handleReceiptUpload} className="hidden" />
              </label>

              {receiptUrl && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-700 group">
                  <img src={receiptUrl} alt="Receipt preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setReceiptUrl(undefined)}
                    className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 text-xs"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialExpense ? "Update Expense" : "Save Expense Record"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
