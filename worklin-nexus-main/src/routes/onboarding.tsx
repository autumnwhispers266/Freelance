import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
  head: () => ({ meta: [{ title: "Onboarding — Worklin" }, { name: "description", content: "Complete your Worklin profile in three short steps." }] }),
});

interface Cat { id: string; slug: string; name: string; }

function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [cats, setCats] = useState<Cat[]>([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [primaryCategory, setPrimaryCategory] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [paypal, setPaypal] = useState("");

  useEffect(() => {
    supabase.from("categories").select("id,slug,name").order("sort_order").then(({ data }) => setCats(data ?? []));
  }, []);
  useEffect(() => { if (!user) navigate({ to: "/login" }); }, [user, navigate]);

  const isTranscription = primaryCategory === "transcription";

  const addSkill = () => {
    const v = skillInput.trim();
    if (v && !skills.includes(v)) setSkills([...skills, v]);
    setSkillInput("");
  };
  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  const finish = async (skipPayout = false) => {
    if (!user) return;
    const initials = fullName.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "WK";
    await supabase.from("profiles").update({
      full_name: fullName,
      avatar_initials: initials,
      phone,
      primary_category: cats.find((c) => c.slug === primaryCategory)?.name ?? null,
      skills,
      bio,
      hourly_rate: hourlyRate ? Number(hourlyRate) : null,
      paypal_email: skipPayout ? null : (paypal || null),
      onboarding_complete: true,
    }).eq("id", user.id);
    await refreshProfile();
    toast.success("Profile saved");
    if (isTranscription) navigate({ to: "/transcription-test" });
    else navigate({ to: "/dashboard" });
  };

  const next = () => {
    if (step === 1 && !fullName) { toast.error("Enter your full name"); return; }
    if (step === 2 && !primaryCategory) { toast.error("Pick a primary category"); return; }
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="mb-8 block text-center text-xl font-bold text-primary">Worklin</Link>
        <Stepper step={step} labels={["Account Details", "Professional Info", "Payout Setup"]} />
        <div className="mt-8 wl-card p-8">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Account Details</h2>
              <Input label="Full Name" value={fullName} onChange={setFullName} required />
              <Input label="Phone Number" value={phone} onChange={setPhone} type="tel" />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold">Professional Info</h2>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Category</label>
                <select value={primaryCategory} onChange={(e) => setPrimaryCategory(e.target.value)} className="h-11 w-full rounded-[4px] border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none">
                  <option value="">Select a category</option>
                  {cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Skills</label>
                <div className="mb-2 flex gap-2">
                  <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); }}} placeholder="Add a skill and press Enter" className="h-11 w-full rounded-[4px] border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none" />
                  <button type="button" onClick={addSkill} className="h-11 rounded-[4px] border border-border bg-surface px-4 text-sm font-medium hover:border-primary">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 rounded-[2px] border border-border bg-background px-2 py-1 text-xs">
                      {s}
                      <button type="button" onClick={() => removeSkill(s)} aria-label={`Remove ${s}`} className="grid h-4 w-4 place-items-center rounded-[2px] text-muted-foreground hover:text-destructive">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-medium"><span>Bio</span><span className="text-muted-foreground">{bio.length}/160</span></label>
                <textarea value={bio} maxLength={160} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full rounded-[4px] border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
              <Input label="Hourly Rate (USD)" value={hourlyRate} onChange={setHourlyRate} type="number" />
              {isTranscription && (
                <div className="rounded-[4px] border-l-[3px] border-warning bg-warning-tint px-4 py-3 text-sm text-foreground">
                  This role requires an English comprehension test. You will be prompted after completing your profile.
                </div>
              )}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Payout Setup</h2>
              <Input label="PayPal Email" value={paypal} onChange={setPaypal} type="email" />
              <p className="text-xs text-muted-foreground">Your earnings will be sent to this address at the end of each month.</p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="h-10 rounded-[4px] border border-border bg-surface px-4 text-sm font-medium hover:border-primary">Back</button>
            ) : <span />}
            <div className="flex items-center gap-3">
              {step === 3 && (
                <button onClick={() => finish(true)} className="text-sm text-muted-foreground hover:text-primary">Skip for Now</button>
              )}
              {step < 3 ? (
                <button onClick={next} className="h-10 rounded-[4px] bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Next</button>
              ) : (
                <button onClick={() => finish(false)} className="h-10 rounded-[4px] bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Finish</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium">{label}{required && <span className="text-destructive"> *</span>}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-full rounded-[4px] border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none" />
    </div>
  );
}

export function Stepper({ step, labels }: { step: number; labels: string[] }) {
  return (
    <div className="flex items-center">
      {labels.map((l, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        return (
          <div key={l} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div className={`grid h-8 w-8 place-items-center rounded-full border text-xs font-semibold ${done ? "border-primary bg-primary text-primary-foreground" : active ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{n}</div>
              <div className={`mt-2 text-[11px] font-medium ${active || done ? "text-foreground" : "text-muted-foreground"}`}>{l}</div>
            </div>
            {i < labels.length - 1 && <div className={`mx-3 h-px flex-1 ${done ? "bg-primary" : "bg-border"}`} />}
          </div>
        );
      })}
    </div>
  );
}
