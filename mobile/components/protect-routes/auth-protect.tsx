import useAuthContext from "@/lib/context/auth-context";
import { Redirect } from "expo-router";
import React from "react";
import { Text } from "react-native";

export default function AuthProtect({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuthContext();

  if (loading) return null; //replace with loading screen

  if (!user) return <Redirect href="/(auth)/signin" />;

  return <>{children}</>;
}
