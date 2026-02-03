import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  username: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST (keep callback synchronous)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // THEN get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
      })
      .finally(() => setLoading(false));

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const userId = user?.id;
    if (!userId) {
      setIsAdmin(false);
      setUsername(null);
      return;
    }

    // Use a SECURITY DEFINER backend function to avoid RLS recursion / visibility issues
    supabase
      .rpc("has_role", { _user_id: userId, _role: "admin" })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          // Fail closed: if we can't verify admin, don't show admin UI.
          setIsAdmin(false);
          return;
        }
        setIsAdmin(Boolean(data));
      });

    // Fetch username from profiles
    supabase
      .from("profiles")
      .select("username, display_name")
      .eq("user_id", userId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setUsername(null);
          return;
        }
        setUsername(data?.username || data?.display_name || null);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, username, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
