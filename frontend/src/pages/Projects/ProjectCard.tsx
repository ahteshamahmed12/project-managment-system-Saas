import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Pencil, Trash2, User, Flag } from "lucide-react";

import type { Project } from "./projectData";

interface Props {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const statusColors = {
  Active: "bg-green-100 text-green-700",
  "On Hold": "bg-yellow-100 text-yellow-700",
  Completed: "bg-orange-100 text-orange-700",
};

const priorityColors = {
  Low: "bg-blue-100 text-blue-700",
  Medium: "bg-purple-100 text-purple-700",
  High: "bg-red-100 text-red-700",
};

export default function ProjectCard({ project, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 space-y-4">
      {/* Top */}
      <div className="flex items-center gap-3">
        <img
          src={
            project.project_image || "https://placehold.co/60x60?text=Project"
          }
          alt={project.project_name}
          className="h-14 w-14 rounded-xl object-cover border"
        />

        <div className="flex-1">
          <h3 className="font-semibold text-lg">{project.project_name}</h3>

          <p className="line-clamp-2 text-sm text-gray-500">
            {project.description}
          </p>
        </div>
      </div>

      {/* Badges */}

      <div className="flex flex-wrap gap-2">
        <Badge className={statusColors[project.status]}>{project.status}</Badge>

        <Badge className={priorityColors[project.priority]}>
          <Flag className="mr-1 h-3 w-3" />
          {project.priority}
        </Badge>
      </div>

      {/* Info */}

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <User className="h-4 w-4 text-orange-500" />
          {project.created_by}
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-4 w-4 text-orange-500" />
          {project.start_date}
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-4 w-4 text-orange-500" />
          {project.end_date}
        </div>
      </div>

      {/* Buttons */}

      <div className="flex gap-3 pt-2">
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
