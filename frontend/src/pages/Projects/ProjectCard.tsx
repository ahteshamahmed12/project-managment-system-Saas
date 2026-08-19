import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Pencil,
  Trash2,
  User,
  Flag,
  Kanban,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { Project } from "./projectData";

interface Props {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const statusColors = {
  Active:
    "border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",

  "On Hold":
    "border-yellow-200 bg-yellow-100 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",

  Completed:
    "border-orange-200 bg-orange-100 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
};

const priorityColors = {
  Low: "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",

  Medium:
    "border-purple-200 bg-purple-100 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300",

  High: "border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
};

export default function ProjectCard({ project, onEdit, onDelete }: Props) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      {/* Top */}
      <div className="flex items-start gap-4">
        <img
          src={
            project.project_image || "https://placehold.co/60x60?text=Project"
          }
          alt={project.project_name}
          className="h-14 w-14 rounded-xl border border-border object-cover"
        />

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">
            {project.project_name}
          </h3>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {project.description}
          </p>
        </div>
      </div>

      {/* Badges */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="outline" className={statusColors[project.status]}>
          {project.status}
        </Badge>

        <Badge variant="outline" className={priorityColors[project.priority]}>
          <Flag className="mr-1 h-3 w-3" />
          {project.priority}
        </Badge>
      </div>

      {/* Info */}
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4 text-orange-500" />
          {project.created_by}
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4 text-orange-500" />
          {project.start_date}
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4 text-orange-500" />
          {project.end_date}
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-4 flex gap-3 pt-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => navigate(`/projects/${project.id}/board`)}
        >
          <Kanban className="mr-2 h-4 w-4" />
          Board
        </Button>

        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onEdit(project)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>

        <Button
          variant="destructive"
          className="flex-1"
          onClick={() => onDelete(project)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}
