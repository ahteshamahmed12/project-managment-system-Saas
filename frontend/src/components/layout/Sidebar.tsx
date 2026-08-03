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
  { icon: Activity, label: "Sprint", path: "/Sprint" },
  { icon: UserCog, label: "Team Management", path: "/teammanagement" },
  { icon: Users, label: "Users", path: "/users" },
  { icon: ClipboardMinus, label: "Reports", path: "/reports" },
  { icon: Settings, label: "Menu settings", path: "/settings" },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col bg-black px-4 py-6">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500">
          <span className="text-sm font-bold text-white">☀</span>
        </div>
        <span className="text-xl font-bold text-white">Promage</span>
      </div>

      {/* Create Button */}
      <Button className="mb-8 w-full rounded-full bg-white text-black hover:bg-gray-100">
        <Plus className="mr-2 h-4 w-4 text-orange-500" />
        Create new project
      </Button>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-white font-medium text-orange-500"
                  : "text-gray-400 hover:text-white",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Help */}
      <button className="mt-auto flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white">
        <HelpCircle className="h-4 w-4" />
      </button>
    </aside>
  );
}
