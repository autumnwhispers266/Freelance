import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/public-layout";

export const Route = createFileRoute("/how-it-works")({
  component: HowItWorks,
  head: () => ({
    meta: [
      { title: "How It Works — Worklin" },
      { name: "description", content: "How Worklin connects freelancers and clients: profile, browse or post, bid, get paid each month via PayPal." },
      { property: "og:title", content: "How It Works — Worklin" },
      { property: "og:description", content: "How Worklin connects freelancers and clients." },
    ],
  }),
});

function HowItWorks() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-4xl px-4 py-20 md:px-6">
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">How It Works</div>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">From sign-up to first engagement.</h1>
        <p className="mt-6 max-w-2xl text-base text-muted-foreground">Worklin keeps the workflow short. Three steps for freelancers, three for clients.</p>

        {[
          { who: "For freelancers", steps: [
            { n: "01", t: "Create your profile", d: "Verify your email, choose a category, list your skills and hourly rate, and connect a PayPal account for payouts." },
            { n: "02", t: "Browse and bid", d: "Filter open jobs by category, budget, and skill. Submit a bid with your proposed rate and a short cover note." },
            { n: "03", t: "Deliver and get paid", d: "Once engaged, deliver the work. Earnings are paid to your linked PayPal account at the end of each month." },
          ]},
          { who: "For clients", steps: [
            { n: "01", t: "Post a job", d: "Describe the scope, set a clear rate range, list required skills. Posts go live within minutes after a brief review." },
            { n: "02", t: "Review bids", d: "Bids arrive in your dashboard. Compare proposals, rates, and freelancer profiles side by side." },
            { n: "03", t: "Engage and complete", d: "Approve a freelancer to start work. Mark the job as filled when complete and the platform settles payment." },
          ]},
        ].map((block) => (
          <div key={block.who} className="mt-16">
            <h2 className="mb-8 text-xl font-bold">{block.who}</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {block.steps.map((s) => (
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
        ))}

        <div className="mt-16 flex flex-wrap gap-3">
          <Link to="/signup" className="inline-flex h-12 items-center justify-center rounded-[4px] bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Get Started</Link>
          <Link to="/jobs" className="inline-flex h-12 items-center justify-center rounded-[4px] border border-border bg-surface px-6 text-sm font-semibold text-foreground hover:border-primary">Browse Jobs</Link>
        </div>
      </section>
    </PublicLayout>
  );
}
