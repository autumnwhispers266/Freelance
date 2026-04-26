import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { JobCard, type JobLite } from "@/components/job-card";

export const Route = createFileRoute("/dashboard/favourites")({
  component: Favs,
  head: () => ({ meta: [{ title: "Favourites — Worklin" }] }),
});

function Favs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobLite[]>([]);

  const load = () => {
    if (!user) return;
    supabase.from("favourites").select("job:jobs(*, category:categories(name,slug))").eq("user_id", user.id)
      .then(({ data }) => setJobs(((data ?? []).map((x: { job: unknown }) => x.job).filter(Boolean)) as JobLite[]));
  };
  useEffect(load, [user]);

  if (jobs.length === 0) {
    return (
      <div className="grid place-items-center py-20 text-center">
        <Bookmark size={48} className="text-border" />
        <h1 className="mt-6 text-xl font-bold">No saved jobs yet</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">Browse jobs and click the bookmark icon to save them here.</p>
        <Link to="/jobs" className="mt-6 h-11 rounded-[4px] bg-primary px-6 text-sm font-semibold leading-[44px] text-primary-foreground hover:bg-primary/90">Browse Jobs</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Saved jobs</h1>
      <p className="mt-1 text-sm text-muted-foreground">{jobs.length} saved</p>
      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((j) => (
          <div key={j.id}>
            <JobCard job={j} />
            <Link to="/jobs/$jobId" params={{ jobId: j.id }} className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-[4px] border border-primary bg-surface text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground">View Job</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
