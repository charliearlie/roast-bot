import { useState } from "react";
import {
  MemeTemplate,
  filterTemplates,
  getTemplatesForType,
  addCustomTemplate,
} from "../lib/templates";
import { TemplateFilter, TemplateFilters } from "./TemplateFilter";
import { Button } from "./ui/Button";
import { CustomTemplateUpload } from "./CustomTemplateUpload";

interface TemplateSelectorProps {
  type: "roast" | "compliment";
  selectedId: string;
  onSelect: (template: MemeTemplate) => void;
}

export function TemplateSelector({
  type,
  selectedId,
  onSelect,
}: TemplateSelectorProps) {
  const [filters, setFilters] = useState<TemplateFilters>({
    search: "",
  });
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allTemplates = getTemplatesForType(type);
  const filteredTemplates = filterTemplates(allTemplates, filters);

  const handleTemplateCreate = async (
    template: MemeTemplate,
    imageData: string
  ) => {
    try {
      setError(null);
      const newTemplate = await addCustomTemplate(template, imageData);
      onSelect(newTemplate);
      setShowUpload(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create template"
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <TemplateFilter onFilterChange={setFilters} />
        <Button
          onClick={() => setShowUpload(!showUpload)}
          variant="secondary"
          className="ml-4"
        >
          {showUpload ? "Cancel Upload" : "Upload Template"}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border-2 border-red-500 text-red-700 rounded">
          {error}
        </div>
      )}

      {showUpload ? (
        <CustomTemplateUpload onTemplateCreate={handleTemplateCreate} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`relative rounded-lg border-4 ${
                selectedId === template.id
                  ? "border-primary"
                  : "border-border hover:border-primary/50"
              } overflow-hidden cursor-pointer transition-colors`}
              onClick={() => onSelect(template)}
            >
              {/* Template Preview */}
              <div className="aspect-video relative">
                <img
                  src={`/meme-templates/${template.filename}`}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
                {selectedId === template.id && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      Selected
                    </span>
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="p-3 bg-background">
                <h3 className="font-semibold">{template.name}</h3>
                {template.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {template.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!showUpload && filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No templates match your filters</p>
          <Button
            onClick={() => setFilters({ search: "" })}
            variant="secondary"
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
