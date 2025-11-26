import { GoogleGenAI } from "@google/genai";
import { API_KEY } from "../config/env";

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const analyzeCatSymptoms = async (symptoms: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      You are a veterinary assistant AI. A user is reporting these symptoms for their cat: "${symptoms}". 
      
      Provide a response in exactly this plain text format:
      
      **Assessment:** [Urgent/Routine/Monitor]
      **Category:** [Illness/Injury/Behavioral/Other]
      **Advice:** [1-2 short sentences of immediate advice]
      
      Do not provide a disclaimer. Keep it concise.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        maxOutputTokens: 200,
        temperature: 0.4,
      }
    });

    return response.text || "Unable to generate analysis.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze symptoms.");
  }
};
