import { ToneSeverity, ToneStyle } from "./openai";

interface PromptSuggestion {
  text: string;
  description?: string;
  forType?: "roast" | "compliment" | "both";
  forTone?: {
    severity?: ToneSeverity[];
    style?: ToneStyle[];
  };
}

const BASE_PROMPTS: PromptSuggestion[] = [
  {
    text: "Make it more brutal",
    description: "Intensify the roast while staying playful",
    forType: "roast",
    forTone: {
      severity: ["medium", "nuclear"],
    },
  },
  {
    text: "Keep it classy",
    description: "A more sophisticated take",
    forType: "both",
    forTone: {
      style: ["formal", "shakespearean"],
    },
  },
  {
    text: "Add a plot twist",
    description: "Unexpected turn of events",
    forType: "both",
  },
  {
    text: "Make it funnier",
    description: "More humor and wit",
    forType: "both",
    forTone: {
      style: ["sarcastic", "rapBattle"],
    },
  },
  {
    text: "Add a comeback",
    description: "Include a self-aware response",
    forType: "roast",
  },
  {
    text: "Make it more wholesome",
    description: "Focus on positivity",
    forType: "compliment",
  },
  {
    text: "Add a life lesson",
    description: "Include some wisdom",
    forType: "both",
    forTone: {
      style: ["formal", "shakespearean"],
    },
  },
  {
    text: "Make it rhyme",
    description: "Poetic version",
    forType: "both",
    forTone: {
      style: ["rapBattle", "shakespearean"],
    },
  },
];

export function getFollowUpPrompts(
  type: "roast" | "compliment",
  severity: ToneSeverity,
  style: ToneStyle
): PromptSuggestion[] {
  // Filter prompts based on type and tone
  return BASE_PROMPTS.filter((prompt) => {
    // Check type compatibility
    if (
      prompt.forType &&
      prompt.forType !== "both" &&
      prompt.forType !== type
    ) {
      return false;
    }

    // Check tone compatibility
    if (prompt.forTone) {
      if (
        prompt.forTone.severity &&
        !prompt.forTone.severity.includes(severity)
      ) {
        return false;
      }
      if (prompt.forTone.style && !prompt.forTone.style.includes(style)) {
        return false;
      }
    }

    return true;
  }).slice(0, 4); // Limit to 4 suggestions at a time
}
