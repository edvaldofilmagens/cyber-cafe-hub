import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import Login from "./pages/Login";
import Index from "./pages/Index";
import PDV from "./pages/PDV";
import Computadores from "./pages/Computadores";
import Estoque from "./pages/Estoque";
import Financeiro from "./pages/Financeiro";
import Vouchers from "./pages/Vouchers";
import Mesas from "./pages/Mesas";
import Usuarios from "./pages/Usuarios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/pdv" />;
  return <AppLayout>{children}</AppLayout>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<ProtectedRoute adminOnly><Index /></ProtectedRoute>} />
      <Route path="/pdv" element={<ProtectedRoute><PDV /></ProtectedRoute>} />
      <Route path="/computadores" element={<ProtectedRoute><Computadores /></ProtectedRoute>} />
      <Route path="/mesas" element={<ProtectedRoute><Mesas /></ProtectedRoute>} />
      <Route path="/estoque" element={<ProtectedRoute adminOnly><Estoque /></ProtectedRoute>} />
      <Route path="/financeiro" element={<ProtectedRoute adminOnly><Financeiro /></ProtectedRoute>} />
      <Route path="/vouchers" element={<ProtectedRoute adminOnly><Vouchers /></ProtectedRoute>} />
      <Route path="/usuarios" element={<ProtectedRoute adminOnly><Usuarios /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
