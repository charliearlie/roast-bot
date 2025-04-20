import { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { submitFeedback, getFeedbackStats } from "../lib/services/feedback";

interface RoastFeedbackProps {
  roastId: string;
}

interface FeedbackStats {
  likes: number;
  dislikes: number;
}

export function RoastFeedback({ roastId }: RoastFeedbackProps) {
  const [reaction, setReaction] = useState<"like" | "dislike" | null>(null);
  const [suggestion, setSuggestion] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<FeedbackStats>({ likes: 0, dislikes: 0 });

  useEffect(() => {
    loadFeedbackStats();
  }, [roastId]);

  const loadFeedbackStats = async () => {
    const result = await getFeedbackStats(roastId);
    if (result.success && result.data) {
      setStats(result.data);
    }
  };

  const handleReactionClick = async (newReaction: "like" | "dislike") => {
    setIsLoading(true);
    const updatedReaction = reaction === newReaction ? null : newReaction;
    setReaction(updatedReaction);

    const result = await submitFeedback({
      roastId,
      reaction: updatedReaction,
    });

    if (result.success) {
      await loadFeedbackStats();
    } else {
      // Revert on error
      setReaction(reaction);
    }
    setIsLoading(false);
  };

  const handleSuggestionSubmit = async () => {
    if (suggestion.trim()) {
      setIsLoading(true);
      const result = await submitFeedback({
        roastId,
        reaction,
        suggestion: suggestion.trim(),
      });

      if (result.success) {
        setSuggestion("");
        setShowSuggestion(false);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border-4 border-black shadow-neo bg-white rounded-lg">
      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={() => handleReactionClick("like")}
          disabled={isLoading}
          className={`transform hover:-rotate-6 ${
            reaction === "like" ? "bg-green-500 text-white" : "bg-white"
          }`}
        >
          👍 Like ({stats.likes})
        </Button>
        <Button
          onClick={() => handleReactionClick("dislike")}
          disabled={isLoading}
          className={`transform hover:rotate-6 ${
            reaction === "dislike" ? "bg-red-500 text-white" : "bg-white"
          }`}
        >
          👎 Dislike ({stats.dislikes})
        </Button>
      </div>

      {!showSuggestion ? (
        <Button
          onClick={() => setShowSuggestion(true)}
          disabled={isLoading}
          className="w-full bg-white hover:bg-gray-100"
        >
          💡 Add Suggestion
        </Button>
      ) : (
        <div className="space-y-2">
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="How can we improve this roast?"
            disabled={isLoading}
            className="w-full p-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSuggestionSubmit}
              disabled={!suggestion.trim() || isLoading}
              className="flex-1 bg-black text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isLoading ? "Submitting..." : "Submit"}
            </Button>
            <Button
              onClick={() => {
                setShowSuggestion(false);
                setSuggestion("");
              }}
              disabled={isLoading}
              className="flex-1 bg-white hover:bg-gray-100"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
