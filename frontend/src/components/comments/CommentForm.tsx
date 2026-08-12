import * as React from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentFormProps {
  initialValue?: string;
  isEditing?: boolean;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
}

export default function CommentForm({
  initialValue = "",
  isEditing = false,
  onSubmit,
  onCancel,
}: CommentFormProps) {
  const [content, setContent] = React.useState(initialValue);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContent(initialValue);
  }, [initialValue]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    onSubmit(trimmedContent);

    if (!isEditing) {
      setContent("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={isEditing ? "Edit your comment..." : "Write a comment..."}
        rows={3}
        className="resize-none"
      />

      <div className="flex justify-end gap-2">
        {isEditing && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          disabled={!content.trim()}
          className="bg-orange-500 text-white hover:bg-orange-600"
        >
          {isEditing ? "Update Comment" : "Add Comment"}
        </Button>
      </div>
    </form>
  );
}
