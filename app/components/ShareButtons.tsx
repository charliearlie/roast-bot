import { toast } from "sonner";
import { Button } from "./ui/Button";

interface ShareButtonsProps {
  imageUrl: string;
}

export function ShareButtons({ imageUrl }: ShareButtonsProps) {
  const handleShare = async (platform: "twitter" | "facebook" | "copy") => {
    const shareText = `Check out my meme from RoastBot! 🤖`;
    const shareUrl = window.location.href;

    try {
      switch (platform) {
        case "twitter":
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(
              shareText
            )}&url=${encodeURIComponent(shareUrl)}`,
            "_blank"
          );
          break;
        case "facebook":
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              shareUrl
            )}&quote=${encodeURIComponent(shareText)}`,
            "_blank"
          );
          break;
        case "copy":
          await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
          toast.success("Link copied to clipboard!");
          break;
      }
    } catch (err) {
      console.error("Error sharing:", err);
      toast.error("Failed to share. Please try again.");
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `roastbot-meme-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Meme saved successfully!");
    } catch (err) {
      console.error("Error saving meme:", err);
      toast.error("Failed to save meme. Please try again.");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={handleSave} variant="secondary" size="sm">
        Save Image
      </Button>
      <Button
        onClick={() => handleShare("twitter")}
        variant="secondary"
        size="sm"
      >
        Share on Twitter
      </Button>
      <Button
        onClick={() => handleShare("facebook")}
        variant="secondary"
        size="sm"
      >
        Share on Facebook
      </Button>
      <Button onClick={() => handleShare("copy")} variant="secondary" size="sm">
        Copy Link
      </Button>
    </div>
  );
}
