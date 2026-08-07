
import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Task {
  id: number;
  title: string;
  status: string;
}

interface Sprint {
  id: number;
  name: string;
  status: "planning" | "active" | "completed" | "closed";
  start_date: string;
  end_date: string;
  goal: string;
  tasks: Task[];
}

interface SprintBoardProps {
  projectId: number;
}

export default function SprintBoard({ projectId }: SprintBoardProps) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSprints();
  }, [projectId]);

  const fetchSprints = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/sprints/projects/${projectId}/sprints`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch sprints");
      }

      const data: Sprint[] = await res.json();

      setSprints(data);

      const active = data.find(
        (sprint) => sprint.status === "active"
      );

      setActiveSprint(active ?? null);
    } catch (error) {
      console.error("Error fetching sprints:", error);
    } finally {
      setLoading(false);
    }
  };

  const startSprint = async (sprintId: number) => {
    try {
      const res = await fetch(
        `/api/sprints/${sprintId}/start`,
        {
          method: "PATCH",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to start sprint");
      }

      await fetchSprints();
    } catch (error) {
      console.error("Error starting sprint:", error);
    }
  };

  const getProgress = (sprint: Sprint) => {
    if (sprint.tasks.length === 0) {
      return 0;
    }

    const completedTasks = sprint.tasks.filter(
      (task) => task.status === "done"
    ).length;

    return Math.round(
      (completedTasks / sprint.tasks.length) * 100
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Sprints</h1>
        <p className="text-gray-600">
          Plan and manage your project sprints.
        </p>
      </div>

      {/* Active Sprint */}
      {activeSprint && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">
                {activeSprint.name}
              </h2>

              <p className="text-gray-600 mt-1">
                {activeSprint.goal}
              </p>
            </div>

            <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
              Active
            </span>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span>
                {
                  activeSprint.tasks.filter(
                    (task) => task.status === "done"
                  ).length
                }{" "}
                / {activeSprint.tasks.length} tasks done
              </span>

              <span>{getProgress(activeSprint)}%</span>
            </div>

            <div className="w-full bg-gray-300 rounded h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded transition-all"
                style={{
                  width: `${getProgress(activeSprint)}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <p className="text-gray-500">
          Loading sprints...
        </p>
      )}

      {/* Sprint List */}
      {!loading && sprints.length === 0 && (
        <div className="border rounded-lg p-6 text-center">
          <p className="text-gray-500">
            No sprints found for this project.
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {sprints.map((sprint) => {
          const progress = getProgress(sprint);

          return (
            <div
              key={sprint.id}
              className="border rounded-lg p-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      {sprint.name}
                    </h3>

                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                      {sprint.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(
                      sprint.start_date
                    ).toLocaleDateString()}{" "}
                    -{" "}
                    {new Date(
                      sprint.end_date
                    ).toLocaleDateString()}
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    {sprint.goal}
                  </p>
                </div>

                {sprint.status === "planning" && (
                  <Button
                    onClick={() => startSprint(sprint.id)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </Button>
                )}
              </div>

              {/* Sprint Progress */}
              {sprint.tasks.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded h-2">
                    <div
                      className="bg-green-500 h-2 rounded transition-all"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

