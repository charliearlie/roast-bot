import { NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import {
  processImage,
  ImageProcessingError,
  validateImageSize,
} from "@/app/lib/image-processing";

// Validation schema for the request body
const templateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["custom", "imgflip"]),
  tags: z.array(z.string()),
  boxCount: z.number().int().min(1),
  captions: z.array(z.string()),
  imageData: z.string().startsWith("data:image/"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = templateSchema.parse(body);

    // Validate and process the image
    try {
      const processedImage = await processImage(validatedData.imageData, {
        maxWidth: 800,
        maxHeight: 600,
        quality: 80,
        minDimension: 200,
      });

      validateImageSize(processedImage.metadata.size);

      // Generate a unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")}.jpg`;
      const filePath = path.join(
        process.cwd(),
        "public/meme-templates",
        filename
      );

      // Save the processed image
      await fs.writeFile(filePath, processedImage.buffer);

      // TODO: Save template metadata to database
      const template = {
        ...validatedData,
        filename,
        width: processedImage.metadata.width,
        height: processedImage.metadata.height,
        imageData: undefined, // Remove the base64 data from the response
      };

      return NextResponse.json({ success: true, template });
    } catch (error) {
      if (error instanceof ImageProcessingError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Template upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process template" },
      { status: 500 }
    );
  }
}
