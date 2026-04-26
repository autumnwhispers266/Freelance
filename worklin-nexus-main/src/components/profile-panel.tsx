import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X, Pencil, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ProfilePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile, role, signOut, refreshProfile, user } = useAuth();
  const navigate = useNavigate();
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingPaypal, setEditingPaypal] = useState(false);
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [paypal, setPaypal] = useState(profile?.paypal_email ?? "");
  const [theme, setTheme] = useState<string>(profile?.theme ?? "light");
  const [emailNotif, setEmailNotif] = useState(profile?.email_notifications ?? true);

  useEffect(() => {
    setPhone(profile?.phone ?? "");
    setPaypal(profile?.paypal_email ?? "");
    setTheme(profile?.theme ?? "light");
    setEmailNotif(profile?.email_notifications ?? true);
  }, [profile]);

  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  const savePhone = async () => {
    if (!user) return;
    await supabase.from("profiles").update({ phone }).eq("id", user.id);
    setEditingPhone(false);
    await refreshProfile();
    toast.success("Phone updated");
  };
  const savePaypal = async () => {
    if (!user) return;
    await supabase.from("profiles").update({ paypal_email: paypal }).eq("id", user.id);
    setEditingPaypal(false);
    await refreshProfile();
    toast.success("Payout email updated");
  };
  const toggleTheme = async (t: string) => {
    if (!user) return;
    setTheme(t);
    await supabase.from("profiles").update({ theme: t }).eq("id", user.id);
  };
  const toggleNotif = async (v: boolean) => {
    if (!user) return;
    setEmailNotif(v);
    await supabase.from("profiles").update({ email_notifications: v }).eq("id", user.id);
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
    navigate({ to: "/" });
  };

  if (!profile) return null;

  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 z-40 bg-black/30" aria-hidden />}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-[380px] flex-col border-l border-border bg-surface transition-transform duration-200 ${open ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="text-sm font-semibold">Profile</div>
          <button onClick={onClose} aria-label="Close panel" className="grid h-9 w-9 place-items-center rounded-[4px] hover:bg-accent">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
              {profile.avatar_initials}
            </span>
            <div>
              <div className="text-base font-semibold">{profile.full_name ?? "—"}</div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{role ?? "Member"} · {profile.primary_category ?? "General"}</div>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Profile Info</div>
            <EditableRow
              label="Phone Number"
              value={phone || "Not set"}
              editing={editingPhone}
              onEdit={() => setEditingPhone(true)}
              onSave={savePhone}
              input={
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 w-full rounded-[4px] border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none"
                />
              }
            />
            <EditableRow
              label="PayPal Email"
              value={paypal || "Not set"}
              editing={editingPaypal}
              onEdit={() => setEditingPaypal(true)}
              onSave={savePaypal}
              input={
                <input
                  type="email"
                  value={paypal}
                  onChange={(e) => setPaypal(e.target.value)}
                  className="h-10 w-full rounded-[4px] border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none"
                />
              }
            />
          </div>

          <div className="mt-8">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preferences</div>

            <div className="mb-4">
              <div className="mb-2 text-sm">Theme</div>
              <div className="inline-flex rounded-[4px] border border-border bg-surface p-1">
                {(["light", "dark"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleTheme(t)}
                    className={`h-8 px-4 text-sm capitalize ${theme === t ? "bg-primary text-primary-foreground rounded-[2px]" : "text-foreground"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm">Email Notifications</div>
              <div className="inline-flex rounded-[4px] border border-border bg-surface p-1">
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    onClick={() => toggleNotif(v)}
                    className={`h-8 px-4 text-sm ${emailNotif === v ? "bg-primary text-primary-foreground rounded-[2px]" : "text-foreground"}`}
                  >
                    {v ? "On" : "Off"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border px-5 py-4">
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-destructive hover:underline"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function EditableRow({
  label, value, editing, onEdit, onSave, input,
}: {
  label: string; value: string; editing: boolean; onEdit: () => void; onSave: () => void; input: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="mb-1 text-xs text-muted-foreground">{label}</div>
      {editing ? (
        <div className="flex items-center gap-2">
          {input}
          <button onClick={onSave} className="grid h-10 w-10 place-items-center rounded-[4px] bg-primary text-primary-foreground" aria-label="Save">
            <Check size={16} />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-[4px] border border-border bg-surface px-3 py-2.5">
          <span className="text-sm text-foreground">{value}</span>
          <button onClick={onEdit} aria-label={`Edit ${label}`} className="grid h-7 w-7 place-items-center rounded-[4px] text-muted-foreground hover:bg-accent hover:text-primary">
            <Pencil size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
