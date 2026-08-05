import * as React from "react";
import { projectData } from "@/pages/Projects/projectData";
import type { Project } from "@/pages/Projects/projectData";

interface ProjectsContextValue {
  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  reorderProjects: (projects: Project[]) => void;
}

const ProjectsContext = React.createContext<ProjectsContextValue | null>(null);

export function ProjectsProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [projects, setProjects] = React.useState<Project[]>(projectData);

  React.useEffect(() => {
    // TODO: fetch projects
  }, []);

  const addProject = React.useCallback((project: Project) => {
    // TODO: create project
    setProjects((previousProjects) => [project, ...previousProjects]);
  }, []);

  const updateProject = React.useCallback((project: Project) => {
    // TODO: update project
    setProjects((previousProjects) =>
      previousProjects.map((item) => (item.id === project.id ? project : item)),
    );
  }, []);

  const deleteProject = React.useCallback((id: string) => {
    // TODO: delete project
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
      addProject,
      updateProject,
      deleteProject,
      reorderProjects,
    }),
    [projects, addProject, updateProject, deleteProject, reorderProjects],
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
