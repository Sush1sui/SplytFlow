import { View, Text, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuthContext } from "@/src/hooks/use-auth-context";
import GoogleSignInButton from "@/components/social-auth-buttons/google/google-sign-in-btn";
import { Loading } from "@/components/Loading";

export default function AuthScreen() {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 320,
    marginBottom: 24,
  },
  terms: {
    fontSize: 12,
    color: "#999999",
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 300,
  },
});
