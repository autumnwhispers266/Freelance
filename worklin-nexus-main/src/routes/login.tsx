import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [{ title: "Login — Worklin" }, { name: "description", content: "Log in to your Worklin account." }] }),
});

function Login() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    await refreshProfile();
    // Determine redirect via role + status
    if (data.user) {
      const [{ data: prof }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("status, onboarding_complete").eq("id", data.user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", data.user.id),
      ]);
      if (prof?.status === "restricted") { navigate({ to: "/restricted" }); return; }
      const isAdmin = roles?.some((r) => r.role === "admin");
      if (isAdmin) { navigate({ to: "/admin" }); return; }
      if (!prof?.onboarding_complete) { navigate({ to: "/onboarding" }); return; }
      navigate({ to: "/dashboard" });
      toast.success("Welcome back");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 block text-center text-xl font-bold text-primary">Worklin</Link>
        <div className="wl-card p-8">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Log in to continue.</p>
          {err && <div className="mt-4 rounded-[4px] border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</div>}
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 w-full rounded-[4px] border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Password</label>
              <div className="relative">
                <input type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 w-full rounded-[4px] border border-border bg-surface px-3 pr-10 text-sm focus:border-primary focus:outline-none" />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-[4px] text-muted-foreground hover:text-primary">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded-[2px] border-border accent-primary" />
                <span>Remember me</span>
              </label>
              <button type="button" onClick={() => toast.message("Password reset link would be emailed here.")} className="text-sm font-medium text-primary hover:underline">Forgot password?</button>
            </div>
            <button disabled={loading} className="inline-flex h-11 w-full items-center justify-center rounded-[4px] bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {loading ? "Logging in…" : "Login"}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account? <Link to="/signup" className="font-medium text-primary hover:underline">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
