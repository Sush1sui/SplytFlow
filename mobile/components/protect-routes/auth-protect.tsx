import { useAuthState } from "@/lib/context/auth-context";
import { Redirect } from "expo-router";
import React from "react";
import { Loading } from "@/components/loading";

export default function AuthProtect({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuthState();

  if (loading) return <Loading message="Checking session..." />;

  if (!user) return <Redirect href="/(auth)/signin" />;

  return <>{children}</>;
}
