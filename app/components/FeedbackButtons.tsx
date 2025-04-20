import { useState } from "react";
import { Button } from "./ui/Button";
import { toast } from "sonner";

interface FeedbackButtonsProps {
  contentId: string;
  type: "roast" | "compliment";
  promptUsed?: string;
}

type Reaction = "love" | "funny" | "meh" | "bad";

export function FeedbackButtons({
  contentId,
  type,
  promptUsed,
}: FeedbackButtonsProps) {
  const [selectedReaction, setSelectedReaction] = useState<Reaction | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reactions: { type: Reaction; emoji: string; label: string }[] = [
    { type: "love", emoji: "❤️", label: "Love it!" },
    { type: "funny", emoji: "😂", label: "Hilarious" },
    { type: "meh", emoji: "😐", label: "Meh" },
    { type: "bad", emoji: "👎", label: "Not good" },
  ];

  const handleReaction = async (reaction: Reaction) => {
    try {
      setIsSubmitting(true);

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId,
          type,
          reaction,
          promptUsed,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      setSelectedReaction(reaction);
      toast.success("Thanks for your feedback!");
    } catch (err) {
      console.error("Error submitting feedback:", err);
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm text-gray-500">How was this {type}?</p>
      <div className="flex gap-2">
        {reactions.map(({ type, emoji, label }) => (
          <Button
            key={type}
            onClick={() => handleReaction(type)}
            disabled={isSubmitting || selectedReaction === type}
            variant={selectedReaction === type ? "primary" : "secondary"}
            size="sm"
            className="flex items-center gap-1 min-w-[80px] justify-center"
          >
            <span className="text-lg">{emoji}</span>
            <span className="text-sm">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
