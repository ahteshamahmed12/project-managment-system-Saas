import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import SprintForm from "./SprintForm";
import type { Sprint } from "./sprintData";

interface SprintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprint?: Sprint | null;
  onSave: (sprint: Sprint) => Promise<void> | void;
  error?: string | null;
}

export default function SprintModal({
  open,
  onOpenChange,
  sprint,
  onSave,
  error,
}: SprintModalProps) {
  const handleSubmit = async (data: Sprint) => {
    await onSave(data);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {sprint ? "Edit Sprint" : "Create Sprint"}
          </DialogTitle>

          <DialogDescription className="text-muted-foreground">
            {sprint
              ? "Update the sprint details below."
              : "Create a new sprint and define its goals."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <SprintForm
          initialData={sprint}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
