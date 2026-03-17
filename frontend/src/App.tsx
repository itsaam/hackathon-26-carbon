import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/layouts/AppLayout";
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";
import Dashboard from "@/pages/Dashboard/Dashboard";
import SitesList from "@/pages/Sites/SitesList";
import SiteDetail from "@/pages/Sites/SiteDetail";
import SiteForm from "@/pages/Sites/SiteForm";
import Compare from "@/pages/Compare/Compare";
import History from "@/pages/History/History";
import MapPage from "@/pages/Map";
import AdminMaterials from "@/pages/Admin/AdminMaterials";
import AdminEnergyFactors from "@/pages/Admin/AdminEnergyFactors";
import AdminHome from "@/pages/Admin/AdminHome";
import AdminUsers from "@/pages/Admin/AdminUsers";
import AdminOrganization from "@/pages/Admin/AdminOrganization";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
    <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
    <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="sites" element={<SitesList />} />
      <Route path="sites/new" element={<SiteForm />} />
      <Route path="sites/:id" element={<SiteDetail />} />
      <Route path="sites/:id/edit" element={<SiteForm />} />
      <Route path="compare" element={<Compare />} />
      <Route path="history" element={<History />} />
      <Route path="sites/:id/history" element={<History />} />
      <Route path="map" element={<MapPage />} />
      <Route path="admin" element={<AdminHome />} />
      <Route path="admin/users" element={<AdminUsers />} />
      <Route path="admin/organization" element={<AdminOrganization />} />
      <Route path="admin/materials" element={<AdminMaterials />} />
      <Route path="admin/energy-factors" element={<AdminEnergyFactors />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
