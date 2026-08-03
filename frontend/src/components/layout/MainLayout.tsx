import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#F5EFE7]">
      <Sidebar />
      <div className="ml-60">
        <Navbar />
        <main className="px-8 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
