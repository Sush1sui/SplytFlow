import { AuthContext, UserProfile } from "../hooks/use-auth-context";
import { supabase } from "../lib/db";
import type { Session } from "@supabase/supabase-js";
import { PropsWithChildren, useEffect, useState } from "react";

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null | undefined>();
  const [profile, setProfile] = useState<UserProfile | null | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

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
      setIsSigningOut(false); // Reset signing out flag
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // fetch profile when session changes
  useEffect(() => {
    if (session === undefined || isSigningOut) return;

    async function fetchProfile() {
      if (session) {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) {
          // User doesn't exist or database error - sign out
          console.warn("Profile fetch error, signing out:", error);
          setIsSigningOut(true);
          await supabase.auth.signOut();
          setSession(null);
          setProfile(null);
          return;
        }

        setProfile(data as UserProfile);
      } else {
        setProfile(null);
      }
    }
    fetchProfile();
  }, [session, isSigningOut]);

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
