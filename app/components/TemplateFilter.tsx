import { useState, ChangeEvent } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

interface TemplateFilterProps {
  onFilterChange: (filters: TemplateFilters) => void;
}

export interface TemplateFilters {
  search: string;
  style?: "funny" | "serious" | "classic" | "modern";
  theme?: "reaction" | "classic" | "modern" | "custom";
}

const STYLE_OPTIONS = [
  { value: "funny", label: "Funny" },
  { value: "serious", label: "Serious" },
  { value: "classic", label: "Classic" },
  { value: "modern", label: "Modern" },
] as const;

const THEME_OPTIONS = [
  { value: "reaction", label: "Reaction" },
  { value: "classic", label: "Classic Memes" },
  { value: "modern", label: "Modern" },
  { value: "custom", label: "Custom" },
] as const;

export function TemplateFilter({ onFilterChange }: TemplateFilterProps) {
  const [filters, setFilters] = useState<TemplateFilters>({
    search: "",
  });

  const handleFilterChange = (
    type: keyof TemplateFilters,
    value: string | undefined
  ) => {
    const newFilters = {
      ...filters,
      [type]: value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div>
        <Input
          type="text"
          placeholder="Search templates..."
          value={filters.search}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleFilterChange("search", e.target.value)
          }
          className="w-full"
        />
      </div>

      {/* Style Filter */}
      <div>
        <p className="text-sm font-medium mb-2">Style</p>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              onClick={() =>
                handleFilterChange(
                  "style",
                  filters.style === option.value ? undefined : option.value
                )
              }
              variant={filters.style === option.value ? "primary" : "secondary"}
              size="sm"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Theme Filter */}
      <div>
        <p className="text-sm font-medium mb-2">Theme</p>
        <div className="flex flex-wrap gap-2">
          {THEME_OPTIONS.map((option) => (
            <Button
              key={option.value}
              onClick={() =>
                handleFilterChange(
                  "theme",
                  filters.theme === option.value ? undefined : option.value
                )
              }
              variant={filters.theme === option.value ? "primary" : "secondary"}
              size="sm"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
