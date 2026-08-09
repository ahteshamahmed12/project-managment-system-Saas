import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Team, TeamStatus } from "./teamData";

/* ==========================================================
   SCHEMA
========================================================== */

const teamSchema = z.object({
  team_name: z.string().min(2, "Team name must be at least 2 characters."),

  description: z.string().min(5, "Description must be at least 5 characters."),

  project: z.string().min(1, "Please select a project."),

  team_lead: z.string().min(1, "Please select a team lead."),

  members: z
    .array(z.string())
    .min(1, "Please select at least one team member."),

  status: z.enum(["Active", "Inactive"]),
});

type TeamFormValues = z.infer<typeof teamSchema>;

/* ==========================================================
   PROPS
========================================================== */

interface TeamFormProps {
  initialData?: Team | null;
  onSubmit: (data: Team) => void;
  onCancel: () => void;
}

/* ==========================================================
   OPTIONS
========================================================== */

const PROJECT_OPTIONS = [
  "Project Management SaaS",
  "Mobile App",
  "E-Commerce Platform",
  "CRM System",
  "Analytics Dashboard",
];

const USER_OPTIONS = [
  "Ali Khan",
  "Zain Qaimi",
  "Ahmed Raza",
  "Hamza Ahmed",
  "Usman Ali",
  "Bilal Khan",
  "Sara Ahmed",
  "Ayesha Khan",
  "Hina Malik",
  "Ahmed Hassan",
  "Fatima Noor",
  "Omer Farooq",
];

const STATUS_OPTIONS: TeamStatus[] = ["Active", "Inactive"];

/* ==========================================================
   FORM
========================================================== */

export default function TeamForm({
  initialData,
  onSubmit,
  onCancel,
}: TeamFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      team_name: initialData?.team_name ?? "",
      description: initialData?.description ?? "",
      project: initialData?.project ?? "",
      team_lead: initialData?.team_lead ?? "",
      members: initialData?.members ?? [],
      status: initialData?.status ?? "Active",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedProject = watch("project");
  const selectedTeamLead = watch("team_lead");
  const selectedMembers = watch("members");
  const selectedStatus = watch("status");

  /* ========================================================
     MEMBER TOGGLE
  ======================================================== */

  const handleMemberToggle = (member: string) => {
    const currentMembers = selectedMembers ?? [];

    if (currentMembers.includes(member)) {
      setValue(
        "members",
        currentMembers.filter((item) => item !== member),
        {
          shouldValidate: true,
        },
      );
    } else {
      setValue("members", [...currentMembers, member], {
        shouldValidate: true,
      });
    }
  };

  /* ========================================================
     SUBMIT
  ======================================================== */

  const submitForm = (data: TeamFormValues) => {
    const team: Team = {
      id: initialData?.id ?? crypto.randomUUID(),

      team_name: data.team_name,

      description: data.description,

      project: data.project,

      team_lead: data.team_lead,

      members: data.members,

      status: data.status,

      created_at: initialData?.created_at ?? new Date().toISOString(),
    };

    onSubmit(team);
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-6">
      {/* ==================================================
          TEAM NAME
      ================================================== */}

      <div className="space-y-2">
        <Label>Team Name</Label>

        <Input
          {...register("team_name")}
          placeholder="e.g. Frontend Team"
          className="rounded-xl"
        />

        {errors.team_name && (
          <p className="text-sm text-red-500">{errors.team_name.message}</p>
        )}
      </div>

      {/* ==================================================
          DESCRIPTION
      ================================================== */}

      <div className="space-y-2">
        <Label>Description</Label>

        <Textarea
          {...register("description")}
          placeholder="Describe the purpose of this team..."
          className="min-h-24 rounded-xl"
        />

        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* ==================================================
          PROJECT
      ================================================== */}

      <div className="space-y-2">
        <Label>Project</Label>

        <Select
          value={selectedProject}
          onValueChange={(value) =>
            setValue("project", value, {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>

          <SelectContent>
            {PROJECT_OPTIONS.map((project) => (
              <SelectItem key={project} value={project}>
                {project}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {errors.project && (
          <p className="text-sm text-red-500">{errors.project.message}</p>
        )}
      </div>

      {/* ==================================================
          TEAM LEAD
      ================================================== */}

      <div className="space-y-2">
        <Label>Team Lead</Label>

        <Select
          value={selectedTeamLead}
          onValueChange={(value) =>
            setValue("team_lead", value, {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Select team lead" />
          </SelectTrigger>

          <SelectContent>
            {USER_OPTIONS.map((user) => (
              <SelectItem key={user} value={user}>
                {user}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {errors.team_lead && (
          <p className="text-sm text-red-500">{errors.team_lead.message}</p>
        )}
      </div>

      {/* ==================================================
          MEMBERS
      ================================================== */}

      <div className="space-y-2">
        <Label>Team Members</Label>

        <div className="max-h-48 overflow-y-auto rounded-xl border border-border p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {USER_OPTIONS.map((user) => {
              const checked = selectedMembers.includes(user);

              return (
                <label
                  key={user}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-orange-50 dark:hover:bg-orange-950/30"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleMemberToggle(user)}
                    className="h-4 w-4 accent-orange-500"
                  />

                  <span className="text-sm text-foreground">{user}</span>
                </label>
              );
            })}
          </div>
        </div>

        {selectedMembers.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {selectedMembers.length} member
            {selectedMembers.length > 1 ? "s" : ""} selected
          </p>
        )}

        {errors.members && (
          <p className="text-sm text-red-500">{errors.members.message}</p>
        )}
      </div>

      {/* ==================================================
          STATUS
      ================================================== */}

      <div className="space-y-2">
        <Label>Status</Label>

        <Select
          value={selectedStatus}
          onValueChange={(value) =>
            setValue("status", value as TeamStatus, {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>

          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {errors.status && (
          <p className="text-sm text-red-500">{errors.status.message}</p>
        )}
      </div>

      {/* ==================================================
          ACTIONS
      ================================================== */}

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-xl"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          className="rounded-xl bg-orange-500 hover:bg-orange-600"
        >
          {initialData ? "Update Team" : "Create Team"}
        </Button>
      </div>
    </form>
  );
}
