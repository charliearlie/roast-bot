import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type GenerationType = "roast" | "compliment";
export type InputType = "image" | "text";
export type ToneSeverity = "mild" | "medium" | "nuclear";
export type ToneStyle = "formal" | "sarcastic" | "shakespearean" | "rapBattle";

interface GenerateOptions {
  inputType: "text" | "image";
  text?: string;
  imageUrl?: string;
  type: "roast" | "compliment";
  severity?: keyof typeof SEVERITY_MODIFIERS;
  style?: keyof typeof STYLE_MODIFIERS;
}

const SYSTEM_PROMPT = `You are RoastBot, an AI specialized in generating creative roasts and compliments. Your responses should be:
1. Clever and witty
2. Personalized to the input
3. Never generic
4. Avoiding harmful stereotypes or truly offensive content
5. Using creative language and metaphors
6. Maintaining a playful tone even in roasts`;

const SEVERITY_MODIFIERS = {
  mild: "Keep it very light and playful.",
  medium: "Be moderately edgy but not too harsh.",
  nuclear: "Go all out but stay within ethical bounds.",
};

const STYLE_MODIFIERS = {
  formal: "Use sophisticated, formal language.",
  sarcastic: "Be extremely sarcastic and ironic.",
  shakespearean: "Write in Shakespearean style with thee/thou/thy.",
  rapBattle: "Write in rap battle style with rhymes.",
};

export async function generateRoastOrCompliment({
  inputType,
  text,
  imageUrl,
  type,
  severity = "medium",
  style = "sarcastic",
}: GenerateOptions): Promise<string> {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: [
        SYSTEM_PROMPT,
        `Generate a ${type} that is:`,
        SEVERITY_MODIFIERS[severity],
        STYLE_MODIFIERS[style],
      ].join("\n"),
    },
  ];

  if (inputType === "image" && imageUrl) {
    messages.push({
      role: "user",
      content: [
        {
          type: "text",
          text: `Please ${
            type === "roast" ? "roast" : "compliment"
          } the person in this image. Focus on visible features and the overall vibe of the image.`,
        },
        {
          type: "image_url",
          image_url: {
            url: imageUrl,
            detail: "high",
          },
        },
      ],
    });
  } else if (inputType === "text" && text) {
    messages.push({
      role: "user",
      content: `Please ${
        type === "roast" ? "roast" : "compliment"
      } me based on this description: ${text}`,
    });
  } else {
    throw new Error("Invalid input configuration");
  }

  console.log("messages", messages);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: messages as any,
      max_tokens: 1000,
      temperature: 0.9,
      presence_penalty: 0.6,
      frequency_penalty: 0.6,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response generated");
    }

    return response;
  } catch (error) {
    console.error("Error generating response:", error);
    throw new Error("Failed to generate response");
  }
}
