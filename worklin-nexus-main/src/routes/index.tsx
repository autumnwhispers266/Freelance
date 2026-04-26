import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { JobCard, type JobLite } from "@/components/job-card";
import { supabase } from "@/integrations/supabase/client";

interface Category { id: string; slug: string; name: string; description: string | null; image_url: string | null; }

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Worklin — Find skilled freelancers built for real work" },
      { name: "description", content: "Worklin is a corporate-grade freelance marketplace. Browse open jobs across design, writing, engineering, marketing, media, and transcription." },
      { property: "og:title", content: "Worklin — Find skilled freelancers built for real work" },
      { property: "og:description", content: "A freelance marketplace built for real work." },
    ],
  }),
});

function Landing() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<string>("all");
  const [jobs, setJobs] = useState<JobLite[]>([]);
  const [carouselIdx, setCarouselIdx] = useState(0);

  useEffect(() => {
    supabase.from("categories").select("*").order("sort_order").then(({ data }) => setCategories(data ?? []));
  }, []);

  useEffect(() => {
    let q = supabase.from("jobs").select("*, category:categories(name,slug)").eq("status", "open").order("posted_at", { ascending: false }).limit(12);
    if (activeCat !== "all") {
      const c = categories.find((x) => x.slug === activeCat);
      if (c) q = supabase.from("jobs").select("*, category:categories(name,slug)").eq("status", "open").eq("category_id", c.id).order("posted_at", { ascending: false }).limit(12);
    }
    q.then(({ data }) => { setJobs((data as unknown as JobLite[]) ?? []); setCarouselIdx(0); });
  }, [activeCat, categories]);

  const perPage = 3;
  const maxIdx = Math.max(0, Math.ceil(jobs.length / perPage) - 1);
  const visibleJobs = jobs.slice(carouselIdx * perPage, carouselIdx * perPage + perPage);

  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 md:px-6 md:pt-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Work. Linked.</div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
              Find skilled freelancers built for real work.
            </h1>
            <p className="mt-5 max-w-md text-base text-muted-foreground">
              Worklin connects clients with vetted freelancers across design, engineering, writing, media, and operations. No noise, no inflated promises — just professionals you can hire.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button onClick={() => navigate({ to: "/jobs" })} className="inline-flex h-12 items-center justify-center rounded-[4px] bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                Browse Jobs <ArrowRight size={16} className="ml-2" />
              </button>
              <Link to="/how-it-works" className="inline-flex h-12 items-center justify-center rounded-[4px] border border-border bg-surface px-6 text-sm font-semibold text-foreground hover:border-primary">
                How It Works
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-[4px] border border-border bg-surface">
            <img
              src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1400&q=85"
              alt="Professional workspace with laptop, notebook, and coffee in natural light"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[{ slug: "all", name: "All Categories" }, ...categories].map((c) => (
              <button
                key={c.slug}
                onClick={() => setActiveCat(c.slug)}
                className={`whitespace-nowrap rounded-[4px] border px-4 py-2 text-sm font-medium transition ${activeCat === c.slug ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-foreground hover:border-primary"}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Featured Jobs</h2>
            <p className="mt-2 text-sm text-muted-foreground">Hand-picked open positions from active clients.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCarouselIdx((i) => Math.max(0, i - 1))} disabled={carouselIdx === 0} aria-label="Previous" className="grid h-10 w-10 place-items-center rounded-[4px] border border-border bg-surface text-foreground hover:border-primary disabled:opacity-40">
              <ArrowLeft size={16} />
            </button>
            <button onClick={() => setCarouselIdx((i) => Math.min(maxIdx, i + 1))} disabled={carouselIdx >= maxIdx} aria-label="Next" className="grid h-10 w-10 place-items-center rounded-[4px] border border-border bg-surface text-foreground hover:border-primary disabled:opacity-40">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {visibleJobs.map((j) => <JobCard key={j.id} job={j} />)}
          {jobs.length === 0 && (
            <div className="col-span-3 rounded-[4px] border border-dashed border-border p-12 text-center text-sm text-muted-foreground">No open jobs in this category yet.</div>
          )}
        </div>
        <div className="mt-8 text-center">
          <Link to="/jobs" className="inline-flex h-11 items-center justify-center rounded-[4px] border border-border bg-surface px-6 text-sm font-semibold text-foreground hover:border-primary">
            View all jobs <ArrowRight size={14} className="ml-2" />
          </Link>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">How Worklin works</h2>
            <p className="mt-2 text-sm text-muted-foreground">Three steps from sign-up to your first engagement.</p>
          </div>
          <div className="grid gap-12 md:grid-cols-3">
            {[
              { n: "01", t: "Create your profile", d: "Sign up as a freelancer or client. Tell us your category, skills, and rate. Transcription roles include a brief comprehension check." },
              { n: "02", t: "Find or post work", d: "Browse open jobs by category, skill, and budget — or post your own with a clear scope and rate range." },
              { n: "03", t: "Get matched, get paid", d: "Submit a bid or review proposals. Once engaged, work is tracked and paid out to your linked PayPal account each month." },
            ].map((s) => (
              <div key={s.n} className="relative">
                <div className="absolute -top-4 left-0 select-none text-7xl font-bold text-border">{s.n}</div>
                <div className="relative pt-10">
                  <h3 className="mb-2 text-lg font-semibold">{s.t}</h3>
                  <p className="text-sm text-muted-foreground">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Browse by category</h2>
          <p className="mt-2 text-sm text-muted-foreground">Six service categories covering the work most clients hire for.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/jobs"
              className="group relative block aspect-[4/3] overflow-hidden rounded-[4px] border border-border bg-surface"
            >
              {c.image_url && (
                <img src={c.image_url} alt={c.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-foreground/80 px-5 py-4">
                <div className="text-base font-semibold text-background">{c.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
