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
import AdminLogin from "@/pages/Auth/adminLogin";
import { useAuth } from "@/context/AuthContext";
import NotificationsPage from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import TaskDetails from "@/pages/Tasks/TaskDetails";
import ActivityPage from "@/pages/Activity";
import TeamActivityPage from "@/pages/TeamActivity";
import AdminDashboard from "@/pages/Admin/Dashboard";
import PermissionsPage from "@/pages/Admin/Permissions";
import PerformancePage from "@/pages/Admin/Performance";

export default function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  const isAdmin = user?.role === "Admin";

  return (
    <BrowserRouter>
      <Routes>
        {/* =====================================================
            NORMAL USER LOGIN
        ===================================================== */}

        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate
                to={isAdmin ? "/admin/dashboard" : "/dashboard"}
                replace
              />
            ) : (
              <Login />
            )
          }
        />

        {/* =====================================================
            ADMIN LOGIN
        ===================================================== */}

        <Route
          path="/admin/login"
          element={
            isAuthenticated ? (
              <Navigate
                to={isAdmin ? "/admin/dashboard" : "/dashboard"}
                replace
              />
            ) : (
              <AdminLogin />
            )
          }
        />

        {/* =====================================================
            SIGNUP
        ===================================================== */}

        <Route
          path="/signup"
          element={
            isAuthenticated ? (
              <Navigate
                to={isAdmin ? "/admin/dashboard" : "/dashboard"}
                replace
              />
            ) : (
              <Signup />
            )
          }
        />

        {/* =====================================================
            PROTECTED ROUTES
        ===================================================== */}

        <Route
          element={
            isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />
          }
        >
          {/* ===================================================
              DEFAULT
          =================================================== */}

          <Route
            path="/"
            element={
              <Navigate
                to={isAdmin ? "/admin/dashboard" : "/dashboard"}
                replace
              />
            }
          />

          {/* ===================================================
              NORMAL USER DASHBOARD
          =================================================== */}

          <Route path="/dashboard" element={<Dashboard />} />

          {/* ===================================================
              ADMIN ROUTES
          =================================================== */}

          <Route
            path="/admin/dashboard"
            element={
              isAdmin ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          <Route
            path="/admin/permissions"
            element={
              isAdmin ? (
                <PermissionsPage />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          <Route
            path="/admin/performance"
            element={
              isAdmin ? (
                <PerformancePage />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          <Route
            path="/users/:userId/profile"
            element={
              isAdmin ? <Profile /> : <Navigate to="/dashboard" replace />
            }
          />
          <Route
            path="/users"
            element={isAdmin ? <Users /> : <Navigate to="/dashboard" replace />}
          />

          {/* ===================================================
              NORMAL USER ROUTES
              =================================================== */}

          <Route path="/projects" element={<Projects />} />

          <Route path="/tasks" element={<Tasks />} />

          <Route path="/sprint" element={<Sprint />} />

          <Route path="/teammanagement" element={<TeamManagement />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="/tasks/:taskId" element={<TaskDetails />} />

          <Route path="/reports" element={<Reports />} />

          <Route path="/notifications" element={<NotificationsPage />} />

          <Route path="/activity" element={<ActivityPage />} />

          <Route path="/team-activity" element={<TeamActivityPage />} />

          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* =====================================================
            FALLBACK
        ===================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to={
                isAuthenticated
                  ? isAdmin
                    ? "/admin/dashboard"
                    : "/dashboard"
                  : "/login"
              }
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
