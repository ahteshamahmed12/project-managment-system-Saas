import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Sprint, SprintStatus } from "./sprintData";

const sprintSchema = z
  .object({
    sprint_name: z
      .string()
      .min(2, "Sprint name must be at least 2 characters."),

    project: z.string().min(1, "Please select a project."),

    goal: z.string().min(5, "Sprint goal must be at least 5 characters."),

    start_date: z.string().min(1, "Start date is required."),

    end_date: z.string().min(1, "End date is required."),

    status: z.enum(["Planning", "Active", "Completed"]),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: "End date must be after start date.",
    path: ["end_date"],
  });

type SprintFormValues = z.infer<typeof sprintSchema>;

interface SprintFormProps {
  initialData?: Sprint | null;
  onSubmit: (data: Sprint) => void;
  onCancel: () => void;
}

const PROJECT_OPTIONS = [
  "Project Management SaaS",
  "Mobile App",
  "E-Commerce Platform",
  "CRM System",
  "Analytics Dashboard",
];

const STATUS_OPTIONS: SprintStatus[] = ["Planning", "Active", "Completed"];

export default function SprintForm({
  initialData,
  onSubmit,
  onCancel,
}: SprintFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SprintFormValues>({
    resolver: zodResolver(sprintSchema),
    defaultValues: {
      sprint_name: initialData?.sprint_name ?? "",
      project: initialData?.project ?? "",
      goal: initialData?.goal ?? "",
      start_date: initialData?.start_date ?? "",
      end_date: initialData?.end_date ?? "",
      status: initialData?.status ?? "Planning",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedProject = watch("project");
  const selectedStatus = watch("status");

  const submitForm = (data: SprintFormValues) => {
    const sprint: Sprint = {
      id: initialData?.id ?? crypto.randomUUID(),
      sprint_name: data.sprint_name,
      project: data.project,
      goal: data.goal,
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status,
      created_by: initialData?.created_by ?? "Admin",
      created_at: initialData?.created_at ?? new Date().toISOString(),
    };

    onSubmit(sprint);
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-5">
      {/* Sprint Name */}

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Sprint Name</label>

        <Input
          {...register("sprint_name")}
          placeholder="e.g. Sprint 21"
          className="rounded-xl"
        />

        {errors.sprint_name && (
          <p className="text-sm text-red-500">{errors.sprint_name.message}</p>
        )}
      </div>

      {/* Project */}

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Project</label>

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

      {/* Goal */}

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Sprint Goal</label>

        <Textarea
          {...register("goal")}
          placeholder="Describe the main goal of this sprint..."
          className="min-h-24 rounded-xl"
        />

        {errors.goal && (
          <p className="text-sm text-red-500">{errors.goal.message}</p>
        )}
      </div>

      {/* Dates */}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Start Date
          </label>

          <Input
            type="date"
            {...register("start_date")}
            className="rounded-xl"
          />

          {errors.start_date && (
            <p className="text-sm text-red-500">{errors.start_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">End Date</label>

          <Input type="date" {...register("end_date")} className="rounded-xl" />

          {errors.end_date && (
            <p className="text-sm text-red-500">{errors.end_date.message}</p>
          )}
        </div>
      </div>

      {/* Status */}

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Status</label>

        <Select
          value={selectedStatus}
          onValueChange={(value) =>
            setValue("status", value as SprintStatus, {
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

      {/* Actions */}

      <div className="flex justify-end gap-3 border-t pt-5">
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
          {initialData ? "Update Sprint" : "Create Sprint"}
        </Button>
      </div>
    </form>
  );
}
