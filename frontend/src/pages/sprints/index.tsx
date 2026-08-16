import * as React from "react";

import { Plus, Search, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import DeleteConfirm from "@/components/common/DeleteConfirm";
import SearchFilterBar from "@/components/common/SearchFilterBar";

import SprintTable from "./SprintTable";
import SprintModal from "./SprintModal";

import { type Sprint, type SprintStatus } from "./sprintData";
import { useSprints } from "@/context/SprintsContext";

/* ==========================================================
   FILTER TYPES
========================================================== */

type StatusFilter = "All" | SprintStatus;

type ProjectFilter = "All" | string;

/* ==========================================================
   OPTIONS
========================================================== */

const STATUS_OPTIONS: StatusFilter[] = [
  "All",
  "Planning",
  "Active",
  "Completed",
];

const PROJECT_OPTIONS = [
  "All",
  "Project Management SaaS",
  "Mobile App",
  "E-Commerce Platform",
  "CRM System",
  "Analytics Dashboard",
];

/* ==========================================================
   PAGE
========================================================== */

export default function SprintsPage() {
  const {
    sprints,
    addSprint,
    updateSprint,
    deleteSprint: removeSprint,
    reorderSprints,
  } = useSprints();

  const [searchTerm, setSearchTerm] = React.useState("");

  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("All");

  const [projectFilter, setProjectFilter] =
    React.useState<ProjectFilter>("All");

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const [editingSprint, setEditingSprint] = React.useState<Sprint | null>(null);

  const [deleteSprint, setDeleteSprint] = React.useState<Sprint | null>(null);

  const [saveError, setSaveError] = React.useState<string | null>(null);

  /* ========================================================
     FILTERED DATA
  ======================================================== */

  const filteredSprints = React.useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return sprints.filter((sprint) => {
      const matchesSearch =
        !search ||
        sprint.sprint_name.toLowerCase().includes(search) ||
        sprint.project.toLowerCase().includes(search) ||
        sprint.goal.toLowerCase().includes(search) ||
        sprint.created_by.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" || sprint.status === statusFilter;

      const matchesProject =
        projectFilter === "All" || sprint.project === projectFilter;

      return matchesSearch && matchesStatus && matchesProject;
    });
  }, [sprints, searchTerm, statusFilter, projectFilter]);

  /* ========================================================
     ACTIVE FILTERS
  ======================================================== */

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    statusFilter !== "All" ||
    projectFilter !== "All";

  /* ========================================================
     RESET FILTERS
  ======================================================== */

  const handleResetFilters = React.useCallback(() => {
    setSearchTerm("");
    setStatusFilter("All");
    setProjectFilter("All");
  }, []);

  /* ========================================================
     CREATE
  ======================================================== */

  const handleCreate = React.useCallback(() => {
    setEditingSprint(null);
    setIsModalOpen(true);
  }, []);

  /* ========================================================
     EDIT
  ======================================================== */

  const handleEdit = React.useCallback((sprint: Sprint) => {
    setEditingSprint(sprint);
    setIsModalOpen(true);
  }, []);

  /* ========================================================
     CLOSE MODAL
  ======================================================== */

  const handleCloseModal = React.useCallback(() => {
    setIsModalOpen(false);
    setEditingSprint(null);
    setSaveError(null);
  }, []);

  /* ========================================================
     SAVE SPRINT
  ======================================================== */

  const handleSaveSprint = React.useCallback(
    async (sprint: Sprint) => {
      try {
        if (editingSprint) {
          await updateSprint(sprint);
        } else {
          await addSprint(sprint);
        }

        handleCloseModal();
      } catch (err) {
        setSaveError(
          err instanceof Error ? err.message : "Failed to save sprint.",
        );
      }
    },
    [editingSprint, addSprint, updateSprint, handleCloseModal],
  );

  /* ========================================================
     DELETE
  ======================================================== */

  const handleDeleteClick = React.useCallback((sprint: Sprint) => {
    setDeleteSprint(sprint);
  }, []);

  const handleConfirmDelete = React.useCallback(() => {
    if (!deleteSprint) return;

    removeSprint(deleteSprint.id).catch((err) => {
      setSaveError(
        err instanceof Error ? err.message : "Failed to delete sprint.",
      );
    });

    setDeleteSprint(null);
  }, [deleteSprint, removeSprint]);

  /* ========================================================
     DRAG & DROP
  ======================================================== */

  const handleReorder = React.useCallback(
    (updatedSprints: Sprint[]) => {
      reorderSprints(updatedSprints);
    },
    [reorderSprints],
  );

  /* ========================================================
     UI
  ======================================================== */

  return (
    <div className="space-y-6">
      {/* ==================================================
            HEADER
        ================================================== */}

      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sprints</h1>

          <p className="mt-1 text-muted-foreground">
            Plan, manage and track project sprints.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleCreate}
          className="gap-2 rounded-xl bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          Create Sprint
        </Button>
      </div>

      {/* ==================================================
            FILTERS
        ================================================== */}

      <SearchFilterBar>
        {/* Search */}

        <div className="relative w-full sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <Input
            type="text"
            value={searchTerm}
            placeholder="Search sprint..."
            onChange={(event) => setSearchTerm(event.target.value)}
            className="rounded-xl border-border pl-9 focus-visible:ring-orange-500"
          />
        </div>

        {/* Project */}

        <Select
          value={projectFilter}
          onValueChange={(value) => setProjectFilter(value)}
        >
          <SelectTrigger className="w-full rounded-xl border-border sm:w-48">
            <SelectValue placeholder="Project" />
          </SelectTrigger>

          <SelectContent>
            {PROJECT_OPTIONS.map((project) => (
              <SelectItem key={project} value={project}>
                {project === "All" ? "All Projects" : project}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status */}

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger className="w-full rounded-xl border-border sm:w-40">
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

        {/* Reset */}

        <Button
          type="button"
          variant="outline"
          disabled={!hasActiveFilters}
          onClick={handleResetFilters}
          className={
            "w-full gap-2 rounded-xl border-border text-muted-foreground sm:w-auto " +
            (hasActiveFilters
              ? "border-orange-300 text-orange-600 hover:bg-orange-50"
              : "")
          }
        >
          <RotateCcw className="h-4 w-4" />
          Reset Filters
        </Button>
      </SearchFilterBar>

      {/* ==================================================
            ERROR BANNER
        ================================================== */}

      {saveError && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <p>{saveError}</p>

          <button
            type="button"
            onClick={() => setSaveError(null)}
            className="font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ==================================================
            TABLE
        ================================================== */}

      <SprintTable
        sprints={filteredSprints}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onChange={handleReorder}
      />

      {/* ==================================================
            MODAL
        ================================================== */}

      <SprintModal
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseModal();
          } else {
            setIsModalOpen(true);
          }
        }}
        sprint={editingSprint}
        onSave={handleSaveSprint}
        error={saveError}
      />

      {/* ==================================================
            DELETE CONFIRMATION
        ================================================== */}

      <DeleteConfirm
        open={!!deleteSprint}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteSprint(null);
          }
        }}
        title="Delete Sprint"
        description={
          deleteSprint
            ? `Are you sure you want to delete "${deleteSprint.sprint_name}"? This action cannot be undone.`
            : "Are you sure you want to delete this sprint?"
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
