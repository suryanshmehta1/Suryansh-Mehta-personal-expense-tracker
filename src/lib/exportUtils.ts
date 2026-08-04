import { Expense, BudgetConfig } from "../types";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

// Format currency display
export function formatCurrency(
  amount: number,
  currency: string = "INR"
): string {
  const symbolMap: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    AED: "AED ",
    CAD: "CA$",
  };
  const sym = symbolMap[currency] || `${currency} `;
  return `${sym}${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;
}

// Export Expenses to CSV for Google Sheets
export function exportToCSV(expenses: Expense[], filename = "Mehta_Expenses.csv") {
  if (!expenses.length) return;

  const headers = [
    "Expense ID",
    "Date",
    "Time",
    "Title",
    "Category",
    "Sub Category",
    "Amount",
    "Currency",
    "Payment Method",
    "Vendor / Shop",
    "Location",
    "Transaction ID",
    "Bank / Card / App Details",
    "Notes",
    "Status",
  ];

  const rows = expenses.map((e) => {
    let detailStr = "";
    if (e.paymentDetails?.bank) {
      detailStr = `Bank: ${e.paymentDetails.bank.bankName || ""} | Txn: ${
        e.paymentDetails.bank.transactionId || ""
      }`;
    } else if (e.paymentDetails?.upi) {
      detailStr = `App: ${e.paymentDetails.upi.upiApp || ""} | Txn: ${
        e.paymentDetails.upi.transactionId || ""
      } | Recv: ${e.paymentDetails.upi.receiverName || ""}`;
    } else if (e.paymentDetails?.card) {
      detailStr = `Card: ${e.paymentDetails.card.cardType || ""} ending in ${
        e.paymentDetails.card.last4Digits || ""
      } (${e.paymentDetails.card.bankName || ""})`;
    } else if (e.paymentDetails?.customMethodName) {
      detailStr = e.paymentDetails.customMethodName;
    }

    return [
      `"${e.id}"`,
      `"${e.date}"`,
      `"${e.time}"`,
      `"${(e.title || "").replace(/"/g, '""')}"`,
      `"${e.category}"`,
      `"${e.subCategory || ""}"`,
      e.amount,
      `"${e.currency}"`,
      `"${e.paymentMethod}"`,
      `"${(e.vendor || "").replace(/"/g, '""')}"`,
      `"${(e.location || "").replace(/"/g, '""')}"`,
      `"${e.paymentDetails?.bank?.transactionId || e.paymentDetails?.upi?.transactionId || ""}"`,
      `"${detailStr.replace(/"/g, '""')}"`,
      `"${(e.notes || "").replace(/"/g, '""')}"`,
      `"${e.status}"`,
    ];
  });

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export Expenses to Excel (.xlsx)
export function exportToExcel(
  expenses: Expense[],
  filename = "Mehta_Expense_Report.xlsx"
) {
  if (!expenses.length) return;

  const data = expenses.map((e) => ({
    "Expense ID": e.id,
    Date: e.date,
    Time: e.time,
    Title: e.title,
    Category: e.category,
    "Sub Category": e.subCategory || "",
    "Amount (₹)": e.amount,
    Currency: e.currency,
    "Payment Method": e.paymentMethod,
    Vendor: e.vendor || "",
    Location: e.location || "",
    "Txn ID":
      e.paymentDetails?.bank?.transactionId ||
      e.paymentDetails?.upi?.transactionId ||
      "",
    Notes: e.notes || "",
    Status: e.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
  XLSX.writeFile(workbook, filename);
}

// Export PDF Financial Report
export function exportToPDF(
  expenses: Expense[],
  userBudget?: BudgetConfig,
  filename = "Mehta_Financial_Summary.pdf"
) {
  const doc = new jsPDF();

  // Title & Header
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // #2563EB
  doc.text("SURYANSH MEHTA - FINANCIAL REPORT", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 14, 28);
  doc.text(`Total Records: ${expenses.length}`, 14, 34);

  // Summary Metrics
  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Expenses Recorded: INR ${totalSpent.toLocaleString()}`, 14, 44);

  if (userBudget) {
    doc.text(`Monthly Budget Limit: INR ${userBudget.overallLimit.toLocaleString()}`, 14, 52);
    const perc = Math.round((totalSpent / userBudget.overallLimit) * 100);
    doc.text(`Budget Utilization: ${perc}%`, 14, 60);
  }

  // Table
  let y = 74;
  doc.setFontSize(10);
  doc.setFillColor(30, 41, 59);
  doc.rect(14, y, 182, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.text("Date", 16, y + 6);
  doc.text("Title / Vendor", 45, y + 6);
  doc.text("Category", 105, y + 6);
  doc.text("Method", 145, y + 6);
  doc.text("Amount (INR)", 175, y + 6);

  y += 12;
  doc.setTextColor(30, 41, 59);

  expenses.slice(0, 25).forEach((e) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const shortTitle =
      e.title.length > 25 ? e.title.substring(0, 23) + "..." : e.title;
    doc.text(e.date || "", 16, y);
    doc.text(shortTitle, 45, y);
    doc.text(e.category || "", 105, y);
    doc.text(e.paymentMethod || "", 145, y);
    doc.text(`INR ${e.amount.toLocaleString()}`, 175, y);
    y += 8;
  });

  doc.save(filename);
}
