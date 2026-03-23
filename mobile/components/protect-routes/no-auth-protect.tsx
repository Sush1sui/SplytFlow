import { useAuthState } from "@/lib/context/auth-context";
import React from "react";
import { Redirect } from "expo-router";
import { Loading } from "@/components/loading";

export default function NoAuthProtect({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuthState();

  if (loading) return <Loading message="Checking session..." />;

  if (user) return <Redirect href="/" />;

  return <>{children}</>;
}
