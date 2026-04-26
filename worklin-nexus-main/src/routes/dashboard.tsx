import { createFileRoute, redirect, Outlet, Link, useLocation } from "@tanstack/react-router";
import { LayoutGrid, FileText, Briefcase, DollarSign, Bookmark, Bell, Folder } from "lucide-react";
import { TopNav } from "@/components/top-nav";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/login" });
    const { data: prof } = await supabase.from("profiles").select("status").eq("id", session.user.id).maybeSingle();
    if (prof?.status === "restricted") throw redirect({ to: "/restricted" });
  },
  component: DashboardLayout,
});

const ITEMS: ReadonlyArray<{ to: string; label: string; icon: typeof LayoutGrid; exact?: boolean }> = [
  { to: "/dashboard", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/dashboard/bids", label: "My Bids", icon: FileText },
  { to: "/dashboard/active", label: "Active Jobs", icon: Briefcase },
  { to: "/dashboard/earnings", label: "Earnings", icon: DollarSign },
  { to: "/dashboard/favourites", label: "Favourites", icon: Bookmark },
  { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { to: "/dashboard/portfolio", label: "Portfolio", icon: Folder },
];

function DashboardLayout() {
  const loc = useLocation();
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 md:px-6">
        <aside className="hidden w-60 shrink-0 md:block">
          <nav className="wl-card p-2">
            {ITEMS.map((it) => {
              const active = it.exact ? loc.pathname === it.to : loc.pathname.startsWith(it.to) && loc.pathname !== "/dashboard";
              const isActive = it.exact ? loc.pathname === "/dashboard" : active;
              return (
                <Link
                  key={it.to}
                  to={it.to as never}
                  className={`flex items-center gap-3 rounded-[2px] border-l-[3px] px-3 py-2.5 text-sm font-medium transition ${isActive ? "border-primary bg-primary-tint text-primary" : "border-transparent text-foreground hover:bg-accent"}`}
                >
                  <it.icon size={16} />
                  <span>{it.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-border bg-surface md:hidden">
        {ITEMS.slice(0, 5).map((it) => (
          <Link key={it.to} to={it.to as never} className="flex flex-col items-center gap-1 py-2 text-[10px] font-medium" activeProps={{ className: "text-primary" }}>
            <it.icon size={18} />
            <span>{it.label.split(" ")[0]}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
