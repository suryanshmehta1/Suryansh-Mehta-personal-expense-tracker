import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  BrainCircuit,
  Search,
  User,
  ExternalLink,
  Loader2,
  Lightbulb,
  CreditCard,
  Tag,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { ChatMessage, Expense } from "../types";

interface FlashAiAdvisorProps {
  expenses: Expense[];
}

export const FlashAiAdvisor: React.FC<FlashAiAdvisorProps> = ({ expenses }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-001",
      role: "assistant",
      content:
        "Hello Suryansh Mehta! I am **Flash AI**, your personal intelligent financial advisor.\n\nI can help you:\n- Analyze your spending habits and find cost savings\n- Recommend whether to pay via **Cash, Paytm, PhonePe, or Credit Card** for maximum savings and zero fees\n- Compare real-time market prices across online and offline stores using Google Search\n- Tag and categorize purchases for optimal budgeting",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [enableThinking, setEnableThinking] = useState(false);
  const [enableSearch, setEnableSearch] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput("");
    setIsLoading(true);

    // Format expenses summary for context
    const expensesSummary = expenses
      .slice(0, 30)
      .map(
        (e) =>
          `- ${e.date}: ${e.title} (${e.category}) - ₹${e.amount} via ${e.paymentMethod}`
      )
      .join("\n");

    try {
      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          enableThinking,
          enableSearch,
          userExpensesSummary: expensesSummary,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reach AI Advisor.");
      }

      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        role: "assistant",
        content: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: data.modelUsed,
        groundingChunks: data.groundingChunks,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: "assistant",
          content: `⚠️ Sorry Suryansh, I encountered an error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Should I pay via Cash, Paytm, or Credit Card for my next ₹5,000 electronics purchase?",
    "Where can I buy a MacBook M3 Sleeve cheaper right now?",
    "Analyze my top spending categories this month and give 3 savings tips.",
    "Help me categorize my latest ₹15,000 expense and optimize my budget.",
  ];

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bot className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-sans">
                Flash AI Advisor & Market Intelligence
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Context-Aware
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Personalized advice, deal comparison, and optimal checkout method analyzer for Suryansh Mehta
            </p>
          </div>
        </div>

        {/* Intelligence Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* High Thinking Toggle */}
          <button
            onClick={() => setEnableThinking(!enableThinking)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              enableThinking
                ? "bg-purple-600/20 text-purple-300 border-purple-500/40 shadow-md shadow-purple-600/20"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
            }`}
            title="Uses gemini-3.1-pro-preview with thinkingLevel HIGH for complex reasoning"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
            <span>High Thinking {enableThinking ? "ON" : "OFF"}</span>
          </button>

          {/* Search Grounding Toggle */}
          <button
            onClick={() => setEnableSearch(!enableSearch)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              enableSearch
                ? "bg-blue-600/20 text-blue-300 border-blue-500/40 shadow-md shadow-blue-600/20"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
            }`}
            title="Search grounding for live market prices and deal comparisons"
          >
            <Search className="w-3.5 h-3.5 text-blue-400" />
            <span>Search Grounding {enableSearch ? "ON" : "OFF"}</span>
          </button>
        </div>
      </div>

      {/* Chat Thread Container */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col h-[580px] overflow-hidden">
        {/* Messages */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gradient-to-tr from-slate-800 to-slate-700 text-emerald-400 border border-slate-600"
                }`}
              >
                {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl p-4 text-xs space-y-2 leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{m.content}</div>

                {/* Grounding Sources if present */}
                {m.groundingChunks && m.groundingChunks.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <p className="font-bold text-blue-400 flex items-center gap-1">
                      <Search className="w-3 h-3" /> Live Web Sources Verified
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.groundingChunks.map((chunk, idx) =>
                        chunk.web ? (
                          <a
                            key={idx}
                            href={chunk.web.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 text-[10px]"
                          >
                            <span>{chunk.web.title}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : null
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-[10px] opacity-60">
                  <span>{m.timestamp}</span>
                  {m.modelUsed && <span>Model: {m.modelUsed}</span>}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <span>
                {enableThinking
                  ? "Flash AI is executing High Thinking analysis for deep financial optimization..."
                  : "Flash AI is formulating real-time recommendation..."}
              </span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px] text-slate-400">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold text-slate-300 shrink-0">Quick Prompts:</span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition-colors border border-slate-700/60"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask Flash AI anything e.g. 'Should I pay by Paytm or Card for Swiggy?'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
