import { navigate } from "expo-router/build/global-state/routing";
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
    console.log("AuthProvider: Fetching initial session...");
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("AuthProvider: Initial session fetched", {
        hasSession: !!session,
      });
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("AuthProvider: Auth state changed", {
        event: _event,
        hasSession: !!session,
      });
      setSession(session);
      setIsSigningOut(false); // Reset signing out flag
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // fetch profile when session changes
  useEffect(() => {
    if (session === undefined || isSigningOut) {
      console.log("AuthProvider: Skipping profile fetch", {
        session,
        isSigningOut,
      });
      return;
    }

    async function fetchProfile() {
      if (session) {
        console.log(
          "AuthProvider: Fetching profile for user:",
          session.user.id
        );
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("supabase_id", session.user.id)
          .single();

        if (error) {
          console.warn("AuthProvider: Profile fetch error", error);
          // Don't sign out immediately - wait for profile to be created
          setProfile(null);
          return;
        }

        console.log("AuthProvider: Profile fetched successfully");
        setProfile(data as UserProfile);
      } else {
        console.log("AuthProvider: No session, clearing profile");
        setProfile(null);
      }
    }
    fetchProfile();
    console.log("AuthProvider: Rendering", {
      isLoading,
      isLoggedIn: session != undefined && session != null,
      hasProfile: !!profile,
    });
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
