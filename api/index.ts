import express from "express";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const app = express();
app.use(express.json({ limit: "20mb" }));

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({ apiKey });
}

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI OCR Endpoint for Receipt Scanning
app.post("/api/ai/ocr", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 data" });
    }

    const ai = getGenAI();
    const prompt = `Analyze this receipt / invoice image and extract key expense data in valid JSON format only (no markdown, no code block delimiters).
Return JSON with the following structure:
{
  "title": "Short descriptive title of expense/merchant",
  "vendor": "Store/Vendor name",
  "amount": 123.45,
  "currency": "INR",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "category": "Food" | "Travel" | "Fuel" | "Shopping" | "Medical" | "Business" | "Office" | "Education" | "Entertainment" | "Subscriptions" | "Utilities" | "Internet" | "Electricity" | "Rent" | "Clothing" | "Electronics" | "Household" | "Others",
  "subCategory": "Subcategory name or item type",
  "paymentMethod": "Cash" | "UPI" | "Credit Card" | "Debit Card" | "Bank Transfer" | "Paytm" | "PhonePe" | "Google Pay" | "Other",
  "location": "City or area if available",
  "notes": "Key item details or itemized list summary",
  "confidence": 0.95
}`;

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || "image/jpeg",
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    return res.json({ success: true, data });
  } catch (error: any) {
    console.error("OCR API Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to process receipt with AI Vision.",
    });
  }
});

// AI Chatbot "Flash AI Advisor"
app.post("/api/ai/chat", async (req, res) => {
  try {
    const {
      messages = [],
      enableThinking = false,
      enableSearch = false,
      userExpensesSummary = "",
    } = req.body;

    const ai = getGenAI();
    const model = enableThinking
      ? "gemini-3.1-pro-preview"
      : "gemini-3.5-flash";

    const systemInstruction = `You are "Flash AI", the personal intelligent financial advisor and cost-optimization chatbot for Suryansh Mehta in the "Mehta Expense Tracker" app.
Your goals:
1. Provide actionable, highly context-aware financial guidance, budget optimization, and spending habit insights for Suryansh Mehta based on his expense records.
2. Whenever asked about purchasing products or comparing costs, actively evaluate payment modes (Cash vs Paytm vs PhonePe vs Credit Card vs UPI) to suggest the most cost-effective checkout method (considering cashback, processing fees, reward points, zero-cost EMI, or cash discounts).
3. Recommend where products or items might be bought cheaper (online vs local markets) using market knowledge or Google Search when relevant.
4. Categorize any mentioned transactions clearly into categories like Food, Travel, Fuel, Electronics, Shopping, Business, Subscriptions, Utilities, etc.
5. Provide high-thinking financial strategies when asked complex questions about savings, investments, tax planning, or budget re-allocation.

User Expense Context:
${userExpensesSummary || "No detailed expense history provided yet."}

Keep responses clear, professional, concise, encouraging, and structured with clean formatting or bullet points when helpful.`;

    const formattedContents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const config: any = { systemInstruction };

    if (enableThinking) {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    if (enableSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model,
      contents: formattedContents,
      config,
    });

    const replyText = response.text || "I am unable to analyze that right now.";
    const candidate = response.candidates?.[0];

    let searchChunks: any[] = [];
    if (candidate?.groundingMetadata?.groundingChunks) {
      searchChunks = candidate.groundingMetadata.groundingChunks;
    }

    return res.json({
      success: true,
      message: replyText,
      groundingChunks: searchChunks,
      modelUsed: model,
    });
  } catch (error: any) {
    console.error("AI Chat API Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate AI financial response.",
    });
  }
});

// AI Insights Generator
app.post("/api/ai/insights", async (req, res) => {
  try {
    const { expenses = [], budgets = {} } = req.body;
    const ai = getGenAI();

    const prompt = `Analyze these expense records for Suryansh Mehta and produce concise, strategic financial insights:
Expenses Data: ${JSON.stringify(expenses.slice(0, 30))}
Budgets Data: ${JSON.stringify(budgets)}

Return JSON strictly in this format:
{
  "summary": "1-2 sentence overall spending health assessment",
  "topSpendingCategory": "Category Name",
  "savingsOpportunity": "Concrete actionable tip to save money based on current habits",
  "checkoutTip": "Tip regarding payment modes (e.g. credit card cashback vs UPI)",
  "alerts": ["Alert 1 if any category is nearing or over budget", "Alert 2 if recurring expenses are high"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || "{}");
    return res.json({ success: true, data });
  } catch (error: any) {
    console.error("AI Insights Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate spending insights.",
    });
  }
});

export default app;
