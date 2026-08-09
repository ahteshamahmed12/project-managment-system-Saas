import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";

import Dashboard from "../pages/Dashboard";
import Projects from "@/pages/Projects";
import Tasks from "@/pages/Tasks/index";
import Sprint from "@/pages/Sprints/index";
import TeamManagement from "@/pages/TeamManagement";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Signup from "@/pages/Auth/signup";
import Login from "@/pages/Auth/login";
import { useAuth } from "@/context/AuthContext";
import Users from "@/pages/users";

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
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/sprint" element={<Sprint />} />
          <Route path="/teammanagement" element={<TeamManagement />} />
          <Route path="/users" element={<Users />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
