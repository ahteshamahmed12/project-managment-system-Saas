import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import Dashboard from "../pages/Dashboard";
import Projects from "@/pages/Projects/index";
import Tasks from "@/pages/Tasks/index";
import Sprint from "@/pages/Sprints/index";
import TeamManagement from "@/pages/TeamManagement/index";
import Users from "@/pages/users/index";
import Reports from "@/pages/Reports/index";
import Settings from "@/pages/Settings";
import Signup from "@/pages/Auth/signup";
import Login from "@/pages/Auth/login";
import { useAuth } from "@/context/AuthContext";
import NotificationsPage from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import TaskDetails from "@/pages/Tasks/TaskDetails";
import ActivityPage from "@/pages/Activity";
import TeamActivityPage from "@/pages/TeamActivity";
import AdminDashboard from "@/pages/Admin/Dashboard";
import PermissionsPage from "@/pages/Admin/Permissions";

export default function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />

        <Route
          path="/signup"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />
          }
        />

        {/* Protected Routes */}
        <Route
          element={
            isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          /admin/dashboard
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          /admin/permissions
          <Route path="/admin/permissions" element={<PermissionsPage />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/sprint" element={<Sprint />} />
          <Route path="/teammanagement" element={<TeamManagement />} />
          <Route path="/users" element={<Users />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tasks/:taskId" element={<TaskDetails />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/team-activity" element={<TeamActivityPage />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
