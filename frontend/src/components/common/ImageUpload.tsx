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
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [preview, setPreview] = React.useState<string>(value || "");

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

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">{label}</label>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files[0]);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition",
          "hover:border-orange-400 hover:bg-orange-50",
        )}
      >
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="h-40 w-full rounded-xl object-cover"
          />
        ) : (
          <>
            <ImageIcon className="mb-3 h-10 w-10 text-gray-400" />

            <p className="font-medium">Drag & Drop image here</p>

            <p className="text-sm text-gray-500">or click to browse</p>
          </>
        )}

        <input
          ref={inputRef}
          hidden
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud className="mr-2 h-4 w-4" />
          Choose Image
        </Button>

        {preview && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              setPreview("");
              onChange(null);

              if (inputRef.current) {
                inputRef.current.value = "";
              }
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
