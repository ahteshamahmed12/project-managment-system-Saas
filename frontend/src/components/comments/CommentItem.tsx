import { Pencil, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import type { Comment } from "./commentData";

interface CommentItemProps {
  comment: Comment;
  onEdit: (comment: Comment) => void;
  onDelete: (comment: Comment) => void;
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleString();
}

export default function CommentItem({
  comment,
  onEdit,
  onDelete,
}: CommentItemProps) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-4">
      {/* Avatar */}
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={comment.user_avatar} alt={comment.user_name} />

        <AvatarFallback className="bg-orange-100 font-semibold text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
          {getInitials(comment.user_name)}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-sm font-semibold text-foreground">
            {comment.user_name}
          </p>

          <span className="text-xs text-muted-foreground">
            {formatDate(comment.created_at)}
          </span>
        </div>

        <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm text-muted-foreground">
          {comment.content}
        </p>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(comment)}
            className="h-8 gap-1.5 px-2 text-muted-foreground hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-950/30"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(comment)}
            className="h-8 gap-1.5 px-2 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
