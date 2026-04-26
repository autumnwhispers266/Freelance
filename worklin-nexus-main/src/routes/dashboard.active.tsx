import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/active")({ component: () => (
  <div><h1 className="text-2xl font-bold">Active Jobs</h1><div className="mt-6 wl-card p-10 text-center text-sm text-muted-foreground">No active engagements yet.</div></div>
)});
