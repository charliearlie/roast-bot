import { GenerationType, InputType, ToneSeverity, ToneStyle } from "./openai";
import { withRetry } from "./utils";

interface GenerateRequest {
  type: GenerationType;
  inputType: InputType;
  answers?: Record<string, string>;
  imageData?: string;
  text?: string;
  toneSeverity: ToneSeverity;
  toneStyle: ToneStyle;
}

interface GenerateResponse {
  generatedText: string;
}

interface ErrorResponse {
  error: string;
  details?: unknown;
}

interface GenerateContentParams {
  type: "roast" | "compliment";
  inputType: "text" | "image";
  text?: string;
  imageData?: string;
  answers?: Record<string, string>;
  severity: ToneSeverity;
  style: ToneStyle;
}

interface GenerateContentResponse {
  generatedText: string;
}

const isRetryableError = (error: Error) => {
  // Retry on network errors and 5xx server errors
  if (error.name === "TypeError" && error.message === "Failed to fetch") {
    return true;
  }
  if (error instanceof Response && error.status >= 500) {
    return true;
  }
  return false;
};

export async function generateContent(
  params: GenerateContentParams
): Promise<GenerateContentResponse> {
  return withRetry(
    async () => {
      console.log("generating content", params);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: params.type,
          inputType: params.inputType,
          text: params.text,
          imageData: params.imageData,
          severity: params.severity,
          style: params.style,
        }),
      });

      if (!response.ok) {
        const error = new Error("Failed to generate content") as Error & {
          status?: number;
        };
        error.status = response.status;
        throw error;
      }

      return response.json();
    },
    {
      maxAttempts: 3,
      delayMs: 1000,
      backoffFactor: 1.5,
      shouldRetry: isRetryableError,
    }
  );
}

export async function generateMeme(params: {
  text: string;
  type: "roast" | "compliment";
  imageData?: string;
  template?: string;
}): Promise<{ imageData: string }> {
  return withRetry(
    async () => {
      const response = await fetch("/api/generate-meme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = new Error("Failed to generate meme") as Error & {
          status?: number;
        };
        error.status = response.status;
        throw error;
      }

      return response.json();
    },
    {
      maxAttempts: 2, // Fewer attempts for meme generation as it's less critical
      delayMs: 1500,
      shouldRetry: isRetryableError,
    }
  );
}

export async function trackShare(params: {
  type: "roast" | "compliment";
  platform: "twitter" | "facebook" | "copy";
  memeId: string;
}): Promise<{
  analytics: {
    platform: Record<string, number>;
    total: number;
    isViral: boolean;
  };
}> {
  return withRetry(
    async () => {
      const response = await fetch("/api/track-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = new Error("Failed to track share") as Error & {
          status?: number;
        };
        error.status = response.status;
        throw error;
      }

      return response.json();
    },
    {
      maxAttempts: 2,
      delayMs: 500, // Shorter delay for analytics
      shouldRetry: isRetryableError,
    }
  );
}
