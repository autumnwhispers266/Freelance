import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, X, Upload } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/portfolio")({ component: Portfolio, head: () => ({ meta: [{ title: "Portfolio — Worklin" }] }) });

interface Item { id: string; title: string; description: string | null; image_url: string | null; external_link: string | null; category: string | null; }

function Portfolio() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);

  const load = () => {
    if (!user) return;
    supabase.from("portfolio_items").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setItems((data as Item[]) ?? []));
  };
  useEffect(load, [user]);

  const remove = async (id: string) => {
    await supabase.from("portfolio_items").delete().eq("id", id);
    load();
    toast.success("Removed");
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <button onClick={() => setOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-primary bg-surface px-4 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground"><Plus size={14} />Add Portfolio Item</button>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <div key={it.id} className="wl-card overflow-hidden">
            <div className="aspect-video bg-muted">{it.image_url && <img src={it.image_url} alt={it.title} className="h-full w-full object-cover" />}</div>
            <div className="p-4">
              <div className="text-sm font-semibold">{it.title}</div>
              {it.description && <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{it.description}</div>}
              <div className="mt-3 flex gap-3 text-xs">
                <button onClick={() => toast.message("Editing portfolio items coming soon")} className="font-medium text-primary hover:underline">Edit</button>
                <button onClick={() => remove(it.id)} className="font-medium text-destructive hover:underline">Remove</button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-full rounded-[4px] border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No portfolio items yet.</div>}
      </div>
      {open && <AddModal onClose={() => { setOpen(false); load(); }} />}
    </div>
  );
}

function AddModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [link, setLink] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!user || !title) return;
    setSaving(true);
    let image_url: string | null = null;
    if (file) {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("portfolio").upload(path, file);
      if (!upErr) {
        const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
        image_url = data.publicUrl;
      }
    }
    await supabase.from("portfolio_items").insert({ user_id: user.id, title, description: desc, external_link: link, category, image_url });
    setSaving(false);
    toast.success("Item saved");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <div className="w-full max-w-lg wl-card p-6">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">Add Portfolio Item</h2><button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-[4px] hover:bg-accent"><X size={16} /></button></div>
        <div className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="h-10 w-full rounded-[4px] border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none" />
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" rows={3} className="w-full rounded-[4px] border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          <label className="flex h-28 cursor-pointer items-center justify-center gap-2 rounded-[4px] border border-dashed border-border bg-surface px-3 text-sm text-muted-foreground hover:border-primary">
            <Upload size={16} /><span>{file ? file.name : "Drop or click to upload an image"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="External Link (optional)" className="h-10 w-full rounded-[4px] border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none" />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="h-10 w-full rounded-[4px] border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div className="mt-5 flex items-center justify-end gap-3">
          <button onClick={onClose} className="text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
          <button disabled={saving || !title} onClick={save} className="h-10 rounded-[4px] bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">{saving ? "Saving…" : "Save Item"}</button>
        </div>
      </div>
    </div>
  );
}
