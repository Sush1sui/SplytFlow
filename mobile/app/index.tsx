import { Redirect } from "expo-router";
import { Loading } from "@/components/loading";
import { useAuthState } from "@/lib/context/auth-context";

export default function Index() {
  const { user, loading } = useAuthState();

  if (loading) return <Loading message="Checking session..." />;

  if (user) return <Redirect href="/(tabs)/(home)" />;

  return <Redirect href="/(auth)/signin" />;
}
