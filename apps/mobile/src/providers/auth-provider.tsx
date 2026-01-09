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
    async function initializeAuth() {
      console.log("AuthProvider: Initializing auth...");

      // Get local session
      const {
        data: { session: localSession },
      } = await supabase.auth.getSession();

      if (!localSession) {
        console.log("AuthProvider: No local session found");
        setSession(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      console.log(
        "AuthProvider: Found local session, verifying with Supabase..."
      );

      // Verify session is still valid with Supabase
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        console.log("AuthProvider: Session invalid, clearing local storage");
        // Clear the invalid session from local storage
        await supabase.auth.signOut({ scope: "local" });
        setSession(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      console.log("AuthProvider: Session valid, checking DB profile...");

      // Fetch user profile from database
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("supabase_id", userData.user.id)
        .single();

      if (profileError || !profileData) {
        console.log("AuthProvider: No profile found in DB, signing out");
        await supabase.auth.signOut({ scope: "local" });
        setSession(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      console.log("AuthProvider: Session and profile valid");
      setSession(localSession);
      setProfile(profileData as UserProfile);
      setIsLoading(false);
    }

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Ignore INITIAL_SESSION since we handle it manually above
      if (_event === "INITIAL_SESSION") {
        console.log("AuthProvider: Ignoring INITIAL_SESSION from listener");
        return;
      }

      console.log("AuthProvider: Auth state changed", {
        event: _event,
        hasSession: !!session,
      });

      setSession(session);
      setIsSigningOut(false);

      // Fetch profile when session changes
      if (session) {
        console.log(
          "AuthProvider: Fetching profile after auth change for user:",
          session.user.id
        );
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("supabase_id", session.user.id)
            .single();

          if (profileError || !profileData) {
            console.warn(
              "AuthProvider: Profile fetch error after auth change",
              profileError
            );
            setProfile(null);
          } else {
            console.log(
              "AuthProvider: Profile fetched successfully after auth change:",
              profileData
            );
            setProfile(profileData as UserProfile);
          }
        } catch (err) {
          console.error("AuthProvider: Exception during profile fetch", err);
          setProfile(null);
        } finally {
          // Ensure loading is set to false after handling auth state change
          setIsLoading(false);
        }
      } else {
        console.log(
          "AuthProvider: No session after auth change, clearing profile"
        );
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
