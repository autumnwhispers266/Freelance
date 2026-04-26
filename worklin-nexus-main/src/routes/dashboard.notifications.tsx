import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/notifications")({ component: Notifs, head: () => ({ meta: [{ title: "Notifications — Worklin" }] }) });

interface N { id: string; message: string; read: boolean; created_at: string; }

function Notifs() {
  const { user } = useAuth();
  const [rows, setRows] = useState<N[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => {
        setRows((data as N[]) ?? []);
        supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false).then(() => {});
      });
  }, [user]);
  return (
    <div>
      <h1 className="text-2xl font-bold">Notifications</h1>
      <div className="mt-6 wl-card divide-y divide-border">
        {rows.length === 0 ? <div className="p-10 text-center text-sm text-muted-foreground">No notifications.</div> : rows.map((n) => (
          <div key={n.id} className="px-5 py-4">
            <div className="text-sm">{n.message}</div>
            <div className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
