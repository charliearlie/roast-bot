"use client";

import { useState } from "react";
import { ImageUpload } from "./components/ImageUpload";
import { Button } from "./components/ui/Button";
import { Toggle } from "./components/ui/Toggle";
import { ToneSelection } from "./components/ToneSelection";
import { MemeOutput } from "./components/MemeOutput";
import { PROMPT_QUESTIONS } from "./lib/constants";
import { generateContent } from "./lib/api";
import { ToneSeverity, ToneStyle } from "./lib/openai";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import { SelfieUpload } from "./components/SelfieUpload";
import { PromptQuestions } from "./components/PromptQuestions";
import { getFollowUpPrompts } from "./lib/prompts";
import { FeedbackButtons } from "./components/FeedbackButtons";

type InputMode = "selfie" | "prompts";
type OutputMode = "roast" | "compliment";

export default function Home() {
  const [inputMode, setInputMode] = useState<InputMode>("selfie");
  const [outputMode, setOutputMode] = useState<OutputMode>("roast");
  const [response, setResponse] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toneSeverity, setToneSeverity] = useState<ToneSeverity>("medium");
  const [toneStyle, setToneStyle] = useState<ToneStyle>("sarcastic");
  const [showMemeOptions, setShowMemeOptions] = useState(false);
  const [showMemeOutput, setShowMemeOutput] = useState(false);
  const [followUpPrompts, setFollowUpPrompts] = useState<string[]>([
    "Make it more brutal",
    "Add a comeback",
    "Make it funnier",
    "Add a plot twist",
  ]);
  const [contentId] = useState(() => Math.random().toString(36).substr(2, 9));
  const [lastUsedPrompt, setLastUsedPrompt] = useState<string | undefined>();

  const handleImageUpload = (imageData: string) => {
    setCurrentImage(imageData);
    setError(null);

    // Reset form if image is cleared
    if (!imageData) {
      setResponse(null);
      setShowMemeOptions(false);
      setShowMemeOutput(false);
      // Reset to default tone settings
      setToneSeverity("medium");
      setToneStyle("sarcastic");
    }
  };

  const handleAnswersSubmit = (newAnswers: Record<string, string>) => {
    setAnswers(newAnswers);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setShowMemeOptions(false);
      setShowMemeOutput(false);
      setLastUsedPrompt(undefined);

      const result = await generateContent({
        type: outputMode,
        inputType: inputMode === "selfie" ? "image" : "text",
        imageData: currentImage || undefined,
        text:
          inputMode === "prompts"
            ? Object.values(answers).join("\n")
            : undefined,
        severity: toneSeverity,
        style: toneStyle,
      });

      if (result.generatedText) {
        setResponse(result.generatedText);
        setShowMemeOptions(true);
        const suggestions = getFollowUpPrompts(
          outputMode,
          toneSeverity,
          toneStyle
        );
        setFollowUpPrompts(suggestions.map((s) => s.text));
      } else {
        throw new Error("No response received from the server");
      }
    } catch (err) {
      console.error("Error generating response:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate response"
      );
      setResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpPrompt = async (prompt: string) => {
    if (!response) return;

    try {
      setIsLoading(true);
      setError(null);
      setShowMemeOptions(false);
      setShowMemeOutput(false);
      setLastUsedPrompt(prompt);

      const result = await generateContent({
        type: outputMode,
        inputType: "text",
        text: `${response}\n\nFollow-up: ${prompt}`,
        severity: toneSeverity,
        style: toneStyle,
      });

      if (result.generatedText) {
        setResponse(result.generatedText);
        setShowMemeOptions(true);
      } else {
        throw new Error("No response received from the server");
      }
    } catch (err) {
      console.error("Error generating follow-up:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate follow-up"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isValid =
    inputMode === "selfie"
      ? !!currentImage
      : Object.values(answers).every((answer) => answer.trim().length > 0);

  return (
    <main className="container mx-auto px-4 py-8">
      <ErrorBoundary>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Content Container */}
          <div className="w-full max-w-2xl bg-secondary-background p-8 border-4 border-border shadow-shadow">
            {/* Headers */}
            <div className="text-center mb-12">
              <h1 className="text-6xl font-extrabold mb-4 text-foreground hover:rotate-1 transition-transform">
                Roast Me
              </h1>
              <h2 className="text-2xl text-foreground/80">or compliment me</h2>
            </div>

            {/* Mode Toggle */}
            <div className="mb-8 flex justify-center">
              <Toggle
                pressed={inputMode === "prompts"}
                onPressedChange={(pressed) =>
                  setInputMode(pressed ? "prompts" : "selfie")
                }
              >
                {inputMode === "prompts" ? "Answer Prompts" : "Upload Selfie"}
              </Toggle>
            </div>

            {/* Input Section */}
            <div className="w-full space-y-6">
              {inputMode === "selfie" ? (
                <ErrorBoundary>
                  <SelfieUpload
                    onUpload={handleImageUpload}
                    currentImage={currentImage}
                  />
                </ErrorBoundary>
              ) : (
                <ErrorBoundary>
                  <PromptQuestions onAnswersChange={handleAnswersSubmit} />
                </ErrorBoundary>
              )}

              {/* Tone Selection */}
              <ToneSelection
                severity={toneSeverity}
                style={toneStyle}
                onChange={(severity, style) => {
                  setToneSeverity(severity);
                  setToneStyle(style as ToneStyle);
                }}
              />

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => {
                    setOutputMode("roast");
                    handleSubmit();
                  }}
                  disabled={!isValid || isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    "Roast Me"
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setOutputMode("compliment");
                    handleSubmit();
                  }}
                  disabled={!isValid || isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    "Compliment Me"
                  )}
                </Button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="w-full p-4 bg-red-100 border-2 border-red-500 text-red-700 rounded flex items-center gap-2">
                  <span className="flex-1">{error}</span>
                  <Button
                    onClick={() => setError(null)}
                    variant="secondary"
                    size="sm"
                  >
                    Dismiss
                  </Button>
                </div>
              )}

              {/* Response Section */}
              {isLoading ? (
                <div className="w-full min-h-[100px] bg-background p-6 border-4 border-border shadow-shadow flex flex-col items-center justify-center">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-lg font-semibold text-gray-500">
                    Generating your response...
                  </p>
                </div>
              ) : response ? (
                <div className="w-full space-y-6">
                  <div className="w-full bg-background p-6 border-4 border-border shadow-shadow">
                    <p className="text-xl font-bold text-center">{response}</p>

                    {/* Add Feedback Buttons */}
                    <div className="mt-6">
                      <FeedbackButtons
                        contentId={contentId}
                        type={outputMode}
                        promptUsed={lastUsedPrompt}
                      />
                    </div>
                  </div>

                  {/* Follow-up Options */}
                  <div className="flex flex-wrap gap-4 justify-center">
                    {getFollowUpPrompts(
                      outputMode,
                      toneSeverity,
                      toneStyle
                    ).map((prompt) => (
                      <Button
                        key={prompt.text}
                        onClick={() => handleFollowUpPrompt(prompt.text)}
                        variant="secondary"
                        disabled={isLoading}
                        className="flex items-center gap-2 group relative"
                        title={prompt.description}
                      >
                        {isLoading ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            {prompt.text}
                            {prompt.description && (
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {prompt.description}
                              </span>
                            )}
                          </>
                        )}
                      </Button>
                    ))}
                  </div>

                  {/* Meme Generation Option */}
                  {showMemeOptions && (
                    <div className="flex flex-col items-center gap-4 mt-8">
                      <Button
                        onClick={() => setShowMemeOutput(true)}
                        variant="secondary"
                        className="flex items-center gap-2"
                      >
                        {showMemeOutput ? "Hide Meme" : "Turn this into a Meme"}
                      </Button>
                      {showMemeOutput && (
                        <ErrorBoundary>
                          <MemeOutput
                            prompt={response}
                            customImageUrl={currentImage || undefined}
                            type={outputMode}
                          />
                        </ErrorBoundary>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full min-h-[100px] bg-background p-6 border-4 border-border shadow-shadow">
                  <p className="text-center text-gray-500">
                    Your {outputMode} will appear here...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </main>
  );
}
