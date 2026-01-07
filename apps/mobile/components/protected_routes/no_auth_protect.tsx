import { useAuthContext } from "@/src/hooks/use-auth-context";
import { ReactNode } from "react";
import { Loading } from "../Loading";
import { Redirect } from "expo-router";

export default function NoAuthProtect({ children }: { children: ReactNode }) {
  const { isLoggedIn, isLoading } = useAuthContext();

  if (isLoading) return <Loading message="Checking sessions..." />;

  if (isLoggedIn) return <Redirect href="/(tabs)/home" />;

  return <>{children}</>;
}
