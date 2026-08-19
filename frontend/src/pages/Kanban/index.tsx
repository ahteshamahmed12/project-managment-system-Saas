import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import {
  ArrowLeft,
  Kanban,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DeleteConfirm from "@/components/common/DeleteConfirm";

import KanbanColumn from "./KanbanColumn";
import KanbanTaskModal from "./KanbanTaskModal";

import { kanbanApi } from "@/lib/kanban-api";
import { useProjects } from "@/context/Projectscontext";
import {
  STATUS_LABELS,
  type BoardStats,
  type KanbanBoard,
  type KanbanBoardDetail,
  type KanbanColumnDetail,
  type KanbanPriority,
  type KanbanStatus,
  type KanbanTask,
  type KanbanUser,
} from "@/types/kanban";

/* ==========================================================
   HELPERS
========================================================== */

function computeOrder(tasks: KanbanTask[], index: number): number {
  const prev = tasks[index - 1];
  const next = tasks[index + 1];
  if (!prev && !next) return 1.0;
  if (!prev) return next.order / 2;
  if (!next) return prev.order + 1.0;
  return (prev.order + next.order) / 2;
}

/* ==========================================================
   STATS BAR
========================================================== */

function StatsBar({ stats }: { stats: BoardStats | null }) {
  if (!stats) return null;

  const items = [
    { label: "Total", value: stats.total, accent: "text-foreground" },
    {
      label: "Todo",
      value: stats.todo,
      accent: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "In Progress",
      value: stats.in_progress,
      accent: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "In Review",
      value: stats.in_review,
      accent: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Done",
      value: stats.done,
      accent: "text-green-600 dark:text-green-400",
    },
    {
      label: "Blocked",
      value: stats.blocked,
      accent: "text-red-600 dark:text-red-400",
    },
    {
      label: "Completion",
      value: `${stats.completion_percentage.toFixed(0)}%`,
      accent: "text-green-600 dark:text-green-400",
    },
    {
      label: "Story Points",
      value: `${stats.completed_story_points}/${stats.total_story_points}`,
      accent: "text-muted-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-4 lg:grid-cols-8">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <p
            className={cn(
              "text-lg font-bold tabular-nums",
              item.accent,
            )}
          >
            {item.value}
          </p>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ==========================================================
   COLUMN EDIT / CREATE MODAL
========================================================== */

interface ColumnModalState {
  open: boolean;
  column: KanbanColumnDetail | null;
}

const COLUMN_STATUS_OPTIONS: KanbanStatus[] = [
  "todo",
  "in_progress",
  "in_review",
  "done",
  "blocked",
];

function ColumnModal({
  state,
  onOpenChange,
  onSave,
  saving,
}: {
  state: ColumnModalState;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: {
    name: string;
    status: KanbanStatus;
    wip_limit: number | null;
  }) => Promise<void>;
  saving: boolean;
}) {
  const [name, setName] = React.useState("");
  const [status, setStatus] = React.useState<KanbanStatus>("todo");
  const [wipLimit, setWipLimit] = React.useState("");

  React.useEffect(() => {
    if (state.open) {
      setName(state.column?.name ?? "");
      setStatus(state.column?.status ?? "todo");
      setWipLimit(
        state.column?.wip_limit != null ? String(state.column.wip_limit) : "",
      );
    }
  }, [state]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const limit =
      wipLimit.trim() === "" ? null : Number(wipLimit);
    if (limit !== null && (Number.isNaN(limit) || limit < 0)) return;
    await onSave({ name: name.trim(), status, wip_limit: limit });
  };

  return (
    <Dialog open={state.open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {state.column ? "Edit Column" : "Add Column"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Column Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Backlog"
              required
            />
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as KanbanStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLUMN_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {STATUS_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>WIP Limit (empty = unlimited)</Label>
            <Input
              type="number"
              min="0"
              value={wipLimit}
              onChange={(e) => setWipLimit(e.target.value)}
              placeholder="Unlimited"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {saving
                ? "Saving..."
                : state.column
                  ? "Save Changes"
                  : "Add Column"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ==========================================================
   PAGE
========================================================== */

export default function KanbanBoardPage() {
  const { projectId = "" } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects } = useProjects();

  const project = projects.find((item) => item.id === projectId);

  const [boards, setBoards] = React.useState<KanbanBoard[]>([]);
  const [board, setBoard] = React.useState<KanbanBoardDetail | null>(null);
  const [stats, setStats] = React.useState<BoardStats | null>(null);
  const [users, setUsers] = React.useState<KanbanUser[]>([]);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [creatingBoard, setCreatingBoard] = React.useState(false);
  const [savingColumn, setSavingColumn] = React.useState(false);
  const [savingTask, setSavingTask] = React.useState(false);

  const [columnModal, setColumnModal] = React.useState<ColumnModalState>({
    open: false,
    column: null,
  });
  const [taskModal, setTaskModal] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<KanbanTask | null>(null);
  const [newTaskColumn, setNewTaskColumn] = React.useState<number | null>(null);
  const [deleteColumn, setDeleteColumn] =
    React.useState<KanbanColumnDetail | null>(null);
  const [deleteBoardOpen, setDeleteBoardOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const loadBoards = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await kanbanApi.listProjectBoards(projectId);
      setBoards(list);
      if (list.length > 0) {
        setBoard(await kanbanApi.getBoard(list[0].id));
      } else {
        setBoard(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load board.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const loadBoardDetail = React.useCallback(async (boardId: number) => {
    try {
      const [detail, boardStats] = await Promise.all([
        kanbanApi.getBoard(boardId),
        kanbanApi.getBoardStats(boardId),
      ]);
      setBoard(detail);
      setStats(boardStats);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load board data.",
      );
    }
  }, []);

  React.useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  React.useEffect(() => {
    kanbanApi.listUsers().then(setUsers);
  }, []);

  React.useEffect(() => {
    if (board) {
      loadBoardDetail(board.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board?.id]);

  /* ---------------- board ops ---------------- */

  const handleCreateBoard = async () => {
    setCreatingBoard(true);
    setError(null);
    try {
      const created = await kanbanApi.createBoard({
        project_id: Number(projectId),
        name: project ? `${project.project_name} Board` : "Kanban Board",
      });
      setBoards((prev) => [...prev, created]);
      setBoard(created);
      setStats(await kanbanApi.getBoardStats(created.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board.");
    } finally {
      setCreatingBoard(false);
    }
  };

  const handleDeleteBoard = async () => {
    if (!board) return;
    try {
      await kanbanApi.deleteBoard(board.id);
      setDeleteBoardOpen(false);
      await loadBoards();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete board.");
    }
  };

  /* ---------------- column ops ---------------- */

  const handleSaveColumn = async (payload: {
    name: string;
    status: KanbanStatus;
    wip_limit: number | null;
  }) => {
    if (!board) return;
    setSavingColumn(true);
    setError(null);
    try {
      if (columnModal.column) {
        await kanbanApi.updateColumn(columnModal.column.id, payload);
      } else {
        await kanbanApi.createColumn(board.id, payload);
      }
      setColumnModal({ open: false, column: null });
      await loadBoardDetail(board.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save column.");
    } finally {
      setSavingColumn(false);
    }
  };

  const handleDeleteColumn = async () => {
    if (!deleteColumn || !board) return;
    try {
      await kanbanApi.deleteColumn(deleteColumn.id);
      setDeleteColumn(null);
      await loadBoardDetail(board.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete column.",
      );
    }
  };

  /* ---------------- task ops ---------------- */

  const applyTaskUpdate = React.useCallback(
    (updated: KanbanTask) => {
      setBoard((prev) => {
        if (!prev) return prev;
        const exists = prev.tasks.some((task) => task.id === updated.id);
        return {
          ...prev,
          tasks: exists
            ? prev.tasks.map((task) => (task.id === updated.id ? updated : task))
            : [...prev.tasks, updated],
        };
      });
    },
    [],
  );

  const handleCreateTask = async (payload: {
    title: string;
    description: string | null;
    column_id: number | null;
    priority: KanbanPriority;
    assignee_id: string | null;
    story_points: number | null;
    time_estimate: number | null;
    due_date: string | null;
    tags: string[];
  }) => {
    if (!board) return;
    setSavingTask(true);
    setError(null);
    try {
      const columnId = payload.column_id ?? newTaskColumn ?? board.columns[0]?.id;
      const created = await kanbanApi.createTask(board.id, {
        ...payload,
        column_id: columnId,
      });
      applyTaskUpdate(created);
      setStats(await kanbanApi.getBoardStats(board.id));
    } finally {
      setSavingTask(false);
    }
  };

  const handleUpdateTask = async (
    taskId: number,
    payload: {
      title: string;
      description: string | null;
      column_id: number | null;
      priority: KanbanPriority;
      assignee_id: string | null;
      story_points: number | null;
      time_estimate: number | null;
      due_date: string | null;
      tags: string[];
      is_blocked: boolean;
      blocked_reason: string | null;
    },
  ) => {
    if (!board) return;
    setSavingTask(true);
    setError(null);
    try {
      const updated = await kanbanApi.updateTask(taskId, payload);
      applyTaskUpdate(updated);
      setStats(await kanbanApi.getBoardStats(board.id));
    } finally {
      setSavingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!board) return;
    try {
      await kanbanApi.deleteTask(taskId);
      setBoard((prev) =>
        prev
          ? { ...prev, tasks: prev.tasks.filter((task) => task.id !== taskId) }
          : prev,
      );
      setStats(await kanbanApi.getBoardStats(board.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task.");
    }
  };

  /* ---------------- drag & drop ---------------- */

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || !board) return;

    const sourceColumnId = Number(
      source.droppableId.replace("column-", ""),
    );
    const destinationColumnId = Number(
      destination.droppableId.replace("column-", ""),
    );
    const taskId = Number(draggableId.replace("task-", ""));

    if (
      sourceColumnId === destinationColumnId &&
      source.index === destination.index
    ) {
      return;
    }

    const snapshot = board;

    const newTasks = [...board.tasks];
    const taskIndex = newTasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) return;
    const [moved] = newTasks.splice(taskIndex, 1);
    const movedTask: KanbanTask = { ...moved, column_id: destinationColumnId };
    newTasks.push(movedTask);

    setBoard({ ...board, tasks: newTasks });

    const destList = newTasks
      .filter((task) => task.column_id === destinationColumnId)
      .sort((a, b) => a.order - b.order);
    const order = computeOrder(destList, destination.index);

    try {
      const updated = await kanbanApi.moveTask(taskId, destinationColumnId, order);
      applyTaskUpdate(updated);
      setStats(await kanbanApi.getBoardStats(board.id));
    } catch (err) {
      setBoard(snapshot);
      setError(
        err instanceof Error ? err.message : "Failed to move task.",
      );
    }
  };

  /* ---------------- task modal helpers ---------------- */

  const openCreateTask = (columnId: number | null = null) => {
    setEditingTask(null);
    setNewTaskColumn(columnId);
    setTaskModal(true);
  };

  const openEditTask = (task: KanbanTask) => {
    setEditingTask(task);
    setNewTaskColumn(null);
    setTaskModal(true);
  };

  const filteredTasks = React.useMemo(() => {
    if (!board || !searchTerm.trim()) return board?.tasks ?? [];
    const q = searchTerm.trim().toLowerCase();
    return board.tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(q) ||
        (task.description ?? "").toLowerCase().includes(q) ||
        (task.tags ?? []).some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [board, searchTerm]);

  /* ---------------- render ---------------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Back to projects"
            onClick={() => navigate("/projects")}
            className="rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Kanban Board</h1>
            <p className="text-sm text-muted-foreground">
              {project?.project_name ?? "Project"}
            </p>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card py-24 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white">
            <Kanban className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold">No board yet</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Create a Kanban board for this project to start tracking tasks
            visually.
          </p>
          <Button
            type="button"
            onClick={handleCreateBoard}
            disabled={creatingBoard}
            className="mt-2 gap-2 rounded-xl bg-orange-500 hover:bg-orange-600"
          >
            {creatingBoard ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Create Board
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Back to projects"
            onClick={() => navigate("/projects")}
            className="rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{board.name}</h1>
              {boards.length > 1 && (
                <Select
                  value={String(board.id)}
                  onValueChange={(value) =>
                    loadBoardDetail(Number(value))
                  }
                >
                  <SelectTrigger className="w-40 rounded-xl border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {project?.project_name ?? "Project"} · Kanban board
            </p>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks..."
              className="w-full rounded-xl border-border pl-9 focus-visible:ring-orange-500 sm:w-56"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Delete board"
            onClick={() => setDeleteBoardOpen(true)}
            className="rounded-xl text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            onClick={() => openCreateTask()}
            className="gap-2 rounded-xl bg-orange-500 hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </p>
      )}

      <StatsBar stats={stats} />

      {/* Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {board.columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={filteredTasks.filter(
                (task) => task.column_id === column.id,
              )}
              onAddTask={openCreateTask}
              onOpenTask={openEditTask}
              onDeleteColumn={setDeleteColumn}
            />
          ))}

          {/* Add column */}
          <button
            type="button"
            onClick={() => setColumnModal({ open: true, column: null })}
            className="flex w-72 shrink-0 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground transition-colors hover:border-orange-400 hover:text-orange-600 dark:hover:border-orange-700 dark:hover:text-orange-400"
          >
            <Plus className="h-4 w-4" />
            Add Column
          </button>
        </div>
      </DragDropContext>

      {/* Column modal */}
      <ColumnModal
        state={columnModal}
        onOpenChange={(open) =>
          setColumnModal((prev) => ({ ...prev, open }))
        }
        onSave={handleSaveColumn}
        saving={savingColumn}
      />

      {/* Task modal */}
      <KanbanTaskModal
        open={taskModal}
        onOpenChange={setTaskModal}
        task={editingTask}
        columns={board.columns}
        users={users}
        onCreate={handleCreateTask}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        saving={savingTask}
      />

      {/* Delete column confirm */}
      <DeleteConfirm
        open={!!deleteColumn}
        onOpenChange={(open) => {
          if (!open) setDeleteColumn(null);
        }}
        title="Delete Column"
        description={
          deleteColumn
            ? `Are you sure you want to delete "${deleteColumn.name}"? Its tasks will be moved to the first remaining column.`
            : "Are you sure you want to delete this column?"
        }
        onConfirm={handleDeleteColumn}
      />

      {/* Delete board confirm */}
      <DeleteConfirm
        open={deleteBoardOpen}
        onOpenChange={setDeleteBoardOpen}
        title="Delete Board"
        description="Are you sure you want to delete this board? All its columns and tasks will be permanently removed."
        onConfirm={handleDeleteBoard}
      />
    </div>
  );
}