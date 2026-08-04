import React, { useState } from "react";
import { X, Sparkles, Upload, Check, AlertCircle, FileText, Loader2 } from "lucide-react";
import { Expense } from "../types";

interface ReceiptOcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptExtracted: (extractedData: Partial<Expense>) => void;
}

export const ReceiptOcrModal: React.FC<ReceiptOcrModalProps> = ({
  isOpen,
  onClose,
  onReceiptExtracted,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [extractedData, setExtractedData] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setErrorMsg("");
    setExtractedData(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      runOcr(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const runOcr = async (base64Data: string, mimeType: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Data, mimeType }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to scan receipt image.");
      }

      setExtractedData(json.data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to parse receipt with Gemini Vision AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!extractedData) return;

    onReceiptExtracted({
      title: extractedData.title || extractedData.vendor || "Scanned Receipt",
      amount: Number(extractedData.amount || 0),
      currency: extractedData.currency || "INR",
      date: extractedData.date || new Date().toISOString().split("T")[0],
      time: extractedData.time || "12:00",
      category: extractedData.category || "Shopping",
      subCategory: extractedData.subCategory || "",
      vendor: extractedData.vendor || "",
      location: extractedData.location || "",
      paymentMethod: extractedData.paymentMethod || "UPI",
      notes: extractedData.notes || "",
      receiptUrl: imagePreview || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Gemini AI Receipt OCR Scanner</h3>
              <p className="text-[11px] text-slate-400">
                Upload invoice or bill to extract expense details automatically
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!imagePreview ? (
            <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors bg-slate-950/50">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-200">
                  Click or drag receipt photo / bill PDF
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports JPG, PNG, WEBP invoices up to 10MB
                </p>
              </div>
              <input type="file" accept="image/*,.pdf" onChange={handleFileSelect} className="hidden" />
            </label>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black max-h-56 flex items-center justify-center">
                <img src={imagePreview} alt="Receipt Preview" className="max-h-56 object-contain" />
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5" /> AI Extracted Details
                  </p>

                  {isLoading ? (
                    <div className="py-8 flex flex-col items-center justify-center text-slate-400 space-y-2">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                      <p className="text-xs">Analyzing receipt with Gemini Vision...</p>
                    </div>
                  ) : errorMsg ? (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{errorMsg}</span>
                    </div>
                  ) : extractedData ? (
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <p>
                        <strong className="text-slate-400">Vendor:</strong> {extractedData.vendor || "N/A"}
                      </p>
                      <p>
                        <strong className="text-slate-400">Amount:</strong>{" "}
                        <span className="text-emerald-400 font-bold font-mono">
                          {extractedData.currency || "INR"} {extractedData.amount}
                        </span>
                      </p>
                      <p>
                        <strong className="text-slate-400">Date:</strong> {extractedData.date || "N/A"}
                      </p>
                      <p>
                        <strong className="text-slate-400">Category:</strong> {extractedData.category || "N/A"}
                      </p>
                      <p>
                        <strong className="text-slate-400">Payment:</strong> {extractedData.paymentMethod || "N/A"}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setExtractedData(null);
                    }}
                    className="w-full py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Retake
                  </button>
                  {extractedData && (
                    <button
                      type="button"
                      onClick={handleApply}
                      className="w-full py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Apply Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
