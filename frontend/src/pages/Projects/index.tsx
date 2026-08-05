import * as React from "react";
import { Plus, Search, RotateCcw, FolderKanban } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ProjectTable } from "@/pages/Projects/ProjectTable";
import type { Project } from "@/pages/Projects/projectData";
import { useProjects } from "@/context/Projectscontext";
import ProjectModal from "./ProjectModal";

/* =========================================================
   TYPES
========================================================= */

type StatusFilter = "All" | Project["status"];
type PriorityFilter = "All" | Project["priority"];

/* =========================================================
   STATIC CONFIG
========================================================= */

const STATUS_OPTIONS: StatusFilter[] = [
  "All",
  "Active",
  "On Hold",
  "Completed",
];
const PRIORITY_OPTIONS: PriorityFilter[] = ["All", "Low", "Medium", "High"];

/* =========================================================
   PAGE
========================================================= */

export default function ProjectsPage(): React.JSX.Element {
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    reorderProjects,
  } = useProjects();

  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("All");
  const [priorityFilter, setPriorityFilter] =
    React.useState<PriorityFilter>("All");

  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(
    null,
  );

  const filteredProjects = React.useMemo<Project[]>(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        project.project_name.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" || project.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || project.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [projects, searchTerm, statusFilter, priorityFilter]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    statusFilter !== "All" ||
    priorityFilter !== "All";

  const handleResetFilters = React.useCallback(() => {
    setSearchTerm("");
    setStatusFilter("All");
    setPriorityFilter("All");
  }, []);

  const handleOpenCreateModal = React.useCallback(() => {
    setEditingProject(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = React.useCallback((project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  }, []);

  const handleModalOpenChange = React.useCallback((open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setEditingProject(null);
    }
  }, []);

  const handleDeleteProject = React.useCallback(
    (project: Project) => {
      const isConfirmed = window.confirm(
        `Are you sure you want to delete "${project.project_name}"? This action cannot be undone.`,
      );

      if (!isConfirmed) {
        return;
      }

      deleteProject(project.id);
    },
    [deleteProject],
  );

  const handleSaveProject = React.useCallback(
    (project: Project) => {
      if (editingProject) {
        updateProject(project);
      } else {
        addProject(project);
      }
    },
    [editingProject, addProject, updateProject],
  );

  return (
    <div className="w-full bg-gray-50">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-sm">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                Projects
              </h1>
              <p className="text-sm text-gray-500">
                Manage, track, and organize all your projects in one place.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleOpenCreateModal}
            className="w-full gap-2 rounded-xl p-5 bg-orange-500 font-semibold text-white shadow-sm hover:bg-orange-600 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative w-full sm:max-w-xs sm:flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by project name..."
                className="rounded-xl border-gray-200 pl-9 focus-visible:ring-orange-500"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger className="w-full rounded-xl border-gray-200 sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "All" ? "All Statuses" : status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={priorityFilter}
              onValueChange={(value) =>
                setPriorityFilter(value as PriorityFilter)
              }
            >
              <SelectTrigger className="w-full rounded-xl border-gray-200 sm:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority === "All" ? "All Priorities" : priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
              className={cn(
                "w-full gap-2 rounded-xl border-gray-200 text-gray-600 sm:w-auto",
                hasActiveFilters &&
                  "border-orange-300 text-orange-600 hover:bg-orange-50",
              )}
            >
              <RotateCcw className="h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Table */}
        <ProjectTable
          projects={filteredProjects}
          onChange={reorderProjects}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteProject}
        />
      </div>

      {/* Create / Edit Modal */}
      <ProjectModal
        open={isModalOpen}
        onOpenChange={handleModalOpenChange}
        project={editingProject}
        onSave={handleSaveProject}
      />
    </div>
  );
}
