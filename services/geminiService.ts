import { GoogleGenAI, Type } from "@google/genai";
import { HRResponse } from "../types";

const initGenAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const evaluateCV = async (
  cvText: string, 
  systemInstruction: string
): Promise<HRResponse> => {
  const ai = initGenAI();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: cvText,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "The score out of 10" },
            summary: { type: Type.STRING, description: "A summary of the CV" },
            feedback: { type: Type.STRING, description: "Critical feedback on the application" }
          },
          required: ["score", "summary", "feedback"]
        },
        temperature: 0.7, // Little bit of creativity for the insults
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const parsed = JSON.parse(text) as HRResponse;
    return parsed;

  } catch (error) {
    console.error("Gemini Interaction Failed", error);
    // Fallback if the AI refuses to generate valid JSON due to safety blocks
    return {
      score: 0,
      summary: "SYSTEM ERROR: CV REJECTED",
      feedback: "The system detected malicious content or failed to process the request."
    };
  }
};