import * as React from "react";
import { UploadCloud, Trash2, Image as ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  label?: string;
  value?: string;
  onChange: (file: File | null) => void;
}

export default function ImageUpload({
  label = "Upload Image",
  value,
  onChange,
}: ImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const [preview, setPreview] = React.useState(value || "");

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview(value || "");
  }, [value]);

  const handleFile = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB.");
      return;
    }

    setPreview(URL.createObjectURL(file));
    onChange(file);
  };

  const handleRemove = () => {
    setPreview("");
    onChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Label */}

      <label className="text-sm font-medium text-foreground">{label}</label>

      {/* Upload Area */}

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          handleFile(event.dataTransfer.files[0] ?? null);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/40 p-6 transition",
          "hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20",
        )}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="h-40 w-full rounded-xl object-cover"
          />
        ) : (
          <>
            <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground" />

            <p className="font-medium text-foreground">
              Drag & Drop image here
            </p>

            <p className="text-sm text-muted-foreground">or click to browse</p>
          </>
        )}

        <input
          ref={inputRef}
          hidden
          type="file"
          accept="image/*"
          onChange={(event) => {
            handleFile(event.target.files?.[0] ?? null);
          }}
        />
      </div>

      {/* Actions */}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud className="mr-2 h-4 w-4" />
          Choose Image
        </Button>

        {preview && (
          <Button type="button" variant="destructive" onClick={handleRemove}>
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
