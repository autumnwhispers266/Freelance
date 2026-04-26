import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/earnings")({ component: () => (
  <div>
    <h1 className="text-2xl font-bold">Earnings</h1>
    <div className="mt-6 grid gap-4 sm:grid-cols-3">
      <div className="wl-card p-5"><div className="text-3xl font-bold text-primary">$2,480</div><div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">This Month</div></div>
      <div className="wl-card p-5"><div className="text-3xl font-bold text-primary">$18,920</div><div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Year to Date</div></div>
      <div className="wl-card p-5"><div className="text-3xl font-bold text-primary">$0</div><div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Pending Payout</div></div>
    </div>
  </div>
)});
