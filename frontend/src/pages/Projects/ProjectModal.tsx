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
  onSave: (project: Project) => void;
}

export default function ProjectModal({
  open,
  onOpenChange,
  project,
  onSave,
}: ProjectModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {project ? "Edit Project" : "Create New Project"}
          </DialogTitle>
        </DialogHeader>

        <ProjectForm
          initialData={project}
          onSubmit={(data) => {
            onSave(data);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
