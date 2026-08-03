import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface LogoutButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
}

export default function LogoutButton({
  variant = "outline",
  className = "",
}: LogoutButtonProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("current_user");

    navigate("/login", { replace: true });
  };

  return (
    <Button variant={variant} onClick={handleLogout} className={className}>
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
}
