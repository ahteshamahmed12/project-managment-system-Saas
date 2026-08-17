import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare,
  FolderKanban,
  Loader2,
  Rocket,
  Search,
  User as UserIcon,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { globalSearch, type SearchResults } from "@/lib/search-api";

type ResultKind = "user" | "project" | "sprint" | "task";

interface ResultItem {
  kind: ResultKind;
  id: string;
  title: string;
  subtitle: string;
  route: string;
}

const EMPTY_RESULTS: SearchResults = {
  users: [],
  projects: [],
  sprints: [],
  tasks: [],
};

const KIND_LABELS: Record<ResultKind, string> = {
  user: "User",
  project: "Project",
  sprint: "Sprint",
  task: "Task",
};

const KIND_ICONS: Record<ResultKind, React.ComponentType<{ className?: string }>> = {
  user: UserIcon,
  project: FolderKanban,
  sprint: Rocket,
  task: CheckSquare,
};

function buildItems(results: SearchResults): ResultItem[] {
  const items: ResultItem[] = [];

  for (const user of results.users) {
    items.push({
      kind: "user",
      id: user.id,
      title: user.name,
      subtitle: user.email,
      route: `/users/${user.id}/profile`,
    });
  }

  for (const project of results.projects) {
    items.push({
      kind: "project",
      id: String(project.id),
      title: project.name,
      subtitle: project.description ?? "",
      route: "/projects",
    });
  }

  for (const sprint of results.sprints) {
    items.push({
      kind: "sprint",
      id: String(sprint.id),
      title: sprint.name,
      subtitle: sprint.goal ?? sprint.project,
      route: "/sprint",
    });
  }

  for (const task of results.tasks) {
    items.push({
      kind: "task",
      id: String(task.id),
      title: task.title,
      subtitle: task.description ?? "",
      route: `/tasks/${task.id}`,
    });
  }

  return items;
}

export default function GlobalSearch() {
  const navigate = useNavigate();

  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);

  /* =========================================================
     CLOSE ON CLICK OUTSIDE
  ========================================================= */

  React.useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);

    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  /* =========================================================
     DEBOUNCED SEARCH
  ========================================================= */

  React.useEffect(() => {
    const term = query.trim();

    if (term.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setOpen(true);

      globalSearch(term, controller.signal)
        .then((response) => {
          setResults(response.data);
        })
        .catch(() => {
          // Ignore aborted requests and transient failures.
        })
        .finally(() => {
          setLoading(false);
        });
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);

    if (value.trim().length < 2) {
      setResults(EMPTY_RESULTS);
      setLoading(false);
      setOpen(false);
    }
  };

  const handleSelect = (item: ResultItem) => {
    setOpen(false);
    setQuery("");
    setResults(EMPTY_RESULTS);
    navigate(item.route);
  };

  const items = buildItems(results);

  const grouped = (
    ["users", "projects", "sprints", "tasks"] as const
  ).map((group) => ({
    group,
    label: KIND_LABELS[group.slice(0, -1) as ResultKind],
    items: items.filter((item) => item.kind === group.slice(0, -1)),
  }));

  return (
    <div ref={containerRef} className="relative mx-auto max-w-xl">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

      <Input
        value={query}
        onChange={handleChange}
        onFocus={() => query.trim().length >= 2 && setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder="Search..."
        className="rounded-full border-border bg-card pl-11 shadow-sm"
      />

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-border bg-card shadow-xl">
          {loading && (
            <div className="flex items-center justify-center px-3 py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && items.length === 0 && (
            <p className="px-4 py-4 text-sm text-muted-foreground">
              No results found for &ldquo;{query.trim()}&rdquo;
            </p>
          )}

          {!loading &&
            grouped.map(
              ({ group, label, items: groupItems }) =>
                groupItems.length > 0 && (
                  <div key={group}>
                    <p className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {label}s
                    </p>

                    {groupItems.map((item) => {
                      const Icon = KIND_ICONS[item.kind];

                      return (
                        <button
                          key={`${item.kind}-${item.id}`}
                          type="button"
                          onClick={() => handleSelect(item)}
                          className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-foreground">
                              {item.title}
                            </span>

                            {item.subtitle && (
                              <span className="block truncate text-xs text-muted-foreground">
                                {item.subtitle}
                              </span>
                            )}
                          </span>

                          <Badge variant="secondary">{label}</Badge>
                        </button>
                      );
                    })}
                  </div>
                ),
            )}
        </div>
      )}
    </div>
  );
}