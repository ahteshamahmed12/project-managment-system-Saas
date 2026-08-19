import * as React from "react";
import type { Project } from "@/pages/Projects/projectData";
import { projectsApi } from "@/lib/projects-api";

interface ProjectsContextValue {
  projects: Project[];
  loading: boolean;
  addProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  reorderProjects: (projects: Project[]) => void;
}

const ProjectsContext = React.createContext<ProjectsContextValue | null>(null);

export function ProjectsProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;

    projectsApi
      .getProjects()
      .then((list) => {
        if (active) setProjects(list);
      })
      .catch(() => {
        // Keep the empty state; the API client redirects on 401.
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const addProject = React.useCallback(async (project: Project) => {
    const created = await projectsApi.createProject(project);
    setProjects((previousProjects) => [created, ...previousProjects]);
  }, []);

  const updateProject = React.useCallback(async (project: Project) => {
    const updated = await projectsApi.updateProject(project);
    setProjects((previousProjects) =>
      previousProjects.map((item) =>
        item.id === updated.id ? updated : item,
      ),
    );
  }, []);

  const deleteProject = React.useCallback(async (id: string) => {
    await projectsApi.deleteProject(id);
    setProjects((previousProjects) =>
      previousProjects.filter((item) => item.id !== id),
    );
  }, []);

  const reorderProjects = React.useCallback((reordered: Project[]) => {
    setProjects(reordered);
  }, []);

  const value = React.useMemo<ProjectsContextValue>(
    () => ({
      projects,
      loading,
      addProject,
      updateProject,
      deleteProject,
      reorderProjects,
    }),
    [
      projects,
      loading,
      addProject,
      updateProject,
      deleteProject,
      reorderProjects,
    ],
  );

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProjects(): ProjectsContextValue {
  const context = React.useContext(ProjectsContext);

  if (!context) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }

  return context;
}