import { Navigate, Outlet } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";



export default function ProtectedRoute() {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}