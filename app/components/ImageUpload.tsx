"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { validateImageFile } from "../lib/utils";
import { MAX_IMAGE_SIZE_MB, SUPPORTED_IMAGE_TYPES } from "../lib/constants";

interface ImageUploadProps {
  onImageUpload: (imageData: string) => void;
}

export function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file
      const validationError = validateImageFile(file, MAX_IMAGE_SIZE_MB);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setIsLoading(true);

      try {
        // Create preview and notify parent
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageData = reader.result as string;
          setPreview(imageData);
          onImageUpload(imageData);
          setIsLoading(false);
        };
        reader.onerror = () => {
          setError("Failed to read the image file. Please try again.");
          setIsLoading(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setError(
          "An error occurred while processing the image. Please try again."
        );
        setIsLoading(false);
      }
    },
    [onImageUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: SUPPORTED_IMAGE_TYPES.reduce<Record<string, string[]>>(
      (acc, type) => {
        acc[type] = [];
        return acc;
      },
      {} as Record<string, string[]>
    ),
    multiple: false,
    maxSize: MAX_IMAGE_SIZE_MB * 1024 * 1024,
  });

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={`
          w-full aspect-[16/9] border-4 ${
            isDragActive ? "border-main" : "border-border"
          } 
          ${error ? "border-red-500" : ""} 
          ${preview ? "border-solid" : "border-dashed"}
          bg-background/50 hover:bg-background transition-colors cursor-pointer relative overflow-hidden
        `}
      >
        <input {...getInputProps()} />

        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-main border-t-transparent" />
          </div>
        ) : preview ? (
          <div className="relative w-full h-full group">
            <img
              src={preview}
              alt="Preview"
              className="object-contain w-full h-full p-4"
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
              <p className="text-base font-medium opacity-0 group-hover:opacity-100 bg-background/90 px-4 py-2 border-2 border-border">
                Click or drag to change image
              </p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-xl font-bold mb-2">
              {isDragActive ? "Drop it!" : "Drop your image here"}
            </p>
            <p className="text-base text-foreground/60 mb-4">
              or click to select a file
            </p>
            <p className="text-sm text-foreground/40">
              Supported formats: JPEG, PNG, WebP (up to {MAX_IMAGE_SIZE_MB}MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="w-full p-4 bg-red-100 border-2 border-red-500 text-red-700">
          <p className="font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
