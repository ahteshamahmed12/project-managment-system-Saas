import * as React from "react";

import { Search, RotateCcw } from "lucide-react";

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

import SearchFilterBar from "@/components/common/SearchFilterBar";
import DeleteConfirm from "@/components/common/DeleteConfirm";

import TaskTable from "./TaskTable";
import TaskModal from "./TaskModal";

import { taskData, type Task } from "./taskData";
import { tasksApi } from "@/lib/tasks-api";
import { useNavigate } from "react-router-dom";

/* ==========================================================
   TYPES
========================================================== */

type StatusFilter = "All" | Task["status"];
type PriorityFilter = "All" | Task["priority"];
type ProjectFilter = "All" | string;

const STATUS_OPTIONS: StatusFilter[] = [
  "All",
  "Todo",
  "In Progress",
  "Review",
  "Completed",
];

const PRIORITY_OPTIONS: PriorityFilter[] = ["All", "Low", "Medium", "High"];

/* ==========================================================
   PAGE
========================================================== */

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>(taskData);

  const [searchTerm, setSearchTerm] = React.useState("");

  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("All");

  const [priorityFilter, setPriorityFilter] =
    React.useState<PriorityFilter>("All");

  const [projectFilter, setProjectFilter] =
    React.useState<ProjectFilter>("All");
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const [editingTask, setEditingTask] = React.useState<Task | null>(null);

  const [deleteTask, setDeleteTask] = React.useState<Task | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    tasksApi
      .getTasks()
      .then((data) => {
        if (!cancelled && data.length > 0) {
          setTasks(data);
        }
      })
      .catch(() => {
        // Keep fallback data if not logged in or backend offline
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const projectOptions = React.useMemo(() => {
    return ["All", ...new Set(tasks.map((task) => task.project))];
  }, [tasks]);

  const filteredTasks = React.useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !search || task.task_name.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter;

      const matchesProject =
        projectFilter === "All" || task.project === projectFilter;

      return (
        matchesSearch && matchesStatus && matchesPriority && matchesProject
      );
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter, projectFilter]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    statusFilter !== "All" ||
    priorityFilter !== "All" ||
    projectFilter !== "All";
  /* ==========================================================
     HANDLERS
  ========================================================== */

  const handleResetFilters = React.useCallback(() => {
    setSearchTerm("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setProjectFilter("All");
  }, []);

  const handleOpenCreateModal = React.useCallback(() => {
    setEditingTask(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = React.useCallback((task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  }, []);
  const handleOpenView = React.useCallback(
    (task: Task) => {
      navigate(`/tasks/${task.id}`, {
        state: { task },
      });
    },
    [navigate],
  );

  const handleCloseModal = React.useCallback(() => {
    setEditingTask(null);
    setIsModalOpen(false);
  }, []);

  const handleDeleteClick = React.useCallback((task: Task) => {
    setDeleteTask(task);
  }, []);

  const handleConfirmDelete = React.useCallback(async () => {
    if (!deleteTask) return;

    const idToDelete = deleteTask.id;
    setTasks((prev) => prev.filter((task) => task.id !== idToDelete));
    setDeleteTask(null);

    try {
      await tasksApi.deleteTask(idToDelete);
    } catch {
      // Local state already updated
    }
  }, [deleteTask]);

  const handleReorderTasks = React.useCallback((updated: Task[]) => {
    setTasks(updated);
  }, []);

  const handleSaveTask = React.useCallback(
    async (task: Task) => {
      if (editingTask) {
        setTasks((prev) =>
          prev.map((item) => (item.id === editingTask.id ? task : item)),
        );

        try {
          const saved = await tasksApi.updateTask(editingTask.id, task);
          setTasks((prev) =>
            prev.map((item) => (item.id === editingTask.id ? saved : item)),
          );
        } catch {
          // Keep local update
        }
      } else {
        const tempId = crypto.randomUUID();
        const newTask: Task = {
          ...task,
          id: tempId,
          created_by: "Admin",
          created_at: new Date().toISOString(),
        };

        setTasks((prev) => [newTask, ...prev]);

        try {
          const saved = await tasksApi.createTask(task);
          setTasks((prev) =>
            prev.map((item) => (item.id === tempId ? saved : item)),
          );
        } catch {
          // Keep local created task
        }
      }

      handleCloseModal();
    },
    [editingTask, handleCloseModal],
  );

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>

          <p className="mt-1">Manage, assign and track project tasks.</p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          className="rounded-xl bg-orange-500 hover:bg-orange-600"
        >
          Create Task
        </Button>
      </div>

      <SearchFilterBar>
        {/* Search */}

        <div className="relative w-full sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <Input
            type="text"
            value={searchTerm}
            placeholder="Search task..."
            onChange={(event) => setSearchTerm(event.target.value)}
            className="rounded-xl border-gray-200 pl-9 focus-visible:ring-orange-500"
          />
        </div>

        {/* Project */}

        <Select
          value={projectFilter}
          onValueChange={(value) => setProjectFilter(value)}
        >
          <SelectTrigger className="w-full rounded-xl border-gray-200 sm:w-44">
            <SelectValue placeholder="Project" />
          </SelectTrigger>

          <SelectContent>
            {projectOptions.map((project) => (
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
          <SelectTrigger className="w-full rounded-xl border-gray-200 sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {status === "All" ? "All Status" : status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority */}

        <Select
          value={priorityFilter}
          onValueChange={(value) => setPriorityFilter(value as PriorityFilter)}
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

        {/* Reset */}

        <Button
          type="button"
          variant="outline"
          disabled={!hasActiveFilters}
          onClick={handleResetFilters}
          className={cn(
            "w-full gap-2 rounded-xl border-gray-200 text-gray-600 sm:w-auto",
            hasActiveFilters &&
              "border-orange-300 text-orange-600 hover:bg-orange-50",
          )}
        >
          <RotateCcw className="h-4 w-4" />
          Reset Filters
        </Button>
      </SearchFilterBar>
      {/* Table */}

      <TaskTable
        tasks={filteredTasks}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteClick}
        onView={handleOpenView}
        onChange={handleReorderTasks}
      />

      {/* Modal */}

      <TaskModal
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseModal();
          }
        }}
        task={editingTask}
        onSave={handleSaveTask}
      />

      <div className="mt-6 border-t border-border pt-6"></div>
      {/* Delete Confirmation */}

      <DeleteConfirm
        open={!!deleteTask}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTask(null);
          }
        }}
        title="Delete Task"
        description={
          deleteTask
            ? `Are you sure you want to delete "${deleteTask.task_name}"? This action cannot be undone.`
            : "Are you sure you want to delete this task?"
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
