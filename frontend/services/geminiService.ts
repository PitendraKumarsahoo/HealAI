
import { GoogleGenAI, Type } from "@google/genai";
import { DiseaseType, PredictionResponse } from "../types";

const ENV = (import.meta as any)?.env ?? {};
const GEMINI_API_KEY = ENV.VITE_GEMINI_API_KEY || ENV.GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : "") || "";
const MODEL_CANDIDATES = ["gemini-2.0-flash", "gemini-1.5-flash"];

export interface ChatRuntimeStatus {
  hasApiKey: boolean;
  isOnline: boolean;
  mode: "live" | "fallback";
  message: string;
}

export const getChatRuntimeStatus = (): ChatRuntimeStatus => {
  const hasApiKey = Boolean(GEMINI_API_KEY && GEMINI_API_KEY !== "PLACEHOLDER_API_KEY");
  const isOnline = typeof navigator === "undefined" ? true : navigator.onLine;

  if (!hasApiKey) {
    return {
      hasApiKey,
      isOnline,
      mode: "fallback",
      message: "AI key missing. Assistant is running in fallback guidance mode."
    };
  }

  if (!isOnline) {
    return {
      hasApiKey,
      isOnline,
      mode: "fallback",
      message: "No internet connection. Assistant is running in offline guidance mode."
    };
  }

  return {
    hasApiKey,
    isOnline,
    mode: "live",
    message: "Live AI mode is active."
  };
};

const normalizeMessage = (message: string): string => {
  return message
    .toLowerCase()
    .replace(/\bfiver\b/g, "fever")
    .replace(/\bfeaver\b/g, "fever")
    .replace(/\bfevr\b/g, "fever")
    .replace(/\btemprature\b/g, "temperature")
    .replace(/\bassistent\b/g, "assistant");
};

const hasFeverIntent = (message: string): boolean => {
  const text = normalizeMessage(message);
  return /(\bfever\b|\bhigh temperature\b|\btemperature\b|\bbody heat\b|\bviral\b|\bflu\b)/.test(text);
};

const getOfflineHealthResponse = (message: string): string => {
  const lowerMessage = normalizeMessage(message);
  const durationMatch = lowerMessage.match(/(\d+)\s*(day|days)/);
  const durationText = durationMatch ? `${durationMatch[1]} ${durationMatch[2]}` : "a few days";

  if (hasFeverIntent(lowerMessage)) {
    return `🌱 **Namaste!**

I am an AI health assistant, not a doctor.

**Symptoms Summary**
- You may be having fever symptoms for **${durationText}**.
- This can happen with viral infections, flu, throat infection, or dehydration.

**What You Can Do Now**
1. Rest and avoid physical strain.
2. Drink fluids frequently: water, ORS, soup, coconut water.
3. Keep temperature monitored every 6-8 hours.
4. Eat light meals like khichdi, dal-rice, banana, toast.

**Medicine (General OTC Guidance)**
| Medicine | Typical Use |
|---|---|
| Paracetamol | Fever/body pain relief |
| ORS | Prevent dehydration |

Please consult a pharmacist or doctor before taking any medication.

**See a Doctor Urgently If**
- Fever is above **102°F (38.9°C)** or not improving after 3 days.
- Breathing difficulty, chest pain, confusion, severe weakness.
- Persistent vomiting, dehydration, or rash.
`;
  }

  if (lowerMessage.includes("cold") || lowerMessage.includes("cough") || lowerMessage.includes("throat")) {
    return `🌱 **Namaste!**

I am an AI health assistant, not a doctor.

**Possible Causes**
- Viral upper respiratory infection
- Seasonal allergy
- Throat irritation

**Home Care**
- Warm fluids and steam inhalation
- Salt-water gargle
- Good hydration and sleep

**Medicine (General OTC Guidance)**
| Medicine | Typical Use |
|---|---|
| Paracetamol | Fever/body pain |
| Cetirizine | Allergy symptoms |
| Cough lozenges | Throat irritation |

Please consult a pharmacist or doctor before taking any medication.

**Doctor Visit Needed If**
- Symptoms last beyond 5-7 days
- High fever, wheezing, breathing difficulty
- Blood in sputum or severe chest pain
`;
  }

  return `🌱 **Namaste!**

I am an AI health assistant, not a doctor.

**Quick Guidance**
- Share your symptoms, duration, age, and known conditions.
- I can provide possible causes, home care, OTC guidance, and danger signs.
- For serious symptoms, seek in-person medical care promptly.
`;
};

export const getPrediction = async (
  disease: DiseaseType,
  data: Record<string, number | string>
): Promise<PredictionResponse> => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "PLACEHOLDER_API_KEY") {
    return {
      riskLevel: "Moderate",
      confidence: 50,
      analysis: `AI clinical model is currently unavailable. Please use local ${disease} screening results and consult a doctor for diagnosis.`,
      suggestions: [
        "Hydration & Rest: Keep fluid intake adequate and sleep 7-8 hours.",
        "Clinical Review: Consult a doctor for confirmatory lab tests.",
        "Risk Monitoring: Repeat screening after clinical advice."
      ]
    };
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const prompt = `
    Perform a clinical assessment for the following ${disease} indicators:
    ${JSON.stringify(data, null, 2)}
    
    Predict the risk level based on clinical standards. 
    Provide a detailed analysis of why these metrics led to the result.
    Offer 3-4 actionable medical recommendations (general health advice).
  `;

  for (const model of MODEL_CANDIDATES) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskLevel: {
                type: Type.STRING,
                description: "One of: Low, Moderate, High",
              },
              confidence: {
                type: Type.NUMBER,
                description: "Confidence score between 0 and 100",
              },
              analysis: {
                type: Type.STRING,
                description: "Detailed medical analysis of the inputs",
              },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Actionable health recommendations",
              },
            },
            required: ["riskLevel", "confidence", "analysis", "recommendations"],
          },
        },
      });

      const result = JSON.parse(response.text || "{}");
      return {
        riskLevel: (result.riskLevel || "Moderate") as "Low" | "Moderate" | "High",
        confidence: Number(result.confidence ?? 50),
        analysis: result.analysis || "Assessment generated with limited confidence.",
        suggestions: Array.isArray(result.recommendations) ? result.recommendations : []
      };
    } catch (error) {
      console.error(`Gemini API Error (${model}):`, error);
    }
  }

  throw new Error("Failed to generate health assessment. Please try again later.");
};

export const getChatResponse = async (message: string): Promise<string> => {
  const prompt = `
    You are a professional AI Health Awareness Assistant named "HealAI Assistant".
    Your goal is to help users understand symptoms and give general health tips in a beautifully formatted and professional way.
    
    IMPORTANT RULES:
    1. You are NOT a doctor. Always clarify that you are an AI assistant and not a medical professional.
    2. Start your response with "🌱 Namaste!".
    3. FORMATTING REQUIREMENTS:
       - Use **Bold section titles**, bullet points, and short paragraphs.
       - Do not use markdown hash headings like #, ##, ###.
       - Use markdown tables when useful.
    
    4. CONTENT REQUIREMENTS:
       - If the user asks about symptoms, provide:
         * **Possible Causes**: Common reasons (seasonal, viral, stress).
         * **Home Remedies**: Simple steps (rest, hydration, specific foods).
         * **Medicine Suggestions**: Mention common Over-The-Counter (OTC) medicines if applicable (e.g., Paracetamol for fever, ORS for dehydration) but ALWAYS add a disclaimer: *"Please consult a pharmacist or doctor before taking any medication."*
         * **When to See a Doctor**: Clear red flags (high fever, breathing trouble).
    
    5. Keep the tone empathetic, professional, and visually appealing.
    
    User Message: ${message}
  `;

  if (!GEMINI_API_KEY || GEMINI_API_KEY === "PLACEHOLDER_API_KEY") {
    return getOfflineHealthResponse(message);
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  for (const model of MODEL_CANDIDATES) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      const text = response.text?.trim();
      if (text) {
        return text;
      }
    } catch (error) {
      console.error(`Gemini Chat Error (${model}):`, error);
    }
  }

  return `${getOfflineHealthResponse(message)}

**Note**
- Live AI response is temporarily unavailable.
- Basic guidance is shown from local assistant mode.`;
};
