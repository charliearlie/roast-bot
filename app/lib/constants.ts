/**
 * Maximum file size for image uploads in megabytes
 */
export const MAX_IMAGE_SIZE_MB = 5;

/**
 * Supported image file types
 */
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/**
 * Predefined questions for the text input mode
 */
export const PROMPT_QUESTIONS = [
  {
    id: "description",
    label: "Describe yourself in a few sentences",
    placeholder:
      "Tell us about your personality, hobbies, or anything unique about you...",
    maxLength: 300,
  },
  {
    id: "achievements",
    label: "What are you most proud of?",
    placeholder:
      "Share your biggest achievements or what makes you stand out...",
    maxLength: 200,
  },
  {
    id: "quirks",
    label: "What are your quirks or peculiarities?",
    placeholder:
      "Share any funny habits, strange preferences, or unique traits...",
    maxLength: 200,
  },
] as const;

/**
 * Available roast severity levels
 */
export const ROAST_SEVERITY = {
  MILD: "mild",
  MEDIUM: "medium",
  NUCLEAR: "nuclear",
} as const;

/**
 * Available roast styles
 */
export const ROAST_STYLES = {
  FORMAL: "formal",
  SARCASTIC: "sarcastic",
  SHAKESPEAREAN: "shakespearean",
  RAP_BATTLE: "rapBattle",
} as const;
