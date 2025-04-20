import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface FeedbackData {
  roastId: string;
  reaction?: "like" | "dislike" | null;
  suggestion?: string;
}

export async function submitFeedback({
  roastId,
  reaction,
  suggestion,
}: FeedbackData) {
  try {
    // Get the current user's feedback for this roast
    const { data: existingFeedback } = await supabase
      .from("feedback")
      .select("id, reaction")
      .eq("roast_id", roastId)
      .single();

    if (existingFeedback) {
      // Update existing feedback
      if (!reaction && !suggestion) {
        // If removing reaction and no suggestion, delete the feedback
        const { error } = await supabase
          .from("feedback")
          .delete()
          .eq("id", existingFeedback.id);

        if (error) throw error;
      } else {
        // Update the feedback
        const { error } = await supabase
          .from("feedback")
          .update({
            reaction: reaction || existingFeedback.reaction,
            suggestion: suggestion || null,
          })
          .eq("id", existingFeedback.id);

        if (error) throw error;
      }
    } else if (reaction || suggestion) {
      // Create new feedback only if there's a reaction or suggestion
      const { error } = await supabase.from("feedback").insert({
        roast_id: roastId,
        reaction,
        suggestion,
      });

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return { success: false, error };
  }
}

export async function getFeedback(roastId: string) {
  try {
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("roast_id", roastId);

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Error getting feedback:", error);
    return { success: false, error };
  }
}

export async function getFeedbackStats(roastId: string) {
  try {
    const { data, error } = await supabase
      .from("feedback")
      .select("reaction")
      .eq("roast_id", roastId);

    if (error) throw error;

    const stats = {
      likes: data?.filter((f) => f.reaction === "like").length || 0,
      dislikes: data?.filter((f) => f.reaction === "dislike").length || 0,
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error getting feedback stats:", error);
    return { success: false, error };
  }
}
