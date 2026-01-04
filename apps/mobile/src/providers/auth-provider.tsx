import { AuthContext, UserProfile } from "../hooks/use-auth-context";
import { supabase } from "../lib/db";
import type { Session } from "@supabase/supabase-js";
import { PropsWithChildren, useEffect, useState } from "react";

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null | undefined>();
  const [profile, setProfile] = useState<UserProfile | null | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // fetch session once, and subscribe to auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // fetch profile when session changes
  useEffect(() => {
    if (session === undefined) return;

    async function fetchProfile() {
      if (session) {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        setProfile(data as UserProfile);
      } else {
        setProfile(null);
      }
    }
    fetchProfile();
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        profile,
        isLoggedIn: session != undefined && session != null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
