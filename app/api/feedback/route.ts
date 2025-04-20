import { NextRequest } from "next/server";
import { z } from "zod";

const feedbackSchema = z.object({
  contentId: z.string(),
  type: z.enum(["roast", "compliment"]),
  reaction: z.enum(["love", "funny", "meh", "bad"]),
  promptUsed: z.string().optional(),
});

// In-memory analytics store (replace with proper database in production)
interface FeedbackStore {
  reactions: Record<string, number>;
  prompts: Record<string, { uses: number; reactions: Record<string, number> }>;
  total: number;
}

let feedbackStore: FeedbackStore = {
  reactions: {
    love: 0,
    funny: 0,
    meh: 0,
    bad: 0,
  },
  prompts: {},
  total: 0,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId, type, reaction, promptUsed } =
      feedbackSchema.parse(body);

    // Update analytics
    feedbackStore.reactions[reaction]++;
    feedbackStore.total++;

    // Track prompt usage if provided
    if (promptUsed) {
      if (!feedbackStore.prompts[promptUsed]) {
        feedbackStore.prompts[promptUsed] = {
          uses: 0,
          reactions: { love: 0, funny: 0, meh: 0, bad: 0 },
        };
      }
      feedbackStore.prompts[promptUsed].uses++;
      feedbackStore.prompts[promptUsed].reactions[reaction]++;
    }

    // Log analytics for monitoring (replace with proper analytics in production)
    console.log("Feedback received:", {
      contentId,
      type,
      reaction,
      promptUsed,
    });
    console.log("Current analytics:", feedbackStore);

    return new Response(
      JSON.stringify({
        success: true,
        analytics: {
          reactions: feedbackStore.reactions,
          total: feedbackStore.total,
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing feedback:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process feedback",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}
