import * as React from "react";
import { MessageSquare } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import {
  commentData,
  type Comment,
  type CommentTargetType,
} from "./commentData";

interface CommentSectionProps {
  targetType: CommentTargetType;
  targetId: string;
}

export default function CommentSection({
  targetType,
  targetId,
}: CommentSectionProps) {
  const [comments, setComments] = React.useState<Comment[]>(commentData);
  const [editingComment, setEditingComment] = React.useState<Comment | null>(
    null,
  );

  const filteredComments = comments.filter(
    (comment) =>
      comment.target_type === targetType && comment.target_id === targetId,
  );

  const handleAddComment = (content: string) => {
    const newComment: Comment = {
      id: crypto.randomUUID(),
      target_type: targetType,
      target_id: targetId,
      user_id: "current-user",
      user_name: "Zain Qaimi",
      content,
      created_at: new Date().toISOString(),
    };

    setComments((prev) => [...prev, newComment]);
  };

  const handleUpdateComment = (content: string) => {
    if (!editingComment) return;

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === editingComment.id
          ? {
              ...comment,
              content,
              updated_at: new Date().toISOString(),
            }
          : comment,
      ),
    );

    setEditingComment(null);
  };

  const handleDeleteComment = (comment: Comment) => {
    setComments((prev) => prev.filter((item) => item.id !== comment.id));
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-orange-500" />
          Comments
          <span className="text-sm font-normal text-muted-foreground">
            ({filteredComments.length})
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Add / Edit Comment */}
        <CommentForm
          initialValue={editingComment?.content ?? ""}
          isEditing={Boolean(editingComment)}
          onSubmit={editingComment ? handleUpdateComment : handleAddComment}
          onCancel={() => setEditingComment(null)}
        />

        {/* Comments List */}
        {filteredComments.length > 0 ? (
          <div className="space-y-3">
            {filteredComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onEdit={setEditingComment}
                onDelete={handleDeleteComment}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/50" />

            <p className="mt-2 text-sm font-medium text-foreground">
              No comments yet
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Be the first to add a comment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
