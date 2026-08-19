import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import ProjectForm from "./ProjectForm";
import type { Project } from "./projectData";

interface ProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSave: (project: Project) => Promise<void> | void;
}

export default function ProjectModal({
  open,
  onOpenChange,
  project,
  onSave,
}: ProjectModalProps) {
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setSaving(false);
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (data: Project) => {
    setSaving(true);
    setError(null);
    try {
      await onSave(data);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save project.");
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl bg-card text-card-foreground sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {project ? "Edit Project" : "Create New Project"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
            {error}
          </p>
        )}

        <ProjectForm
          initialData={project}
          disabled={saving}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}