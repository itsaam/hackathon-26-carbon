import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      {/* On mobile: no left margin, add top padding for hamburger. On desktop: sidebar margin */}
      <main className="md:ml-[260px] transition-all duration-300">
        <div className="container max-w-[1440px] py-8 px-4 sm:px-6 md:px-8 pt-16 md:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
