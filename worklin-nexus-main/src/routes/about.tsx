import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/public-layout";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About — Worklin" },
      { name: "description", content: "Worklin is a marketplace for serious freelance work. Learn how we vet talent and connect clients to professionals." },
      { property: "og:title", content: "About — Worklin" },
      { property: "og:description", content: "A marketplace for serious freelance work." },
    ],
  }),
});

function About() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-4 py-20 md:px-6">
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">About</div>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">A marketplace for real work.</h1>
        <p className="mt-6 text-base text-muted-foreground">
          Worklin was built for clients and freelancers who are tired of noise. We focus on a small set of categories where independent professionals do their best work — design, writing, engineering, marketing, media, and transcription — and we keep the experience simple end to end.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="wl-card p-6">
            <div className="mb-2 text-sm font-semibold">Vetted, not gated</div>
            <p className="text-sm text-muted-foreground">We verify identity and check craft references. We don't lock new freelancers behind opaque membership fees.</p>
          </div>
          <div className="wl-card p-6">
            <div className="mb-2 text-sm font-semibold">Predictable payouts</div>
            <p className="text-sm text-muted-foreground">Earnings are paid to your linked PayPal account at the end of each month — no surprise holds, no convoluted escrow.</p>
          </div>
          <div className="wl-card p-6">
            <div className="mb-2 text-sm font-semibold">Honest job posts</div>
            <p className="text-sm text-muted-foreground">Every job includes a real rate range, real scope, and a real client. We remove anything that does not.</p>
          </div>
          <div className="wl-card p-6">
            <div className="mb-2 text-sm font-semibold">Quiet by design</div>
            <p className="text-sm text-muted-foreground">No chat noise, no badges, no leaderboards. Just the work and the people who do it.</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
