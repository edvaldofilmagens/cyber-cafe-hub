import {
  Monitor,
  ShoppingCart,
  Package,
  Wallet,
  Ticket,
  LayoutDashboard,
  LogOut,
  Wifi,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { NavLink, useLocation } from "react-router-dom";

const adminLinks = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/pdv", icon: ShoppingCart, label: "PDV" },
  { to: "/mesas", icon: UtensilsCrossed, label: "Mesas" },
  { to: "/computadores", icon: Monitor, label: "Computadores" },
  { to: "/estoque", icon: Package, label: "Estoque" },
  { to: "/financeiro", icon: Wallet, label: "Financeiro" },
  { to: "/vouchers", icon: Ticket, label: "Vouchers" },
  { to: "/usuarios", icon: Users, label: "Usuários" },
];

const funcLinks = [
  { to: "/pdv", icon: ShoppingCart, label: "PDV" },
  { to: "/mesas", icon: UtensilsCrossed, label: "Mesas" },
  { to: "/computadores", icon: Monitor, label: "Computadores" },
];

export const AppSidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const links = isAdmin ? adminLinks : funcLinks;

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Wifi className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-heading text-lg font-bold text-sidebar-primary">Conecta</h1>
          <p className="text-xs text-sidebar-foreground/60">Remígio</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const active = location.pathname === link.to;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/50 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg p-2 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
