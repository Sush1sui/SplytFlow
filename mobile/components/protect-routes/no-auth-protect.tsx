import useAuthContext from "@/lib/context/auth-context";
import React from "react";
import { Redirect } from "expo-router";

export default function NoAuthProtect({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuthContext();

  if (loading) return null; // replace with loading screen

  if (user) return <Redirect href="/" />; // replace with home

  return <>{children}</>;
}
