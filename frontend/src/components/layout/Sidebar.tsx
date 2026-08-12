import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  UserCog,
  Settings,
  Plus,
  HelpCircle,
  Activity,
  ClipboardMinus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink, useNavigate } from "react-router-dom";
import ProjectModal from "@/pages/Projects/ProjectModal";
import { useProjects } from "@/context/Projectscontext";
import type { Project } from "@/pages/Projects/projectData";

const navItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: FolderKanban,
    label: "Projects",
    path: "/projects",
  },
  {
    icon: CheckSquare,
    label: "Tasks",
    path: "/tasks",
  },
  {
    icon: Activity,
    label: "Sprint",
    path: "/sprint",
  },
  {
    icon: UserCog,
    label: "Team Management",
    path: "/teammanagement",
  },
  {
    icon: Users,
    label: "Users",
    path: "/users",
  },
  {
    icon: ClipboardMinus,
    label: "Reports",
    path: "/reports",
  },
  {
    icon: Settings,
    label: "Settings",
    path: "/settings",
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { addProject } = useProjects();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleOpenCreateModal = () => {
    setIsModalOpen(true);
  };

  const handleSaveProject = (project: Project) => {
    addProject(project);
    setIsModalOpen(false);
    navigate("/projects");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-60 flex-col bg-black px-4 py-6 text-white transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-white">
            P
          </div>

          <span className="text-xl font-bold text-white">Promage</span>
        </div>

        {/* Create Project */}
        <Button
          type="button"
          onClick={handleOpenCreateModal}
          className="mb-8 w-full rounded-full bg-white text-black hover:bg-gray-100"
        >
          <Plus className="mr-2 h-4 w-4 text-orange-500" />
          Create new project
        </Button>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-full px-4 py-3 text-sm transition-all",
                  isActive
                    ? "bg-white font-semibold text-orange-500"
                    : "text-gray-400 hover:bg-zinc-900 hover:text-white",
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Help */}
        <button
          type="button"
          className="mt-6 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white transition-colors hover:bg-orange-600"
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </aside>

      {/* Create Project Modal */}
      <ProjectModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        project={null}
        onSave={handleSaveProject}
      />
    </>
  );
}
