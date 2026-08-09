import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import type { Sprint } from "./sprintData";
import SprintForm from "./SprintForm";

interface SprintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprint?: Sprint | null;
  onSave: (sprint: Sprint) => void;
}

export default function SprintModal({
  open,
  onOpenChange,
  sprint,
  onSave,
}: SprintModalProps) {
  const handleSubmit = (data: Sprint) => {
    onSave(data);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {sprint ? "Edit Sprint" : "Create Sprint"}
          </DialogTitle>

          <DialogDescription className="text-gray-500">
            {sprint
              ? "Update the sprint details below."
              : "Create a new sprint and define its goals."}
          </DialogDescription>
        </DialogHeader>

        <SprintForm
          initialData={sprint}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
