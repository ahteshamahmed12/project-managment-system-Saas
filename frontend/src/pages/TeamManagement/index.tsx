import * as React from "react";
import { Plus, Search, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import DeleteConfirm from "@/components/common/DeleteConfirm";
import SearchFilterBar from "@/components/common/SearchFilterBar";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import TeamTable from "./TeamTable";
import TeamModal from "./TeamModal";

import { teamData, type Team } from "./teamData";

/* =========================================================
   TYPES
========================================================= */

type StatusFilter = "All" | Team["status"];

type TeamFormValues = Omit<Team, "id" | "created_at">;

/* =========================================================
   STATIC CONFIG
========================================================= */

const STATUS_OPTIONS: StatusFilter[] = ["All", "Active", "Inactive"];

/* =========================================================
   PAGE
========================================================= */

export default function TeamManagementPage() {
  /* =======================================================
     TEAMS STATE
  ======================================================= */

  const [teams, setTeams] = React.useState<Team[]>(teamData);

  /* =======================================================
     FILTER STATE
  ======================================================= */

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("All");

  /* =======================================================
     MODAL STATE
  ======================================================= */

  const [modalOpen, setModalOpen] = React.useState(false);

  const [editingTeam, setEditingTeam] = React.useState<Team | null>(null);

  /* =======================================================
     DELETE STATE
  ======================================================= */

  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null);

  /* =======================================================
     FILTERED TEAMS
  ======================================================= */

  const filteredTeams = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return teams.filter((team) => {
      const matchesSearch =
        normalizedSearch === "" ||
        team.team_name.toLowerCase().includes(normalizedSearch) ||
        team.description.toLowerCase().includes(normalizedSearch) ||
        team.project.toLowerCase().includes(normalizedSearch) ||
        team.team_lead.toLowerCase().includes(normalizedSearch);

      const matchesStatus = status === "All" || team.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [teams, search, status]);

  /* =======================================================
     FILTER HELPERS
  ======================================================= */

  const hasActiveFilters = search.trim().length > 0 || status !== "All";

  const handleResetFilters = React.useCallback(() => {
    setSearch("");
    setStatus("All");
  }, []);

  /* =======================================================
     CREATE
  ======================================================= */

  const handleCreate = React.useCallback(() => {
    setEditingTeam(null);
    setModalOpen(true);
  }, []);

  /* =======================================================
     EDIT
  ======================================================= */

  const handleEdit = React.useCallback((team: Team) => {
    setEditingTeam(team);
    setModalOpen(true);
  }, []);

  /* =======================================================
     MODAL CHANGE
  ======================================================= */

  const handleModalOpenChange = React.useCallback((open: boolean) => {
    setModalOpen(open);

    if (!open) {
      setEditingTeam(null);
    }
  }, []);

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDeleteTeam = React.useCallback((team: Team) => {
    setSelectedTeam(team);
    setDeleteOpen(true);
  }, []);

  /* =======================================================
     CONFIRM DELETE
  ======================================================= */

  const confirmDelete = React.useCallback(() => {
    if (!selectedTeam) return;

    setTeams((prev) => prev.filter((team) => team.id !== selectedTeam.id));

    setSelectedTeam(null);
    setDeleteOpen(false);

    // TODO:
    // await teamApi.delete(selectedTeam.id)
  }, [selectedTeam]);

  /* =======================================================
     SAVE TEAM
  ======================================================= */

  const handleSave = React.useCallback(
    (values: TeamFormValues) => {
      if (editingTeam) {
        /* UPDATE */

        setTeams((prev) =>
          prev.map((team) =>
            team.id === editingTeam.id
              ? {
                  ...team,
                  ...values,
                }
              : team,
          ),
        );
      } else {
        /* CREATE */

        const newTeam: Team = {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          ...values,
        };

        setTeams((prev) => [newTeam, ...prev]);
      }

      setModalOpen(false);
      setEditingTeam(null);
    },
    [editingTeam],
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6">
      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Team Management
          </h1>

          <p className="text-sm text-muted-foreground">
            Create, manage, and organize your project teams.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleCreate}
          className="w-full gap-2 rounded-xl bg-orange-500 font-semibold text-white shadow-sm hover:bg-orange-600 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Create Team
        </Button>
      </div>

      {/* ===================================================
          FILTERS
      =================================================== */}

      <SearchFilterBar>
        {/* Search */}

        <div className="relative w-full sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by team name..."
            className="rounded-xl border-border bg-background pl-9 focus-visible:ring-orange-500"
          />
        </div>

        {/* Status */}

        <Select
          value={status}
          onValueChange={(value) => setStatus(value as StatusFilter)}
        >
          <SelectTrigger className="w-full rounded-xl border-border bg-background sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent>
            {STATUS_OPTIONS.map((item) => (
              <SelectItem key={item} value={item}>
                {item === "All" ? "All Statuses" : item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset */}

        <Button
          type="button"
          variant="outline"
          onClick={handleResetFilters}
          disabled={!hasActiveFilters}
          className={cn(
            "w-full gap-2 rounded-xl border-border text-muted-foreground sm:w-auto",
            hasActiveFilters &&
              "border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950/30",
          )}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </SearchFilterBar>

      {/* ===================================================
          TEAM TABLE
      =================================================== */}

      <TeamTable
        teams={filteredTeams}
        onChange={setTeams}
        onEdit={handleEdit}
        onDelete={handleDeleteTeam}
      />

      {/* ===================================================
          CREATE / EDIT MODAL
      =================================================== */}

      <TeamModal
        open={modalOpen}
        onOpenChange={handleModalOpenChange}
        team={editingTeam}
        onSave={handleSave}
      />

      {/* ===================================================
          DELETE CONFIRMATION
      =================================================== */}

      <DeleteConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Team"
        description={`Are you sure you want to delete "${selectedTeam?.team_name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
