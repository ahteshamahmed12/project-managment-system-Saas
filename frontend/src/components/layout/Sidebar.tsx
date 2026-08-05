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
import { NavLink } from "react-router-dom";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FolderKanban, label: "Projects", path: "/projects" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: Activity, label: "Sprint", path: "/sprint" },
  { icon: UserCog, label: "Team Management", path: "/teammanagement" },
  { icon: Users, label: "Users", path: "/users" },
  { icon: ClipboardMinus, label: "Reports", path: "/reports" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-60 flex-col bg-black px-4 py-6 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500">
            <span className="text-sm font-bold text-white">☀</span>
          </div>

          <span className="text-xl font-bold text-white">Promage</span>
        </div>

        {/* Button */}

        <Button className="mb-8 w-full rounded-full bg-white text-black hover:bg-gray-100">
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
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Help */}

        <button className="mt-6 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600">
          <HelpCircle className="h-5 w-5" />
        </button>
      </aside>
    </>
  );
}
