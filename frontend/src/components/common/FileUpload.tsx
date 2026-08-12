import * as React from "react";
import {
  UploadCloud,
  Trash2,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  File,
  Download,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TaskAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface FileUploadProps {
  value: TaskAttachment[];
  onChange: (files: TaskAttachment[]) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function getFileIcon(type: string) {
  if (type.startsWith("image/")) {
    return FileImage;
  }

  if (type.includes("pdf") || type.includes("word") || type.includes("text")) {
    return FileText;
  }

  if (
    type.includes("excel") ||
    type.includes("spreadsheet") ||
    type.includes("csv")
  ) {
    return FileSpreadsheet;
  }

  if (
    type.includes("zip") ||
    type.includes("rar") ||
    type.includes("archive")
  ) {
    return FileArchive;
  }

  return File;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({ value, onChange }: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState("");

  const addFiles = React.useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);

      if (!files.length) {
        return;
      }

      setError("");

      const validFiles: TaskAttachment[] = [];

      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          setError(`"${file.name}" is larger than 10 MB and was not added.`);
          continue;
        }

        const duplicate = value.some(
          (existingFile) =>
            existingFile.name === file.name && existingFile.size === file.size,
        );

        if (duplicate) {
          setError(`"${file.name}" is already attached.`);
          continue;
        }

        validFiles.push({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
        });
      }

      if (validFiles.length) {
        onChange([...value, ...validFiles]);
      }

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [onChange, value],
  );

  const handleRemove = (id: string) => {
    const file = value.find((item) => item.id === id);

    if (file?.url.startsWith("blob:")) {
      URL.revokeObjectURL(file.url);
    }

    onChange(value.filter((item) => item.id !== id));
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    addFiles(event.dataTransfer.files);
  };

  const handleBrowse = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}

      <div
        onClick={handleBrowse}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
          "border-border bg-muted/30",
          "hover:border-orange-400 hover:bg-orange-50/60",
          "dark:hover:border-orange-700 dark:hover:bg-orange-950/20",
          isDragging && "border-orange-500 bg-orange-50 dark:bg-orange-950/30",
        )}
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
          <UploadCloud className="h-6 w-6" />
        </div>

        <p className="font-medium text-foreground">Drag & drop files here</p>

        <p className="mt-1 text-sm text-muted-foreground">
          or click to browse from your computer
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          Maximum file size: 10 MB per file
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files) {
              addFiles(event.target.files);
            }
          }}
        />
      </div>

      {/* Error */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Attached Files */}

      {value.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              Attached Files
            </p>

            <span className="text-xs text-muted-foreground">
              {value.length} file{value.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-2">
            {value.map((file) => {
              const Icon = getFileIcon(file.type);

              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  {/* Icon */}

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-orange-500" />
                  </div>

                  {/* File Info */}

                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-medium text-foreground"
                      title={file.name}
                    >
                      {file.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  {/* Actions */}

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-950/30"
                      onClick={() => {
                        window.open(file.url, "_blank");
                      }}
                      aria-label={`Open ${file.name}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>

                    <a
                      href={file.url}
                      download={file.name}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-950/30"
                      aria-label={`Download ${file.name}`}
                    >
                      <Download className="h-4 w-4" />
                    </a>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30"
                      onClick={() => handleRemove(file.id)}
                      aria-label={`Remove ${file.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
