import { NextRequest } from "next/server";
import { generateRoastOrCompliment } from "@/app/lib/openai";
import { z } from "zod";

const requestSchema = z.object({
  type: z.enum(["roast", "compliment"]),
  inputType: z.enum(["text", "image"]),
  text: z.string().optional(),
  imageData: z.string().optional(),
  severity: z.enum(["mild", "medium", "nuclear"]).default("medium"),
  style: z
    .enum(["formal", "sarcastic", "shakespearean", "rapBattle"])
    .default("sarcastic"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, inputType, text, imageData, severity, style } =
      requestSchema.parse(body);

    // Validate that we have either text or imageData based on inputType
    if (inputType === "text" && !text) {
      return new Response(
        JSON.stringify({ error: "Text input required for text mode" }),
        { status: 400 }
      );
    }
    if (inputType === "image" && !imageData) {
      return new Response(
        JSON.stringify({ error: "Image data required for image mode" }),
        { status: 400 }
      );
    }

    console.log("severity", severity);
    console.log("style", style);

    const response = await generateRoastOrCompliment({
      type,
      inputType,
      text,
      imageUrl: imageData, // Pass imageData as imageUrl to the OpenAI function
      severity,
      style,
    });

    return new Response(JSON.stringify({ generatedText: response }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate route:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}
