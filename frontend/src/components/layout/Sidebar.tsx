import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Building2, GitCompareArrows, History, LogOut, ChevronLeft, ChevronRight, Menu, X, Settings2, Map, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/sites", label: "Sites", icon: Building2 },
  { to: "/map", label: "Carte", icon: Map },
  { to: "/compare", label: "Comparer", icon: GitCompareArrows },
  { to: "/history", label: "Historique", icon: History },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const isAdmin = !!user && ((user as any).role === "ADMIN" || (user as any).role === "ROLE_ADMIN");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const handler = () => { if (mql.matches) setMobileOpen(false); };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="relative flex items-center justify-center px-4 h-20 border-b border-sidebar-border">
        {(!collapsed || mobileOpen) ? (
          <img
            src="/logo.png"
            alt="CarbonTrack"
            className="h-12 w-auto object-contain"
          />
        ) : (
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
            <img src="/icon.png" alt="CarbonTrack" className="w-5 h-5 object-contain" />
          </div>
        )}
        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-4 md:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-cap-vibrant shadow-sm"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-cap-vibrant")} />
              {(!collapsed || mobileOpen) && <span>{item.label}</span>}
            </NavLink>
          );
        })}

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                "mt-4 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-cap-vibrant shadow-sm"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )
            }
          >
            <Users className="w-5 h-5 flex-shrink-0" />
            {(!collapsed || mobileOpen) && <span>Administration</span>}
          </NavLink>
        )}
      </nav>

      {/* Collapse toggle (desktop only) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-3 mb-2 hidden md:flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-colors text-xs"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Réduire</span></>}
      </button>

      {/* User + footer */}
      <div className="border-t border-sidebar-border px-3 py-3 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cap-vibrant/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-cap-vibrant">
              {user?.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "U"}
            </span>
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.fullName}</p>
              <p className="text-[11px] text-sidebar-foreground/40 truncate">{user?.email}</p>
            </div>
          )}
          {(!collapsed || mobileOpen) && (
            <button onClick={logout} className="text-sidebar-foreground/30 hover:text-cap-red transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {(!collapsed || mobileOpen) && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-sidebar-foreground/40 uppercase tracking-wider">
              Capgemini
            </span>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-foreground shadow-md"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar (slide-in drawer) */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen flex flex-col bg-sidebar border-r border-sidebar-border z-50 transition-transform duration-300 md:hidden w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen hidden md:flex flex-col bg-sidebar border-r border-sidebar-border z-50 transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
