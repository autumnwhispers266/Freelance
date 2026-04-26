import { Bookmark, BookmarkCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface JobLite {
  id: string;
  title: string;
  description: string;
  rate_min: number;
  rate_max: number;
  status: "open" | "under_review" | "filled" | "archived";
  posted_at: string;
  category?: { name: string; slug: string } | null;
}

export function StatusBadge({ status }: { status: JobLite["status"] }) {
  const map = {
    open: { label: "Open", cls: "bg-success/10 text-success border-success/30" },
    under_review: { label: "Under Review", cls: "bg-warning/10 text-warning border-warning/30" },
    filled: { label: "Position Filled", cls: "bg-muted text-muted-foreground border-border" },
    archived: { label: "Archived", cls: "bg-muted text-muted-foreground border-border" },
  } as const;
  const m = map[status];
  return (
    <span className={`inline-flex h-6 items-center rounded-[2px] border px-2 text-[11px] font-medium ${m.cls}`}>
      {m.label}
    </span>
  );
}

export function BookmarkButton({ jobId, onChanged }: { jobId: string; onChanged?: (saved: boolean) => void }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { setSaved(false); return; }
    let active = true;
    supabase.from("favourites").select("id").eq("user_id", user.id).eq("job_id", jobId).maybeSingle()
      .then(({ data }) => { if (active) setSaved(!!data); });
    return () => { active = false; };
  }, [user, jobId]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("Please log in to save jobs"); return; }
    setLoading(true);
    if (saved) {
      await supabase.from("favourites").delete().eq("user_id", user.id).eq("job_id", jobId);
      setSaved(false);
      onChanged?.(false);
    } else {
      await supabase.from("favourites").insert({ user_id: user.id, job_id: jobId });
      setSaved(true);
      onChanged?.(true);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? "Remove from favourites" : "Save to favourites"}
      className="grid h-8 w-8 place-items-center rounded-[4px] text-muted-foreground hover:bg-accent hover:text-primary"
    >
      {saved ? <BookmarkCheck size={16} className="text-primary" /> : <Bookmark size={16} />}
    </button>
  );
}

export function JobCard({ job, showBookmark = true }: { job: JobLite; showBookmark?: boolean }) {
  const filled = job.status === "filled";
  return (
    <div className={`relative wl-card flex h-full flex-col p-5 transition hover:border-primary ${filled ? "opacity-70" : ""}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="inline-flex h-6 items-center rounded-[2px] border border-border bg-background px-2 text-[11px] font-medium text-muted-foreground">
          {job.category?.name ?? "General"}
        </span>
        <div className="flex items-center gap-2">
          <StatusBadge status={job.status} />
          {showBookmark && <BookmarkButton jobId={job.id} />}
        </div>
      </div>
      <Link
        to="/jobs/$jobId"
        params={{ jobId: job.id }}
        className="mb-2 block text-base font-semibold text-foreground hover:text-primary"
      >
        {job.title}
      </Link>
      <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
      <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium text-foreground">${job.rate_min}–${job.rate_max}</span>
        <span>{new Date(job.posted_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
      </div>
      {filled && (
        <div className="mt-4 rounded-[4px] border border-border bg-muted px-3 py-2 text-center text-xs font-medium text-muted-foreground">
          Position Filled — No Longer Accepting Bids
        </div>
      )}
    </div>
  );
}
