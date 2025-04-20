import { TemplateFilters } from "../components/TemplateFilter";

export interface MemeTemplate {
  id: string;
  name: string;
  filename: string;
  type: "roast" | "compliment" | "both";
  style: "funny" | "serious" | "classic" | "modern";
  theme: "reaction" | "classic" | "modern" | "custom";
  tags: string[];
  description?: string;
}

// Store custom templates in localStorage
const STORAGE_KEY = "custom_templates";

// Load custom templates from localStorage
function loadCustomTemplates(): MemeTemplate[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save custom templates to localStorage
function saveCustomTemplates(templates: MemeTemplate[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

const TEMPLATES: MemeTemplate[] = [
  {
    id: "skeptical",
    name: "Skeptical Kid",
    filename: "skeptical-kid.jpg",
    type: "roast",
    style: "funny",
    theme: "reaction",
    tags: ["doubt", "disbelief", "side-eye"],
    description: "Perfect for sarcastic responses",
  },
  {
    id: "success-kid",
    name: "Success Kid",
    filename: "success-kid.jpg",
    type: "compliment",
    style: "classic",
    theme: "classic",
    tags: ["victory", "achievement", "proud"],
    description: "Celebrate those wins!",
  },
  {
    id: "drake",
    name: "Drake Hotline Bling",
    filename: "drake.jpg",
    type: "both",
    style: "modern",
    theme: "reaction",
    tags: ["comparison", "preference", "choice"],
    description: "Compare and contrast with style",
  },
  {
    id: "doge",
    name: "Doge",
    filename: "doge.jpg",
    type: "compliment",
    style: "funny",
    theme: "classic",
    tags: ["wholesome", "cute", "animal"],
    description: "The iconic Shiba Inu for wholesome content",
  },
  {
    id: "distracted",
    name: "Distracted Boyfriend",
    filename: "distracted-boyfriend.jpg",
    type: "roast",
    style: "funny",
    theme: "reaction",
    tags: ["classic", "relationships", "choices"],
    description: "Perfect for pointing out flaws or distractions",
  },
  {
    id: "disaster-girl",
    name: "Disaster Girl",
    filename: "disaster-girl.jpg",
    type: "roast",
    style: "serious",
    theme: "reaction",
    tags: ["chaos", "sarcastic", "classic"],
    description: "For when things are going terribly wrong",
  },
  {
    id: "wholesome",
    name: "Wholesome Seal",
    filename: "wholesome-seal.jpg",
    type: "compliment",
    style: "funny",
    theme: "classic",
    tags: ["wholesome", "cute", "animal"],
    description: "For extra wholesome compliments",
  },
];

// Get all templates including custom ones
export function getAllTemplates(): MemeTemplate[] {
  return [...TEMPLATES, ...loadCustomTemplates()];
}

export function getTemplatesForType(
  type: "roast" | "compliment"
): MemeTemplate[] {
  const allTemplates = getAllTemplates();
  return allTemplates.filter(
    (template) => template.type === type || template.type === "both"
  );
}

export function getDefaultTemplateForType(
  type: "roast" | "compliment"
): MemeTemplate {
  const templates = getTemplatesForType(type);
  return templates[0];
}

export function filterTemplates(
  templates: MemeTemplate[],
  { search, style, theme }: TemplateFilters
): MemeTemplate[] {
  if (!search && !style && !theme) return templates;

  const searchLower = search.toLowerCase();

  return templates.filter((template) => {
    // Match search term
    const matchesSearch =
      !search ||
      template.name.toLowerCase().includes(searchLower) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
      template.description?.toLowerCase().includes(searchLower);

    // Match style filter
    const matchesStyle = !style || template.style === style;

    // Match theme filter
    const matchesTheme = !theme || template.theme === theme;

    return matchesSearch && matchesStyle && matchesTheme;
  });
}

// Add a new custom template
export async function addCustomTemplate(
  template: MemeTemplate,
  imageData: string
): Promise<MemeTemplate> {
  try {
    // Upload template to server
    const response = await fetch("/api/templates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template,
        imageData,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to upload template");
    }

    // Save to localStorage
    const customTemplates = loadCustomTemplates();
    customTemplates.push(template);
    saveCustomTemplates(customTemplates);

    return template;
  } catch (error) {
    console.error("Error adding custom template:", error);
    throw error;
  }
}

// Remove a custom template
export function removeCustomTemplate(id: string): void {
  const customTemplates = loadCustomTemplates();
  const filtered = customTemplates.filter((t) => t.id !== id);
  saveCustomTemplates(filtered);

  // TODO: Remove template image from server
  // This would require an additional API endpoint
}
