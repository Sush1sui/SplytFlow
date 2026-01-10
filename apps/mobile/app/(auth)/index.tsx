import { View, Text, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/src/hooks/use-auth-context";
import GoogleSignInButton from "@/components/social-auth-buttons/google/google-sign-in-btn";
import { Loading } from "@/components/Loading";
import { authStyles as styles } from "@/app/(auth)/styles";

export default function AuthScreen() {
  console.log("Rendering AuthScreen");

  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuthContext();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/(tabs)/home");
    }
  }, [isLoggedIn]);

  if (isLoading) {
    return <Loading message="Checking sessions..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to SplytFlow</Text>
          <Text style={styles.subtitle}>
            Track your sales and manage splits effortlessly
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <GoogleSignInButton />
        </View>

        <Text style={styles.terms}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}
