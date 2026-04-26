import { useEffect, useState } from "react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { Bell, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ProfilePanel } from "./profile-panel";
import { supabase } from "@/integrations/supabase/client";

const NAV_LINKS = [
  { to: "/jobs" as const, label: "Jobs" },
  { to: "/how-it-works" as const, label: "How It Works" },
  { to: "/categories" as const, label: "Categories" },
  { to: "/about" as const, label: "About" },
];

export function TopNav() {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) { setUnread(0); return; }
    let active = true;
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false)
      .then(({ count }) => { if (active) setUnread(count ?? 0); });
    return () => { active = false; };
  }, [user, router.state.location.pathname]);

  const isLoggedIn = !!user;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
          <Link to="/" className="text-xl font-bold tracking-tight text-primary">
            Worklin
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm font-medium text-foreground/80 hover:text-primary"
                activeProps={{ className: "text-primary font-semibold" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="inline-flex h-10 items-center justify-center rounded-[4px] border border-border bg-surface px-4 text-sm font-medium text-foreground hover:border-primary"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex h-10 items-center justify-center rounded-[4px] bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/dashboard/notifications" })}
                  className="relative grid h-10 w-10 place-items-center rounded-[4px] border border-border bg-surface hover:border-primary"
                  aria-label="Notifications"
                >
                  <Bell size={18} className="text-foreground" />
                  {unread > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setPanelOpen(true)}
                  className="flex h-10 items-center gap-2 rounded-[4px] border border-border bg-surface px-2 hover:border-primary"
                  aria-label="Open profile"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    {profile?.avatar_initials ?? "··"}
                  </span>
                  <svg width="10" height="10" viewBox="0 0 10 10" className="text-muted-foreground">
                    <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            className="md:hidden grid h-10 w-10 place-items-center rounded-[4px] border border-border"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-border bg-surface md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col px-4 py-3">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-sm font-medium text-foreground"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
                {!isLoggedIn ? (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="inline-flex h-11 items-center justify-center rounded-[4px] border border-border bg-surface text-sm font-medium">Login</Link>
                    <Link to="/signup" onClick={() => setMobileOpen(false)} className="inline-flex h-11 items-center justify-center rounded-[4px] bg-primary text-sm font-medium text-primary-foreground">Get Started</Link>
                  </>
                ) : (
                  <>
                    <Link to={role === "admin" ? "/admin" : "/dashboard"} onClick={() => setMobileOpen(false)} className="inline-flex h-11 items-center justify-center rounded-[4px] bg-primary text-sm font-medium text-primary-foreground">Dashboard</Link>
                    <button onClick={async () => { await signOut(); setMobileOpen(false); navigate({ to: "/" }); }} className="inline-flex h-11 items-center justify-center rounded-[4px] border border-border text-sm font-medium text-destructive">Logout</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <ProfilePanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
}
