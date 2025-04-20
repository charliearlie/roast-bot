import { NextRequest } from "next/server";
import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";
import { z } from "zod";
import { LRUCache } from "lru-cache";

// Configure image cache
const imageCache = new LRUCache<string, Buffer>({
  max: 100, // Maximum number of items
  ttl: 1000 * 60 * 60, // 1 hour TTL
});

// Register Poppins font for server-side rendering
registerFont(path.join(process.cwd(), "public/fonts/Poppins-Bold.ttf"), {
  family: "Poppins",
  weight: "bold",
});

const requestSchema = z.object({
  text: z.string().max(500), // Add max length validation
  type: z.enum(["roast", "compliment"]),
  imageData: z.string().optional(),
  template: z.string().optional(), // Add template selection
});

const defaultTemplates = {
  roast: path.join(process.cwd(), "public/meme-templates/roast-template.jpg"),
  compliment: path.join(
    process.cwd(),
    "public/meme-templates/compliment-template.jpg"
  ),
};

// Helper function to optimize image dimensions
function optimizeImageDimensions(
  width: number,
  height: number,
  maxWidth = 1200,
  maxHeight = 1200
) {
  let newWidth = width;
  let newHeight = height;

  // Maintain minimum dimensions for quality
  const minDimension = 400;
  if (width < minDimension && height < minDimension) {
    const scale = minDimension / Math.min(width, height);
    newWidth = width * scale;
    newHeight = height * scale;
  }

  const aspectRatio = width / height;

  // Scale down if too large
  if (width > maxWidth) {
    newWidth = maxWidth;
    newHeight = maxWidth / aspectRatio;
  }

  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = maxHeight * aspectRatio;
  }

  // Ensure dimensions are multiples of 2 for better compression
  return {
    width: Math.floor(newWidth / 2) * 2,
    height: Math.floor(newHeight / 2) * 2,
  };
}

// Helper function to determine if an image needs optimization
function shouldOptimizeImage(width: number, height: number): boolean {
  const totalPixels = width * height;
  const maxPixels = 1440 * 1440; // ~2MP
  return totalPixels > maxPixels;
}

// Helper function for retrying operations
async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === maxAttempts) break;

      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 1.5; // Exponential backoff
    }
  }

  throw lastError;
}

// Helper function to validate image data
async function validateImage(img: any): Promise<void> {
  if (!img || !img.width || !img.height) {
    throw new Error("Invalid image data");
  }

  if (img.width < 50 || img.height < 50) {
    throw new Error("Image dimensions too small");
  }

  if (img.width > 5000 || img.height > 5000) {
    throw new Error("Image dimensions too large");
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let validatedData;
    try {
      validatedData = requestSchema.parse(body);
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details:
            error instanceof Error ? error.message : "Unknown validation error",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { text, type, imageData, template } = validatedData;

    // Generate cache key and check cache
    const cacheKey = `${text}-${type}-${imageData?.slice(0, 50) || "default"}-${
      template || "default"
    }`;

    const cachedImage = imageCache.get(cacheKey);
    if (cachedImage) {
      return new Response(
        JSON.stringify({
          imageUrl: `data:image/png;base64,${cachedImage.toString("base64")}`,
          fromCache: true,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Load and validate image with retries
    const img = await retry(async () => {
      const loadedImg = await loadImage(
        imageData || template || defaultTemplates[type]
      ).catch(() => null);

      if (!loadedImg) {
        // Fallback to default template
        return await loadImage(defaultTemplates[type]);
      }

      await validateImage(loadedImg);
      return loadedImg;
    });

    // Process image dimensions
    const needsOptimization = shouldOptimizeImage(img.width, img.height);
    const { width, height } = needsOptimization
      ? optimizeImageDimensions(img.width, img.height)
      : { width: img.width, height: img.height };

    // Create canvas and render with error recovery
    let buffer: Buffer;
    try {
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Apply image rendering settings
      ctx.imageSmoothingEnabled = true;

      // Draw and process image with error checking
      try {
        ctx.save();
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = "lighter";
        ctx.drawImage(img, 0, 0, width, height);
        ctx.restore();
      } catch (error) {
        console.error("Error drawing image:", error);
        // Reset canvas and try simpler drawing
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
      }

      // Add subtle vignette effect for better text contrast
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) / 1.5
      );
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.3)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Configure text style with improved readability
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = Math.max(4, width / 200); // Responsive stroke width
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Calculate responsive font size based on text length and canvas size
      const baseSize = Math.min(width, height) / 15;
      const textLength = text.length;
      const lengthFactor = Math.max(0.6, 1 - textLength / 200);
      const fontSize = Math.max(16, Math.min(48, baseSize * lengthFactor));
      ctx.font = `bold ${fontSize}px 'Poppins'`;

      // Improved text wrapping with better spacing and dynamic line width
      const words = text.split(" ");
      const lines: string[] = [];
      let currentLine = "";
      const maxLineWidth = width * (height > width ? 0.85 : 0.75); // Adjust width based on aspect ratio
      const maxLines = Math.min(10, Math.floor(height / (fontSize * 1.2))); // Dynamic max lines based on height

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxLineWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;

          if (lines.length >= maxLines - 1) {
            // Add ellipsis only if there are more words to come
            if (words.indexOf(word) < words.length - 1) {
              currentLine += "...";
            }
            break;
          }
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }

      // Calculate optimal text position based on image content
      const lineHeight = fontSize * 1.4;
      const totalTextHeight = lines.length * lineHeight;
      const verticalPadding = height * 0.1; // 10% padding

      // Position text in the upper third for portrait images, center for landscape
      const isPortrait = height > width;
      let y = isPortrait
        ? verticalPadding + height * 0.15 // Upper third for portrait
        : (height - totalTextHeight) / 2; // Center for landscape

      // Draw text with improved shadow and outline
      lines.forEach((line) => {
        // Enhanced shadow for better depth
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = fontSize * 0.15;
        ctx.shadowOffsetX = fontSize * 0.08;
        ctx.shadowOffsetY = fontSize * 0.08;

        // Thicker outline for better readability
        ctx.lineWidth = Math.max(4, fontSize * 0.15);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.9)";
        ctx.strokeText(line, width / 2, y + lineHeight / 2);

        // Reset shadow for crisp fill
        ctx.shadowColor = "transparent";
        ctx.fillStyle = "white";
        ctx.fillText(line, width / 2, y + lineHeight / 2);

        y += lineHeight;
      });

      // Add subtle text background for improved readability
      const textBackgroundHeight = totalTextHeight + fontSize;
      const textBackgroundY = isPortrait
        ? verticalPadding
        : (height - textBackgroundHeight) / 2;

      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(0, textBackgroundY, width, textBackgroundHeight);

      // Add watermark with improved styling
      const watermarkSize = Math.max(12, fontSize * 0.4);
      ctx.font = `${watermarkSize}px 'Poppins'`;
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
      ctx.lineWidth = Math.max(2, width / 400);

      const watermark = "RoastBot.app";
      const padding = Math.max(10, width / 80);
      ctx.strokeText(watermark, width - padding, height - padding);
      ctx.fillText(watermark, width - padding, height - padding);

      // Generate buffer with error handling
      buffer = await retry(() =>
        Promise.resolve(
          canvas.toBuffer("image/png", {
            compressionLevel: 8,
            filters: 0,
            resolution: 72,
          })
        )
      );

      // Cache the result
      imageCache.set(cacheKey, buffer);
    } catch (error) {
      console.error("Error generating meme:", error);
      throw new Error("Failed to generate meme image");
    }

    return new Response(
      JSON.stringify({
        imageUrl: `data:image/png;base64,${buffer.toString("base64")}`,
        fromCache: false,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Meme generation error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to generate meme",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
