import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/public-layout";
import { supabase } from "@/integrations/supabase/client";

interface Cat { id: string; slug: string; name: string; description: string | null; image_url: string | null; }

export const Route = createFileRoute("/categories")({
  component: Categories,
  head: () => ({
    meta: [
      { title: "Categories — Worklin" },
      { name: "description", content: "Browse Worklin service categories: Creative & Design, Writing & Content, Web & IT, Marketing & Admin, Media & Production, and Transcription." },
      { property: "og:title", content: "Categories — Worklin" },
      { property: "og:description", content: "Browse Worklin service categories." },
    ],
  }),
});

function Categories() {
  const [cats, setCats] = useState<Cat[]>([]);
  useEffect(() => {
    supabase.from("categories").select("*").order("sort_order").then(({ data }) => setCats(data ?? []));
  }, []);
  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Categories</div>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Six categories. Real work in every one.</h1>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((c) => (
            <Link key={c.id} to="/jobs" className="group block overflow-hidden rounded-[4px] border border-border bg-surface hover:border-primary">
              <div className="relative aspect-[16/10] overflow-hidden">
                {c.image_url && <img src={c.image_url} alt={c.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                <div className="absolute inset-x-0 bottom-0 bg-foreground/80 px-4 py-3">
                  <div className="text-sm font-semibold text-background">{c.name}</div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-muted-foreground">{c.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
