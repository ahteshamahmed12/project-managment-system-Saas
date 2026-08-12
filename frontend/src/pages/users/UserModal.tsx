import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import UserForm from "./UserForm";
import type { User } from "./userData";

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSave: (user: User) => void;
}

export default function UserModal({
  open,
  onOpenChange,
  user,
  onSave,
}: UserModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-background sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {user ? "Edit User" : "Create New User"}
          </DialogTitle>
        </DialogHeader>

        <UserForm
          initialData={user}
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
