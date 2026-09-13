import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";

class GeminiService {
  private client: GoogleGenAI | null = null;
  private defaultModel: string;

  constructor() {
    this.defaultModel = process.env.GEMINI_MODEL || "gemini-3.6-flash";
    this.initClient();
  }

  private initClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 0) {
      try {
        this.client = new GoogleGenAI({ apiKey });
      } catch (err) {
        console.error("Failed to initialize GoogleGenAI client:", err);
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  public isConfigured(): boolean {
    const apiKey = process.env.GEMINI_API_KEY;
    return Boolean(apiKey && apiKey.trim().length > 0);
  }

  public getModel(): string {
    return this.defaultModel;
  }

  /**
   * Generates text or JSON using Gemini API with timing and error handling.
   */
  public async generateContent({
    systemInstruction,
    contents,
    responseMimeType,
    temperature = 0.2,
    model,
  }: {
    systemInstruction?: string;
    contents: string;
    responseMimeType?: string;
    temperature?: number;
    model?: string;
  }): Promise<{
    text: string;
    durationMs: number;
    promptTokens?: number;
    completionTokens?: number;
  }> {
    if (!this.isConfigured() || !this.client) {
      this.initClient();
      if (!this.client) {
        throw new Error("GEMINI_API_KEY is not configured in environment variables.");
      }
    }

    const selectedModel = model || this.defaultModel;
    const startTime = Date.now();

    try {
      const response = await this.client.models.generateContent({
        model: selectedModel,
        contents: contents,
        config: {
          systemInstruction: systemInstruction || undefined,
          responseMimeType: responseMimeType || undefined,
          temperature: temperature,
        },
      });

      const durationMs = Date.now() - startTime;
      const text = response.text || "";

      // Extract usage tokens if present in response
      const usage = (response as any).usageMetadata;

      return {
        text,
        durationMs,
        promptTokens: usage?.promptTokenCount,
        completionTokens: usage?.candidatesTokenCount,
      };
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      console.error(`Gemini API error [${selectedModel}]:`, err);
      throw err;
    }
  }

  /**
   * Quick connection probe for health check / settings page.
   */
  public async testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    if (!this.isConfigured()) {
      return { success: false, latencyMs: 0, message: "GEMINI_API_KEY is not set" };
    }
    const start = Date.now();
    try {
      const result = await this.generateContent({
        contents: "Respond with the single word: OK",
        temperature: 0.1,
      });
      return {
        success: true,
        latencyMs: Date.now() - start,
        message: `Connected successfully (${result.durationMs}ms, model: ${this.defaultModel})`,
      };
    } catch (err: any) {
      return {
        success: false,
        latencyMs: Date.now() - start,
        message: err.message || "Failed to reach Gemini API",
      };
    }
  }
}

export const geminiService = new GeminiService();
export default geminiService;
