import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/restricted")({
  component: Restricted,
  head: () => ({ meta: [{ title: "Account Restricted — Worklin" }, { name: "description", content: "Your Worklin account access has been temporarily restricted." }] }),
});

function Restricted() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-xl text-center">
        <Link to="/" className="mb-10 block text-xl font-bold text-primary">Worklin</Link>
        <div className="rounded-[4px] border border-border border-l-[3px] border-l-warning bg-warning-tint px-6 py-8 text-left">
          <h1 className="text-xl font-bold">Account Access Restricted</h1>
          <p className="mt-3 text-sm text-foreground/80">
            We have detected unusual activity on your account and have temporarily restricted your access. If you believe this is a mistake, please contact our support team to begin the verification process.
          </p>
          <a href="mailto:support@worklin.example" className="mt-5 inline-flex h-10 items-center justify-center rounded-[4px] border border-primary bg-surface px-4 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
