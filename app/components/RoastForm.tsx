import { useState } from "react";
import { Button } from "./ui/Button";
import { Switch } from "./ui/Switch";
import { SelfieUpload } from "./SelfieUpload";
import { PromptQuestions } from "./PromptQuestions";
import { ToneSelection } from "./ToneSelection";
import { ErrorBoundary } from "./ui/ErrorBoundary";
import { LoadingSpinner } from "./ui/LoadingSpinner";

interface RoastFormProps {
  isRoast: boolean;
  onComplete: (response: string) => void;
}

export function RoastForm({ isRoast, onComplete }: RoastFormProps) {
  const [useImage, setUseImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [toneSeverity, setToneSeverity] = useState<
    "mild" | "medium" | "nuclear"
  >("medium");
  const [toneStyle, setToneStyle] = useState<
    "formal" | "sarcastic" | "shakespearean" | "rapBattle"
  >("sarcastic");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
  };

  const handleAnswersChange = (newAnswers: Record<string, string>) => {
    setAnswers(newAnswers);
  };

  const handleToneChange = (
    severity: typeof toneSeverity,
    style: typeof toneStyle
  ) => {
    setToneSeverity(severity);
    setToneStyle(style);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("severity", toneSeverity);
      console.log("style", toneStyle);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: isRoast ? "roast" : "compliment",
          inputType: useImage ? "image" : "text",
          text: !useImage ? Object.values(answers).join("\n") : undefined,
          imageUrl: useImage ? imageUrl : undefined,
          severity: toneSeverity,
          style: toneStyle,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate response");
      }

      const data = await response.json();
      onComplete(data.response);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(
        error instanceof Error ? error.message : "Failed to generate response"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = useImage
    ? !!imageUrl
    : Object.values(answers).every((answer) => answer.trim().length > 0);

  return (
    <ErrorBoundary>
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between p-4 bg-background border-4 border-black shadow-neo rounded-lg">
          <span className="font-bold">Use Selfie</span>
          <Switch
            id="use-image"
            checked={useImage}
            onCheckedChange={setUseImage}
          />
        </div>

        {useImage ? (
          <SelfieUpload onUpload={handleImageUpload} />
        ) : (
          <PromptQuestions onAnswersChange={handleAnswersChange} />
        )}

        <ToneSelection
          severity={toneSeverity}
          style={toneStyle}
          onChange={handleToneChange}
        />

        {error && (
          <div className="p-4 bg-red-100 border-2 border-red-500 text-red-700 rounded flex items-center gap-2">
            <span className="flex-1">{error}</span>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          className="w-full relative"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <LoadingSpinner size="sm" />
              <span>Generating...</span>
            </div>
          ) : (
            `Generate ${isRoast ? "Roast" : "Compliment"}`
          )}
        </Button>
      </div>
    </ErrorBoundary>
  );
}
