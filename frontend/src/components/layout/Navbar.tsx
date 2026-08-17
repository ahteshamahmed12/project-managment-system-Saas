import { ChevronDown, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import ThemeToggle from "@/components/theme/ThemeToggle";
import NotificationDropdown from "@/pages/Notifications/NotificationDropdown";
import GlobalSearch from "@/components/common/GlobalSearch";

import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  /* =========================================================
     PAGE TITLES
  ========================================================= */

  const pageTitles: Record<string, string> = {
    "/admin/dashboard": "Admin Dashboard",
    "/": "Dashboard",
    "/projects": "Projects",
    "/tasks": "Tasks",
    "/sprint": "Sprint",
    "/teammanagement": "Team Management",
    "/users": "Users",
    "/reports": "Reports",
    "/settings": "Settings",
    "/profile": "Profile",
    "/notifications": "Notifications",
  };

  const title = pageTitles[location.pathname] ?? "Dashboard";

  /* =========================================================
     USER DISPLAY
  ========================================================= */

  const userName = user?.name ?? "User";
  const userEmail = user?.email ?? "";

  const userInitials =
    userName
      .split(" ")
      .map((part: string) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <header className="flex min-w-0 items-center justify-between gap-3 px-6 border-b-black shadow-amber-300">
      {/* =====================================================
          LEFT
      ===================================================== */}

      <div className="flex min-w-0 items-center gap-2">
        {/* Mobile Menu */}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="shrink-0 rounded-xl lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </Button>

        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-foreground sm:text-xl md:text-2xl lg:text-3xl">
            {title}
          </h1>
        </div>
      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="hidden flex-1 px-4 md:block">
        <GlobalSearch />
      </div>

      {/* =====================================================
          RIGHT
      ===================================================== */}

      <div className="ml-2 flex shrink-0 items-center gap-2">
        {/* Theme Toggle */}

        <ThemeToggle />

        {/* Notifications */}

        <NotificationDropdown />

        {/* User */}

        <div className="">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/profile")}
            className="flex h-auto items-center gap-2 rounded-full border border-border bg-card px-2 py-1 shadow-sm hover:bg-accent md:px-3 md:py-2"
            aria-label="Open profile"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.avatar} alt={userName} />

              <AvatarFallback className="bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                {userInitials}
              </AvatarFallback>
            </Avatar>

            <div className="hidden min-w-0 text-left md:block">
              <p className="max-w-32 truncate text-sm font-semibold text-foreground">
                {userName}
              </p>

              <p className="max-w-32 truncate text-xs text-muted-foreground">
                {userEmail}
              </p>
            </div>

            <ChevronDown className="hidden h-4 w-4 shrink-0 text-muted-foreground md:block" />
          </Button>
        </div>
      </div>
    </header>
  );
}
