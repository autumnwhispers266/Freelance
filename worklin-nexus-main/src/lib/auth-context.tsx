import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "freelancer" | "client";
export type AccountStatus = "active" | "restricted";

export interface ProfileLite {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_initials: string | null;
  primary_category: string | null;
  status: AccountStatus;
  onboarding_complete: boolean;
  theme: string | null;
  email_notifications: boolean;
  phone: string | null;
  paypal_email: string | null;
  bio: string | null;
  hourly_rate: number | null;
  skills: string[] | null;
  verification: "pending" | "verified" | "rejected";
  test_score: number | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: ProfileLite | null;
  role: AppRole | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileLite | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAux = async (uid: string) => {
    const [{ data: prof }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile((prof as ProfileLite) ?? null);
    if (roles && roles.length > 0) {
      // pick the highest-privilege role
      const order: AppRole[] = ["admin", "client", "freelancer"];
      const found = order.find((r) => roles.some((x: { role: AppRole }) => x.role === r));
      setRole(found ?? (roles[0].role as AppRole));
    } else {
      setRole(null);
    }
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        // defer to avoid deadlock per Supabase docs
        setTimeout(() => loadAux(sess.user.id), 0);
      } else {
        setProfile(null);
        setRole(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadAux(s.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) await loadAux(user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, role, loading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
