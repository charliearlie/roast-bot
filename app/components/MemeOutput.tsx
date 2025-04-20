import { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { toast } from "sonner";
import { TemplateSelector } from "./TemplateSelector";
import {
  MemeTemplate,
  getDefaultTemplateForType,
  getTemplatesForType,
} from "../lib/templates";
import { ErrorBoundary } from "./ui/ErrorBoundary";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { generateMeme, trackShare } from "../lib/api";
import { Card } from "./ui/Card";
import { Skeleton } from "./ui/Skeleton";
import { ShareButtons } from "./ShareButtons";
import { cn } from "@/lib/utils";

interface MemeOutputProps {
  type: "roast" | "compliment";
  customImageUrl?: string;
  prompt: string;
  onRetry?: () => void;
}

interface ShareAnalytics {
  shares: number;
  likes: number;
  isViral: boolean;
}

export function MemeOutput({
  type,
  customImageUrl,
  prompt,
  onRetry,
}: MemeOutputProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate>(
    getDefaultTemplateForType(type)
  );
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<ShareAnalytics>({
    shares: 0,
    likes: 0,
    isViral: false,
  });
  const [previewMode, setPreviewMode] = useState<"template" | "result">(
    "template"
  );
  const [previewText, setPreviewText] = useState<string | null>(null);

  useEffect(() => {
    // Reset when type changes
    setSelectedTemplate(getDefaultTemplateForType(type));
    setGeneratedImage(null);
    setError(null);
    setPreviewText(prompt);
  }, [type, prompt]);

  const generateMemeWithRetry = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("we're using this one", selectedTemplate);
      const templatePath =
        customImageUrl || `/templates/${selectedTemplate.filename}`;
      const response = await fetch("/api/generate-meme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: templatePath,
          prompt,
          type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate meme");
      }

      const data = await response.json();
      setGeneratedImage(data.imageUrl);
      setPreviewMode("result");

      // Simulate some analytics for demo
      const newAnalytics = {
        shares: Math.floor(Math.random() * 100),
        likes: Math.floor(Math.random() * 200),
        isViral: Math.random() > 0.8,
      };
      setAnalytics(newAnalytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (previewMode === "result") {
      generateMemeWithRetry();
    }
  }, [selectedTemplate, customImageUrl, prompt, previewMode]);

  if (!customImageUrl) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Choose a Template</h3>
          {error && (
            <Button
              variant="secondary"
              onClick={generateMemeWithRetry}
              size="sm"
            >
              Try Again
            </Button>
          )}
        </div>

        <TemplateSelector
          type={type}
          selectedId={selectedTemplate.id}
          onSelect={setSelectedTemplate}
        />

        {/* Preview Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Preview</h3>
            <div className="flex gap-2">
              <Button
                variant={previewMode === "template" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setPreviewMode("template")}
              >
                Template
              </Button>
              <Button
                variant={previewMode === "result" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setPreviewMode("result")}
                disabled={!selectedTemplate}
              >
                Generate
              </Button>
            </div>
          </div>

          {previewMode === "template" ? (
            <div className="relative aspect-video bg-background border-4 border-border rounded-lg overflow-hidden">
              <img
                src={`/meme-templates/${selectedTemplate.filename}`}
                alt={selectedTemplate.name}
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-background/80 p-4 rounded-lg max-w-md text-center">
                  <p className="text-sm font-medium">
                    {previewText || "Your text will appear here"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {isLoading && (
                <Card className="p-4">
                  <Skeleton className="h-[300px] w-full" />
                </Card>
              )}

              {error && (
                <Card className="p-4 text-center text-red-500">{error}</Card>
              )}

              {generatedImage && !isLoading && !error && (
                <div className="space-y-4">
                  <Card
                    className={cn(
                      "p-4 relative overflow-hidden",
                      analytics.isViral && "border-2 border-yellow-400"
                    )}
                  >
                    {analytics.isViral && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-sm font-medium">
                        Viral! 🔥
                      </div>
                    )}
                    <img
                      src={generatedImage}
                      alt="Generated Meme"
                      className="w-full h-auto rounded-lg"
                    />
                  </Card>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {analytics.shares} shares • {analytics.likes} likes
                    </div>
                    <ShareButtons imageUrl={generatedImage} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isLoading && (
        <Card className="p-4">
          <Skeleton className="h-[300px] w-full" />
        </Card>
      )}

      {error && (
        <Card className="p-4 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={generateMemeWithRetry}>Try Again</Button>
        </Card>
      )}

      {generatedImage && !isLoading && !error && (
        <div className="space-y-4">
          <Card
            className={cn(
              "p-4 relative overflow-hidden",
              analytics.isViral && "border-2 border-yellow-400"
            )}
          >
            {analytics.isViral && (
              <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-sm font-medium">
                Viral! 🔥
              </div>
            )}
            <img
              src={generatedImage}
              alt="Generated Meme"
              className="w-full h-auto rounded-lg"
            />
          </Card>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {analytics.shares} shares • {analytics.likes} likes
            </div>
            <ShareButtons imageUrl={generatedImage} />
          </div>
        </div>
      )}
    </div>
  );
}
