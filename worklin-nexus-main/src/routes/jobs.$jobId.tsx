import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/public-layout";
import { StatusBadge, BookmarkButton, type JobLite } from "@/components/job-card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/jobs/$jobId")({
  component: JobDetail,
  head: () => ({ meta: [{ title: "Job — Worklin" }] }),
});

function JobDetail() {
  const { jobId } = Route.useParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<(JobLite & { description: string; skills: string[] }) | null>(null);
  const [rate, setRate] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from("jobs").select("*, category:categories(name,slug)").eq("id", jobId).maybeSingle()
      .then(({ data }) => setJob(data as never));
  }, [jobId]);

  if (!job) return <PublicLayout><div className="mx-auto max-w-4xl px-4 py-20 text-sm text-muted-foreground">Loading…</div></PublicLayout>;

  const filled = job.status === "filled";

  const submitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please log in to bid"); navigate({ to: "/login" }); return; }
    if (role !== "freelancer") { toast.error("Only freelancers can submit bids"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("bids").insert({ job_id: job.id, freelancer_id: user.id, proposed_rate: Number(rate), cover_note: note });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Bid submitted");
    setRate(""); setNote("");
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="grid gap-8 md:grid-cols-[1fr_300px]">
          <article className="max-w-[860px]">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex h-6 items-center rounded-[2px] border border-border bg-surface px-2 text-[11px] font-medium text-muted-foreground">{job.category?.name ?? "General"}</span>
              <StatusBadge status={job.status} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
            <div className="mt-2 text-sm text-muted-foreground">Posted {new Date(job.posted_at).toLocaleDateString()}</div>
            <div className="mt-8 whitespace-pre-line text-base leading-relaxed text-foreground/90">{job.description}</div>
            {job.skills && job.skills.length > 0 && (
              <div className="mt-8">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Skills</div>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((s) => <span key={s} className="rounded-[2px] border border-border bg-surface px-2 py-1 text-xs">{s}</span>)}
                </div>
              </div>
            )}

            <div className="mt-12 wl-card p-6">
              <h2 className="mb-4 text-lg font-bold">Submit Your Bid</h2>
              {filled ? (
                <div className="rounded-[4px] border border-border bg-muted py-6 text-center text-sm font-medium text-muted-foreground">Position Filled — No Longer Accepting Bids</div>
              ) : (
                <form onSubmit={submitBid} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium">Proposed Rate (USD)</label>
                    <input required type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="h-11 w-full rounded-[4px] border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center justify-between text-xs font-medium"><span>Cover Note</span><span className="text-muted-foreground">{note.length}/300</span></label>
                    <textarea required maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} rows={4} className="w-full rounded-[4px] border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <button disabled={submitting} className="h-11 rounded-[4px] bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">{submitting ? "Submitting…" : "Submit Bid"}</button>
                </form>
              )}
            </div>
          </article>

          <aside className="md:sticky md:top-20 h-fit">
            {filled ? (
              <div className="rounded-[4px] border border-border bg-muted px-4 py-6 text-center text-sm font-medium text-muted-foreground">Position Filled</div>
            ) : (
              <div className="wl-card p-6">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Rate</div>
                <div className="mt-2 text-2xl font-bold">${job.rate_min}–${job.rate_max}</div>
                <button onClick={() => document.querySelector("form")?.scrollIntoView({ behavior: "smooth" })} className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-[4px] bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90">Place Bid</button>
                <div className="mt-3 flex items-center justify-center gap-2 rounded-[4px] border border-border px-2 py-2">
                  <span className="text-sm text-muted-foreground">Save to Favourites</span>
                  <BookmarkButton jobId={job.id} />
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
