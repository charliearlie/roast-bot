import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and merges Tailwind classes using tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a file size in bytes to a human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validates if a file is an image and within size limits
 */
export function validateImageFile(file: File, maxSizeMB = 5): string | null {
  if (!file.type.startsWith("image/")) {
    return "File must be an image (JPEG, PNG, WebP)";
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return `File size must be less than ${maxSizeMB}MB`;
  }

  return null;
}

interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffFactor?: number;
  shouldRetry?: (error: Error) => boolean;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffFactor = 2,
    shouldRetry = () => true,
  } = options;

  let lastError: Error | null = null;
  let attempt = 1;

  while (attempt <= maxAttempts) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts || !shouldRetry(lastError)) {
        throw lastError;
      }

      // Wait with exponential backoff
      const delay = delayMs * Math.pow(backoffFactor, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));

      attempt++;
    }
  }

  // This should never be reached due to the throw in the catch block
  throw lastError;
}
