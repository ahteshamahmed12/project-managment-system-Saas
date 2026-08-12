import { useCallback, useRef, useState } from "react";
import { ImagePlus, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Project } from "./projectData";
import FileUpload from "@/components/common/FileUpload";

interface ProjectFormProps {
  initialData?: Project | null;
  onSubmit: (data: Project) => void;
  onCancel: () => void;
}

const MAX_IMAGE_SIZE_MB = 5;
const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

export default function ProjectForm({
  initialData,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const [form, setForm] = useState<Project>(
    () =>
      initialData || {
        id: crypto.randomUUID(),
        project_name: "",
        project_image: "",
        description: "",
        status: "Active",
        priority: "Medium",
        attachments: [],
        start_date: "",
        end_date: "",
        created_by: "Admin",
        created_at: new Date().toISOString(),
      },
  );

  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const applyImageFile = useCallback(async (file: File) => {
    setImageError(null);

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Only PNG, JPG, WEBP or GIF images are allowed.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setImageError(`Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setForm((prev) => ({ ...prev, project_image: dataUrl }));
      // TODO: upload image file to server / storage and store returned URL
    } catch {
      setImageError("Could not read this image. Please try another file.");
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void applyImageFile(file);
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      void applyImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, project_image: "" }));
    setImageError(null);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-5"
    >
      {/* Project Name */}
      <div>
        <Label>Project Name</Label>
        <Input
          name="project_name"
          value={form.project_name}
          onChange={handleChange}
          placeholder="Enter project name"
        />
      </div>
      {/* Project Image - Drag & Drop Upload */}
      <div>
        <Label>Project Image</Label>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {form.project_image ? (
          <div className="relative mt-2 flex items-center gap-4 rounded-2xl border border-border bg-muted/40 p-3">
            <img
              src={form.project_image}
              alt="Project preview"
              className="h-16 w-16 shrink-0 rounded-xl border border-border object-cover"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                Image selected
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-orange-600 hover:underline dark:text-orange-400"
              >
                Replace image
              </button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemoveImage}
              aria-label="Remove image"
              className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                fileInputRef.current?.click();
              }
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/40 px-4 py-8 text-center transition-colors",
              isDragging
                ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                : "hover:border-orange-400 hover:bg-orange-50/60 dark:hover:bg-orange-950/20",
            )}
          >
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-2xl bg-card shadow-sm",
                isDragging
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-muted-foreground",
              )}
            >
              {isDragging ? (
                <Upload className="h-5 w-5" />
              ) : (
                <ImagePlus className="h-5 w-5" />
              )}
            </div>

            <p className="text-sm font-medium text-foreground">
              {isDragging ? "Drop image here" : "Drag & drop image here"}
            </p>

            <p className="text-xs text-muted-foreground">
              or click to browse (PNG, JPG, WEBP up to {MAX_IMAGE_SIZE_MB}MB)
            </p>
          </div>
        )}

        {imageError && (
          <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
            {imageError}
          </p>
        )}
      </div>
      {/* Description */}
      <div>
        <Label>Description</Label>
        <Textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Project description..."
          rows={4}
        />
      </div>
      {/* Status & Priority */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(value) =>
              setForm((prev) => ({
                ...prev,
                status: value as Project["status"],
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Priority</Label>
          <Select
            value={form.priority}
            onValueChange={(value) =>
              setForm((prev) => ({
                ...prev,
                priority: value as Project["priority"],
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Dates */}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label>Start Date</Label>
          <Input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            className="scheme-light dark:scheme-dark"
          />
        </div>

        <div>
          <Label>End Date</Label>
          <Input
            type="date"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
            className="scheme-light dark:scheme-dark"
          />
        </div>
      </div>
      {/* Attachments */}
      <div className="space-y-2">
        <Label>Attachments</Label>

        <FileUpload
          value={form.attachments}
          onChange={(attachments) =>
            setForm((prev) => ({
              ...prev,
              attachments,
            }))
          }
        />
      </div>
      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
          {initialData ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
