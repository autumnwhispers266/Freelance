import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/signup")({
  component: SignUp,
  head: () => ({ meta: [{ title: "Create account — Worklin" }, { name: "description", content: "Create your Worklin account as a freelancer or client." }] }),
});

type Role = "freelancer" | "client";

function SignUp() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [role, setRole] = useState<Role>("freelancer");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setErr("Passwords do not match."); return; }
    setLoading(true);
    const redirectUrl = `${window.location.origin}/onboarding`;
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { role },
      },
    });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    await refreshProfile();
    navigate({ to: "/onboarding" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">
        <Link to="/" className="mb-8 block text-center text-xl font-bold text-primary">Worklin</Link>
        <div className="wl-card p-8">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Join Worklin in less than a minute.</p>
          {err && <div className="mt-4 rounded-[4px] border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</div>}
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 w-full rounded-[4px] border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <PasswordField label="Password" value={password} onChange={setPassword} show={show1} onToggle={() => setShow1((s) => !s)} />
              <PasswordField label="Confirm Password" value={confirm} onChange={setConfirm} show={show2} onToggle={() => setShow2((s) => !s)} />
            </div>

            <div>
              <div className="mb-2 text-xs font-medium text-foreground">Account Type</div>
              <div className="grid gap-3 md:grid-cols-2">
                <RoleCard active={role === "freelancer"} onClick={() => setRole("freelancer")} title="I am a Freelancer" desc="I want to find work and bid on projects." />
                <RoleCard active={role === "client"} onClick={() => setRole("client")} title="I am a Client" desc="I want to post work and hire freelancers." />
              </div>
            </div>

            <button disabled={loading} className="inline-flex h-11 w-full items-center justify-center rounded-[4px] bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle }: { label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void; }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-foreground">{label}</label>
      <div className="relative">
        <input type={show ? "text" : "password"} required value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-full rounded-[4px] border border-border bg-surface px-3 pr-10 text-sm focus:border-primary focus:outline-none" />
        <button type="button" onClick={onToggle} aria-label={show ? `Hide ${label}` : `Show ${label}`} className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-[4px] text-muted-foreground hover:text-primary">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

function RoleCard({ active, onClick, title, desc }: { active: boolean; onClick: () => void; title: string; desc: string; }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-clickable="true"
      className={`rounded-[4px] border p-4 text-left transition ${active ? "border-primary bg-primary-tint" : "border-border bg-surface hover:border-primary"}`}
      aria-pressed={active}
    >
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
    </button>
  );
}
