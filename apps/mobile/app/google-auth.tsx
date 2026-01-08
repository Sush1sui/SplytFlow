import { useEffect } from "react";
import { router } from "expo-router";
import { Loading } from "@/components/Loading";

// This route handles the OAuth redirect from Google
export default function GoogleAuthCallback() {
  useEffect(() => {
    // The OAuth flow is complete, redirect to root
    // The auth provider will handle routing to home or auth based on session
    router.replace("/");
  }, []);

  return <Loading message="Completing sign in..." />;
}
