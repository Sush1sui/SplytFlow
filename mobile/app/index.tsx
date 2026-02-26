import { Redirect } from "expo-router";
import { useAuthContext } from "@/lib/context/auth-context";
import { Loading } from "@/components/ui/loading";

export default function Index() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <Loading message="Checking authentication..." />;
  }

  // You can add a loading check here if needed
  // For now, redirect based on auth state

  if (user) {
    // User is authenticated, redirect to main app
    // TODO: Create a main app screen (e.g., home screen)
    return <Redirect href="/(tabs)/home" />;
  }

  // User is not authenticated, redirect to sign in
  return <Redirect href="/(auth)/sign-in" />;
}
