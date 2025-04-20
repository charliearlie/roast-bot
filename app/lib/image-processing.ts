import sharp from "sharp";

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface ProcessedImage {
  buffer: Buffer;
  metadata: ImageMetadata;
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  preserveFormat?: boolean;
  minDimension?: number;
}

const DEFAULT_OPTIONS: Required<ImageProcessingOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 85,
  preserveFormat: false,
  minDimension: 200,
};

export class ImageProcessingError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "ImageProcessingError";
  }
}

export async function processImage(
  input: Buffer | string,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> {
  try {
    // Merge options with defaults
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Handle base64 input
    let buffer: Buffer;
    if (typeof input === "string") {
      const base64Data = input.split(";base64,").pop();
      if (!base64Data) {
        throw new ImageProcessingError("Invalid base64 image data");
      }
      buffer = Buffer.from(base64Data, "base64");
    } else {
      buffer = input;
    }

    // Create sharp instance and get metadata
    const image = sharp(buffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height || !metadata.format) {
      throw new ImageProcessingError("Invalid image metadata");
    }

    // Validate minimum dimensions
    if (
      metadata.width < opts.minDimension ||
      metadata.height < opts.minDimension
    ) {
      throw new ImageProcessingError(
        `Image dimensions too small. Minimum ${opts.minDimension}px required.`
      );
    }

    // Calculate target dimensions while preserving aspect ratio
    const aspectRatio = metadata.width / metadata.height;
    let targetWidth = metadata.width;
    let targetHeight = metadata.height;

    if (targetWidth > opts.maxWidth) {
      targetWidth = opts.maxWidth;
      targetHeight = Math.round(targetWidth / aspectRatio);
    }

    if (targetHeight > opts.maxHeight) {
      targetHeight = opts.maxHeight;
      targetWidth = Math.round(targetHeight * aspectRatio);
    }

    // Process the image
    let processedImage = image.resize(targetWidth, targetHeight, {
      fit: "inside",
      withoutEnlargement: true,
    });

    // Format-specific optimizations
    if (opts.preserveFormat && metadata.format) {
      switch (metadata.format.toLowerCase()) {
        case "jpeg":
        case "jpg":
          processedImage = processedImage.jpeg({ quality: opts.quality });
          break;
        case "png":
          processedImage = processedImage.png({
            compressionLevel: 9,
            palette: true,
          });
          break;
        case "webp":
          processedImage = processedImage.webp({ quality: opts.quality });
          break;
        default:
          processedImage = processedImage.jpeg({ quality: opts.quality });
      }
    } else {
      // Default to JPEG for best compression
      processedImage = processedImage.jpeg({ quality: opts.quality });
    }

    // Get the processed buffer
    const outputBuffer = await processedImage.toBuffer();
    const outputMetadata = await sharp(outputBuffer).metadata();

    return {
      buffer: outputBuffer,
      metadata: {
        width: outputMetadata.width || targetWidth,
        height: outputMetadata.height || targetHeight,
        format: outputMetadata.format || "jpeg",
        size: outputBuffer.length,
      },
    };
  } catch (error) {
    if (error instanceof ImageProcessingError) {
      throw error;
    }
    throw new ImageProcessingError("Failed to process image", error);
  }
}

export function validateImageSize(size: number, maxSizeInMB: number = 5): void {
  const maxBytes = maxSizeInMB * 1024 * 1024;
  if (size > maxBytes) {
    throw new ImageProcessingError(`Image size exceeds ${maxSizeInMB}MB limit`);
  }
}
