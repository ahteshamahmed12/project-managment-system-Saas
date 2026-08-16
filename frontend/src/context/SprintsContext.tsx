import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Sprint } from "@/pages/Sprints/sprintData";
import { sprintsApi } from "@/lib/sprints-api";

interface SprintsContextType {
  sprints: Sprint[];
  loading: boolean;
  error: string | null;
  addSprint: (sprint: Sprint) => Promise<void>;
  updateSprint: (sprint: Sprint) => Promise<void>;
  deleteSprint: (id: string) => Promise<void>;
  reorderSprints: (sprints: Sprint[]) => void;
  clearError: () => void;
}

const SprintsContext = createContext<SprintsContextType | null>(null);

export function SprintsProvider({ children }: { children: ReactNode }) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    sprintsApi
      .getSprints()
      .then((fetched) => {
        if (!cancelled) {
          setSprints(fetched);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load sprints.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const addSprint = useCallback(async (sprint: Sprint) => {
    setSprints((prev) => [sprint, ...prev]);

    try {
      const saved = await sprintsApi.createSprint(sprint);

      setSprints((prev) =>
        prev.map((item) => (item.id === sprint.id ? saved : item)),
      );
      setError(null);
    } catch (err) {
      setSprints((prev) => prev.filter((item) => item.id !== sprint.id));
      setError(
        err instanceof Error ? err.message : "Failed to create sprint.",
      );
      throw err;
    }
  }, []);

  const updateSprint = useCallback(async (sprint: Sprint) => {
    const previous = sprints.find((item) => item.id === sprint.id);

    setSprints((prev) =>
      prev.map((item) => (item.id === sprint.id ? sprint : item)),
    );

    try {
      const saved = await sprintsApi.updateSprint(sprint);

      setSprints((prev) =>
        prev.map((item) => (item.id === sprint.id ? saved : item)),
      );
      setError(null);
    } catch (err) {
      if (previous) {
        setSprints((prev) =>
          prev.map((item) => (item.id === sprint.id ? previous : item)),
        );
      }
      setError(
        err instanceof Error ? err.message : "Failed to update sprint.",
      );
      throw err;
    }
  }, [sprints]);

  const deleteSprint = useCallback(async (id: string) => {
    try {
      await sprintsApi.deleteSprint(id);
      setSprints((prev) => prev.filter((sprint) => sprint.id !== id));
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete sprint.",
      );
      throw err;
    }
  }, []);

  const reorderSprints = useCallback((reordered: Sprint[]) => {
    setSprints(reordered);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <SprintsContext.Provider
      value={{
        sprints,
        loading,
        error,
        addSprint,
        updateSprint,
        deleteSprint,
        reorderSprints,
        clearError,
      }}
    >
      {children}
    </SprintsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSprints() {
  const context = useContext(SprintsContext);

  if (!context) {
    throw new Error("useSprints must be used inside SprintsProvider");
  }

  return context;
}