import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { BidStatus } from "./dashboard.index";

export const Route = createFileRoute("/dashboard/bids")({ component: Bids, head: () => ({ meta: [{ title: "My Bids — Worklin" }] }) });

interface Row { id: string; proposed_rate: number; status: string; submitted_at: string; job: { id: string; title: string } | null; }

function Bids() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("bids").select("id, proposed_rate, status, submitted_at, job:jobs(id,title)").eq("freelancer_id", user.id).order("submitted_at", { ascending: false })
      .then(({ data }) => setRows((data as never) ?? []));
  }, [user]);
  return (
    <div>
      <h1 className="text-2xl font-bold">My Bids</h1>
      <div className="mt-6 wl-card overflow-hidden">
        <table className="wl-table w-full text-sm">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3 text-left">Job</th><th className="px-4 py-3 text-left">Submitted</th><th className="px-4 py-3 text-left">Rate</th><th className="px-4 py-3 text-left">Status</th></tr></thead>
          <tbody>
            {rows.map((r) => <tr key={r.id}><td className="px-4 py-3">{r.job?.title ?? "—"}</td><td className="px-4 py-3 text-muted-foreground">{new Date(r.submitted_at).toLocaleDateString()}</td><td className="px-4 py-3">${r.proposed_rate}</td><td className="px-4 py-3"><BidStatus s={r.status} /></td></tr>)}
            {rows.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">No bids submitted.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
