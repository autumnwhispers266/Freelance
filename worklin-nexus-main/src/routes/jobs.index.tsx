import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PublicLayout } from "@/components/public-layout";
import { JobCard, type JobLite } from "@/components/job-card";
import { supabase } from "@/integrations/supabase/client";

interface Cat { id: string; slug: string; name: string; }

export const Route = createFileRoute("/jobs/")({
  component: Jobs,
  head: () => ({ meta: [{ title: "Jobs — Worklin" }, { name: "description", content: "Browse and filter open freelance jobs on Worklin." }] }),
});

function Jobs() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [jobs, setJobs] = useState<JobLite[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [sort, setSort] = useState<"newest" | "rate-high" | "rate-low">("newest");
  const [page, setPage] = useState(1);
  const perPage = 9;

  useEffect(() => {
    supabase.from("categories").select("id,slug,name").order("sort_order").then(({ data }) => setCats(data ?? []));
    supabase.from("jobs").select("*, category:categories(name,slug)").order("posted_at", { ascending: false })
      .then(({ data }) => setJobs((data as unknown as JobLite[]) ?? []));
  }, []);

  const filtered = useMemo(() => {
    let r = jobs.slice();
    if (search) r = r.filter((j) => (j.title + j.description).toLowerCase().includes(search.toLowerCase()));
    if (selectedCats.length) r = r.filter((j) => j.category && selectedCats.includes(j.category.slug));
    if (budgetMin) r = r.filter((j) => j.rate_max >= Number(budgetMin));
    if (budgetMax) r = r.filter((j) => j.rate_min <= Number(budgetMax));
    if (sort === "rate-high") r.sort((a, b) => b.rate_max - a.rate_max);
    else if (sort === "rate-low") r.sort((a, b) => a.rate_min - b.rate_min);
    else r.sort((a, b) => +new Date(b.posted_at) - +new Date(a.posted_at));
    return r;
  }, [jobs, search, selectedCats, budgetMin, budgetMax, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleCat = (slug: string) => setSelectedCats((s) => s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Open jobs</h1>
        <p className="mt-1 text-sm text-muted-foreground">Filter and browse current opportunities.</p>

        <div className="mt-8 grid gap-6 md:grid-cols-[260px_1fr]">
          <aside className="wl-card h-fit p-5">
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium">Search</label>
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Title or keyword" className="h-10 w-full rounded-[4px] border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div className="mb-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</div>
              <div className="space-y-2">
                {cats.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selectedCats.includes(c.slug)} onChange={() => { toggleCat(c.slug); setPage(1); }} className="h-4 w-4 accent-primary" />
                    <span>{c.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Budget Range</div>
              <div className="flex gap-2">
                <input value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="Min" type="number" className="h-10 w-full rounded-[4px] border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none" />
                <input value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="Max" type="number" className="h-10 w-full rounded-[4px] border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none" />
              </div>
              <button onClick={() => setPage(1)} className="mt-2 h-9 w-full rounded-[4px] border border-border bg-surface text-sm font-medium hover:border-primary">Apply</button>
            </div>
            <button onClick={() => { setSearch(""); setSelectedCats([]); setBudgetMin(""); setBudgetMax(""); setPage(1); }} className="text-xs font-medium text-primary hover:underline">Clear All Filters</button>
          </aside>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{filtered.length} results</div>
              <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-10 rounded-[4px] border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none">
                <option value="newest">Sort: Newest</option>
                <option value="rate-high">Rate: High to Low</option>
                <option value="rate-low">Rate: Low to High</option>
              </select>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((j) => <JobCard key={j.id} job={j} />)}
              {visible.length === 0 && <div className="col-span-full rounded-[4px] border border-dashed border-border p-12 text-center text-sm text-muted-foreground">No jobs match your filters.</div>}
            </div>
            {pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-1">
                {Array.from({ length: pages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} className={`h-9 min-w-9 rounded-[4px] border px-3 text-sm font-medium ${page === i + 1 ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface hover:border-primary"}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
