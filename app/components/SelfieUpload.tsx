import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/Button";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { validateImageFile } from "@/app/lib/utils";
import { MAX_IMAGE_SIZE_MB, SUPPORTED_IMAGE_TYPES } from "@/app/lib/constants";
import Image from "next/image";

interface SelfieUploadProps {
  onUpload: (imageData: string) => void;
  currentImage?: string | null;
}

export function SelfieUpload({ onUpload, currentImage }: SelfieUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        setIsLoading(true);
        setError(null);

        const file = acceptedFiles[0];
        if (!file) return;

        const validationError = validateImageFile(file, MAX_IMAGE_SIZE_MB);
        if (validationError) {
          throw new Error(validationError);
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);

        // Convert to base64
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          onUpload(base64String);
        };
        reader.onerror = () => {
          throw new Error("Failed to read file");
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error("Error uploading file:", err);
        setError(err instanceof Error ? err.message : "Failed to upload file");
        setPreview(null);
        onUpload("");
      } finally {
        setIsLoading(false);
      }
    },
    [onUpload]
  );

  const handleClear = () => {
    setPreview(null);
    onUpload("");
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/webp": [".webp"],
      },
      maxSize: MAX_IMAGE_SIZE_MB * 1024 * 1024,
      multiple: false,
    });

  return (
    <div
      {...getRootProps()}
      className={`w-full min-h-[300px] border-4 ${
        isDragActive ? "border-primary" : "border-border"
      } ${
        isDragReject ? "border-red-500" : ""
      } rounded-lg bg-background/50 hover:bg-background transition-colors cursor-pointer relative overflow-hidden p-4 flex flex-col items-center justify-center`}
    >
      <input {...getInputProps()} />

      {isLoading ? (
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-lg font-semibold">Processing...</p>
        </div>
      ) : preview ? (
        <div className="relative w-full max-w-md">
          <Image
            src={preview}
            alt="Preview"
            width={500}
            height={500}
            className="w-full h-auto rounded-lg border-2 border-black shadow-neo"
          />
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            variant="secondary"
            className="absolute top-2 right-2"
          >
            Clear
          </Button>
        </div>
      ) : (
        <>
          <div className="text-center">
            {isDragReject ? (
              <p className="text-lg font-semibold text-red-600">
                This file type is not supported
              </p>
            ) : isDragActive ? (
              <p className="text-lg font-semibold text-primary">
                Drop it like its hot! 🔥
              </p>
            ) : (
              <>
                <p className="text-lg font-semibold">
                  Drop your selfie here, or click to select
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Supports JPEG, PNG, WebP (max {MAX_IMAGE_SIZE_MB}MB)
                </p>
              </>
            )}
          </div>
        </>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 border-2 border-red-500 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
