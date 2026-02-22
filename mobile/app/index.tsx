import { Redirect } from "expo-router";
import React from "react";
import { useAuthContext } from "@/lib/context/auth-context";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { user } = useAuthContext();

  // You can add a loading check here if needed
  // For now, redirect based on auth state

  if (user) {
    // User is authenticated, redirect to main app
    // TODO: Create a main app screen (e.g., home screen)
    return <Redirect href="/(auth)/sign-in" />; // Change this to your main app route
  }

  // User is not authenticated, redirect to sign in
  return <Redirect href="/(auth)/sign-in" />;
}
