import { NextRequest } from "next/server";
import { z } from "zod";

const shareSchema = z.object({
  type: z.enum(["roast", "compliment"]),
  platform: z.enum(["twitter", "facebook", "copy"]),
  memeId: z.string().optional(),
});

// In-memory analytics store (replace with proper database in production)
let shareAnalytics = {
  twitter: { roast: 0, compliment: 0 },
  facebook: { roast: 0, compliment: 0 },
  copy: { roast: 0, compliment: 0 },
  total: 0,
  viralThreshold: 100,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, platform, memeId } = shareSchema.parse(body);

    // Update analytics
    shareAnalytics[platform][type]++;
    shareAnalytics.total++;

    // Check if we've hit viral threshold
    const isViral = shareAnalytics.total >= shareAnalytics.viralThreshold;

    return new Response(
      JSON.stringify({
        success: true,
        analytics: {
          platform: shareAnalytics[platform],
          total: shareAnalytics.total,
          isViral,
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error tracking share:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to track share",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
      }
    );
  }
}

// GET endpoint to retrieve analytics
export async function GET() {
  return new Response(JSON.stringify({ analytics: shareAnalytics }), {
    headers: { "Content-Type": "application/json" },
  });
}
