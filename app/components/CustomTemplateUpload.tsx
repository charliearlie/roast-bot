import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { MemeTemplate } from "../lib/templates";

interface CustomTemplateUploadProps {
  onTemplateCreate: (template: MemeTemplate, imageData: string) => void;
}

export function CustomTemplateUpload({
  onTemplateCreate,
}: CustomTemplateUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"roast" | "compliment" | "both">("both");
  const [style, setStyle] = useState<
    "funny" | "serious" | "classic" | "modern"
  >("funny");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: async (acceptedFiles) => {
      try {
        setIsLoading(true);
        setError(null);

        const file = acceptedFiles[0];
        if (!file) return;

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
          setIsLoading(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to upload image");
        setIsLoading(false);
      }
    },
  });

  const handleSubmit = async () => {
    if (!preview || !name) {
      setError("Please provide an image and name");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Generate a unique ID
      const id = `custom-${Date.now()}`;
      const filename = `${id}.jpg`; // We'll convert all images to jpg

      // Create the template object
      const template: MemeTemplate = {
        id,
        name,
        filename,
        type,
        style,
        theme: "custom", // All uploaded templates are custom theme
        tags,
        description,
      };

      // Pass both template and image data to parent
      onTemplateCreate(template, preview);

      // Reset form
      setName("");
      setDescription("");
      setTags([]);
      setTagInput("");
      setPreview(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create template"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-6">
      {/* Image Upload */}
      <div
        {...getRootProps()}
        className={`border-4 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        {isLoading ? (
          <LoadingSpinner size="lg" />
        ) : preview ? (
          <div className="relative aspect-video">
            <img
              src={preview}
              alt="Template preview"
              className="w-full h-full object-contain"
            />
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
              }}
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2 text-red-500 hover:text-red-600"
            >
              Remove
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-lg font-semibold">
              {isDragActive
                ? "Drop your image here"
                : "Drag & drop an image or click to browse"}
            </p>
            <p className="text-sm text-gray-500">JPG or PNG, max 5MB</p>
          </div>
        )}
      </div>

      {/* Template Details Form */}
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Template name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full"
        />

        <Input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full"
        />

        {/* Type Selection */}
        <div>
          <p className="text-sm font-medium mb-2">Type</p>
          <div className="flex gap-2">
            {(["roast", "compliment", "both"] as const).map((t) => (
              <Button
                key={t}
                onClick={() => setType(t)}
                variant={type === t ? "primary" : "secondary"}
                size="sm"
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Style Selection */}
        <div>
          <p className="text-sm font-medium mb-2">Style</p>
          <div className="flex flex-wrap gap-2">
            {(["funny", "serious", "classic", "modern"] as const).map((s) => (
              <Button
                key={s}
                onClick={() => setStyle(s)}
                variant={style === s ? "primary" : "secondary"}
                size="sm"
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <p className="text-sm font-medium mb-2">Tags</p>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Add a tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTag()}
              className="flex-1"
            />
            <Button onClick={addTag} variant="secondary">
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-100 border-2 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isLoading || !preview || !name}
          className="w-full"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Creating template...</span>
            </>
          ) : (
            "Create Template"
          )}
        </Button>
      </div>
    </div>
  );
}
