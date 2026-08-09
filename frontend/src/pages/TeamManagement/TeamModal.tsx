import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import TeamForm from "./TeamForm";
import type { Team } from "./teamData";

interface TeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team?: Team | null;
  onSave: (team: Team) => void;
}

export default function TeamModal({
  open,
  onOpenChange,
  team,
  onSave,
}: TeamModalProps) {
  const handleSubmit = (data: Team) => {
    onSave(data);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {team ? "Edit Team" : "Create Team"}
          </DialogTitle>

          <DialogDescription className="text-muted-foreground">
            {team
              ? "Update the team details below."
              : "Create a new team and assign its members."}
          </DialogDescription>
        </DialogHeader>

        <TeamForm
          initialData={team}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
