import { useAuthContext } from "@/lib/context/auth-context";
import React from "react";
import { Loading } from "../ui/loading";
import { Redirect } from "expo-router";

export default function NoAuthProtect({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuthContext();

  if (loading) return <Loading message="Fetching user data..." />;

  if (user) return <Redirect href="/(tabs)/home" />;

  return <>{children}</>;
}
