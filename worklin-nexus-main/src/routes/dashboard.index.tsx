import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { JobCard, type JobLite } from "@/components/job-card";

export const Route = createFileRoute("/dashboard/")({
  component: Overview,
  head: () => ({ meta: [{ title: "Dashboard — Worklin" }] }),
});

interface BidRow { id: string; proposed_rate: number; status: string; submitted_at: string; job: { id: string; title: string } | null; }

function Overview() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ bids: 0, active: 0, earnings: 0, unread: 0 });
  const [recent, setRecent] = useState<BidRow[]>([]);
  const [saved, setSaved] = useState<JobLite[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("bids").select("id", { count: "exact", head: true }).eq("freelancer_id", user.id),
      supabase.from("bids").select("id", { count: "exact", head: true }).eq("freelancer_id", user.id).eq("status", "engaged"),
      supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false),
      supabase.from("bids").select("id, proposed_rate, status, submitted_at, job:jobs(id,title)").eq("freelancer_id", user.id).order("submitted_at", { ascending: false }).limit(6),
      supabase.from("favourites").select("job:jobs(*, category:categories(name,slug))").eq("user_id", user.id).limit(3),
    ]).then(([b1, b2, n, r, f]) => {
      setStats({ bids: b1.count ?? 0, active: b2.count ?? 0, earnings: 2480, unread: n.count ?? 0 });
      setRecent((r.data as never) ?? []);
      setSaved(((f.data ?? []).map((x: { job: unknown }) => x.job).filter(Boolean)) as JobLite[]);
    });
  }, [user]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome back, {profile?.full_name?.split(" ")[0] ?? "there"}.</h1>
        <p className="mt-1 text-sm text-muted-foreground">Here is what's happening on your account.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Bids Submitted" value={stats.bids} />
        <Stat label="Jobs Active" value={stats.active} />
        <Stat label="Earnings This Month" value={`$${stats.earnings}`} />
        <Stat label="Unread Notifications" value={stats.unread} />
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-lg font-bold">Recent Bids</h2>
          <Link to="/dashboard/bids" className="text-sm font-medium text-primary hover:underline">View all</Link>
        </div>
        <div className="wl-card overflow-hidden">
          <table className="wl-table w-full text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
              <tr><th className="px-4 py-3 text-left">Job Title</th><th className="px-4 py-3 text-left">Submitted</th><th className="px-4 py-3 text-left">Rate</th><th className="px-4 py-3 text-left">Status</th></tr>
            </thead>
            <tbody>
              {recent.map((b) => (
                <tr key={b.id}><td className="px-4 py-3">{b.job?.title ?? "—"}</td><td className="px-4 py-3 text-muted-foreground">{new Date(b.submitted_at).toLocaleDateString()}</td><td className="px-4 py-3">${b.proposed_rate}</td><td className="px-4 py-3"><BidStatus s={b.status} /></td></tr>
              ))}
              {recent.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No bids yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-lg font-bold">Saved Jobs</h2>
          <Link to="/dashboard/favourites" className="text-sm font-medium text-primary hover:underline">View All Favourites</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {saved.map((j) => <JobCard key={j.id} job={j} />)}
          {saved.length === 0 && <div className="col-span-3 rounded-[4px] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">You haven't saved any jobs yet.</div>}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="wl-card p-5">
      <div className="text-3xl font-bold text-primary">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

export function BidStatus({ s }: { s: string }) {
  const map: Record<string, string> = {
    under_review: "bg-warning/10 text-warning border-warning/30",
    engaged: "bg-success/10 text-success border-success/30",
    not_selected: "bg-destructive/10 text-destructive border-destructive/30",
    approved: "bg-success/10 text-success border-success/30",
    declined: "bg-destructive/10 text-destructive border-destructive/30",
  };
  const label = s.replace("_", " ");
  return <span className={`inline-flex h-6 items-center rounded-[2px] border px-2 text-[11px] font-medium capitalize ${map[s] ?? "border-border text-muted-foreground"}`}>{label}</span>;
}
