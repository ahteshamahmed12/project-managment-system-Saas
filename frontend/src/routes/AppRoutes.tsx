import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import Tasks from "@/pages/Tasks";
import Sprint from "@/pages/Sprint";
import TeamManagement from "@/pages/TeamManagement";
import Users from "@/pages/Users";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Signup from "@/pages/Auth/signup";
import Login from "@/pages/Auth/login";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
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

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}