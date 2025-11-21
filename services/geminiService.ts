import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeoLocation } from "../types";

// Initialize the client
// NOTE: We must use process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Sends a message to Gemini with Google Maps and Google Search tools enabled.
 * Uses gemini-2.5-flash as it supports both tools reliably in combination.
 */
export const sendMessageToGemini = async (
  prompt: string,
  location: GeoLocation | null,
  history: { role: string; parts: { text: string }[] }[]
): Promise<{ text: string; groundingMetadata?: any }> => {
  try {
    // We use gemini-2.5-flash as recommended for Maps Grounding and Search Grounding
    const modelId = 'gemini-2.5-flash';

    const toolConfig: any = {};
    
    // If we have the user's location, we pass it to the retrievalConfig
    if (location) {
      toolConfig.retrievalConfig = {
        latLng: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      };
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: [
        ...history,
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      config: {
        // Enable both Google Search and Google Maps tools
        tools: [
          { googleSearch: {} },
          { googleMaps: {} }
        ],
        toolConfig: location ? toolConfig : undefined,
        systemInstruction: "You are a helpful location-aware assistant. When users ask about places, use the Google Maps tool to find real-time information. Use Google Search for current events or broader questions. Always be polite and concise.",
      }
    });

    const text = response.text || "I couldn't generate a response.";
    
    // Extract grounding metadata if available
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    return {
      text,
      groundingMetadata
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
