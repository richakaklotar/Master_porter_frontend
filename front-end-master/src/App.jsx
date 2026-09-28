import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Factory,
  Boxes,
  Cog,
  FolderKanban,
  Component as ComponentIcon,
  ListChecks,
  ListTree,
  Clock,
  BadgeCheck,
  Users,
  Menu,
  LayoutDashboard,
  X,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogTitle, DialogContent } from "@/components/ui/dialog";

import Plant from "./pages/Plant";
import Division from "./pages/Division";
import Machine from "./pages/Machine";
import Project from "./pages/Project";
import Component from "./pages/Components";
import Activity from "./pages/Activities";
import SubActivities from "./pages/SubActivities";
import Shifts from "./pages/Shifts";
import Designation from "./pages/Designation";
import Employee from "./pages/Employee";
import Login from "./pages/Login";
import { isAuthenticated, logout } from "./lib/auth";

const NAV_ITEMS = [
  { to: "/plants", label: "Plants", icon: Factory },
  { to: "/divisions", label: "Divisions", icon: Boxes },
  { to: "/machines", label: "Machines", icon: Cog },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/components", label: "Components", icon: ComponentIcon },
  { to: "/activities", label: "Activities", icon: ListChecks },
  { to: "/sub-activities", label: "Sub Activities", icon: ListTree },
  { to: "/shifts", label: "Shifts", icon: Clock },
  { to: "/designations", label: "Designations", icon: BadgeCheck },
  { to: "/employees", label: "Employees", icon: Users },
];

function Brand({ collapsed }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 py-1",
        collapsed ? "justify-center px-0" : "px-2"
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-black/30">
        <LayoutDashboard className="size-5" />
      </div>
      {!collapsed && (
        <div className="leading-tight">
          <div className="text-sm font-semibold text-sidebar-foreground">
            MasterPortal
          </div>
          <div className="text-xs text-sidebar-foreground/60">Masters</div>
        </div>
      )}
    </div>
  );
}

function NavItems({ collapsed, onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {!collapsed && (
        <div className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/50">
          Masters
        </div>
      )}
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          title={collapsed ? label : undefined}
          className={({ isActive }) =>
            cn(
              "group relative flex cursor-pointer items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors",
              collapsed ? "justify-center px-0" : "px-3",
              "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive &&
                "bg-indigo-500/20 font-semibold text-white hover:bg-indigo-500/20 hover:text-white"
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-indigo-400" />
              )}
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  isActive && "text-indigo-200"
                )}
              />
              {!collapsed && <span className="truncate">{label}</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarFooter({ collapsed, onLogout }) {
  return (
    <div className="flex flex-col gap-4">
      <Separator className="bg-sidebar-border" />
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl bg-white/[0.06] px-3 py-2.5",
          collapsed && "justify-center px-0"
        )}
      >
        <Avatar>
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
            RK
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-sm font-medium text-sidebar-foreground">
                Rajesh Kumar
              </div>
              <div className="truncate text-xs text-sidebar-foreground/60">
                Plant Manager
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Log out"
              title="Log out"
              className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={onLogout}
            >
              <LogOut className="size-4" />
            </Button>
          </>
        )}
      </div>
      {collapsed && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Log out"
          title="Log out"
          className="w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={onLogout}
        >
          <LogOut className="size-4" />
        </Button>
      )}
    </div>
  );
}

function Sidebar({ collapsed, onNavigate, onLogout }) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col justify-between gap-6 py-6",
        collapsed ? "px-3" : "px-4"
      )}
    >
      <div className="flex flex-col gap-6">
        <Brand collapsed={collapsed} />
        <NavItems collapsed={collapsed} onNavigate={onNavigate} />
      </div>
      <SidebarFooter collapsed={collapsed} onLogout={onLogout} />
    </aside>
  );
}

function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("mp-sidebar-collapsed") === "1";
    } catch {
      return false;
    }
  });
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated()) {
    return (
      <Navigate to="/login" state={{ from: location.pathname }} replace />
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const current = NAV_ITEMS.find((item) =>
    location.pathname.startsWith(item.to)
  );

  const contentPadding = collapsed ? "lg:pl-[4.5rem]" : "lg:pl-64";

  const toggleCollapsed = () =>
    setCollapsed((v) => {
      try {
        localStorage.setItem("mp-sidebar-collapsed", v ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !v;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-background to-violet-50">
      {/* ============ DESKTOP SIDEBAR ============ */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden overflow-hidden border-r bg-sidebar text-sidebar-foreground transition-[width] lg:block",
          collapsed ? "w-[4.5rem]" : "w-64"
        )}
      >
        <Sidebar collapsed={collapsed} onLogout={handleLogout} />
      </aside>

      {/* ============ TOP HEADER ============ */}
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div
          className={cn(
            "flex h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:h-16",
            contentPadding,
            "transition-[padding-left]"
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Open menu"
              className="lg:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden lg:inline-flex"
              onClick={toggleCollapsed}
            >
              {collapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </Button>
            <div className="flex min-w-0 items-center gap-1.5 text-sm">
              <span className="hidden text-muted-foreground sm:inline">
                Masters
              </span>
              <ChevronRight className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
              <span className="truncate font-medium">{current?.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center whitespace-nowrap rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 md:flex">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span className="ml-2">All systems operational</span>
            </div>
          </div>
        </div>
      </header>

      {/* ============ MOBILE MENU ============ */}
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent
          className="left-0 top-0 h-full w-full max-w-none translate-x-0 translate-y-0 items-start gap-0 rounded-none border-r p-0 sm:max-w-xs"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <div className="flex w-full flex-col justify-between gap-6 bg-sidebar px-5 py-6 text-sidebar-foreground">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <Brand collapsed={false} />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close menu"
                  className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={() => setMenuOpen(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
              <NavItems collapsed={false} onNavigate={() => setMenuOpen(false)} />
            </div>
            <SidebarFooter collapsed={false} onLogout={handleLogout} />
          </div>
        </DialogContent>
      </Dialog>

      {/* ============ MAIN CONTENT ============ */}
      <div className={cn(contentPadding, "transition-[padding-left]")}>
        <main className="mx-auto w-full max-w-[80rem] p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/plants" element={<Plant />} />
            <Route path="/divisions" element={<Division />} />
            <Route path="/machines" element={<Machine />} />
            <Route path="/projects" element={<Project />} />
            <Route path="/components" element={<Component />} />
            <Route path="/activities" element={<Activity />} />
            <Route path="/sub-activities" element={<SubActivities />} />
            <Route path="/shifts" element={<Shifts />} />
            <Route path="/designations" element={<Designation />} />
            <Route path="/employees" element={<Employee />} />
            <Route path="*" element={<Navigate to="/plants" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated() ? <Navigate to="/plants" replace /> : <Login />
          }
        />
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </Router>
  );
}

export default App;