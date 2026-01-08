import { Redirect } from "expo-router";
import { useAuthContext } from "@/src/hooks/use-auth-context";
import { Loading } from "@/components/Loading";

export default function Index() {
  const { isLoggedIn, isLoading } = useAuthContext();

  if (isLoading) {
    return <Loading message="Loading..." />;
  }

  // Redirect to auth or home based on login status
  if (isLoggedIn) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)" />;
}
