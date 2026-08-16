// lib/mappers/sprint-mapper.ts

import type { BackendSprint } from "@/types/sprint";
import type { Sprint, SprintStatus } from "@/pages/Sprints/sprintData";

const STATUS_MAP: Record<string, SprintStatus> = {
  planning: "Planning",
  active: "Active",
  completed: "Completed",
  closed: "Completed",
};

export function mapBackendSprint(raw: BackendSprint): Sprint {
  return {
    id: String(raw.id),
    sprint_name: raw.name,
    project: raw.project,
    goal: raw.goal ?? "",
    start_date: raw.start_date?.slice(0, 10) ?? "",
    end_date: raw.end_date?.slice(0, 10) ?? "",
    status: STATUS_MAP[raw.status] ?? "Planning",
    created_by: raw.created_by ?? "",
    created_at: raw.created_at,
  };
}

export function mapSprintStatusToBackend(status: SprintStatus): string {
  switch (status) {
    case "Active":
      return "active";
    case "Completed":
      return "completed";
    case "Planning":
      return "planning";
  }
}