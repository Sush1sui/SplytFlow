import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";

import styles from "./auth-stylesheet";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthContext } from "@/lib/context/auth-context";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const { login } = useAuthContext();
  const background = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");

  const handleSignIn = async () => {
    router.replace("/otp"); // simulation purposess

    // if (!email || !password) {
    //   Alert.alert("Error", "Please enter both email and password");
    //   return;
    // }

    // try {
    //   setLoading(true);
    //   await login(email, password);
    // } catch (error: unknown) {
    //   Alert.alert(
    //     "Login Failed",
    //     error instanceof Error ? error.message : "An error occurred",
    //   );
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ alignItems: "center", width: "100%" }}
        >
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              SplytFlow
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Welcome back! Sign in to continue
            </ThemedText>
          </View>

          <Card>
            <View style={styles.cardContent}>
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
                editable={!loading}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                leftIcon="lock-closed-outline"
                rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => setShowPassword(!showPassword)}
                editable={!loading}
              />

              <TouchableOpacity
                style={styles.forgotPassword}
                disabled={loading}
              >
                <ThemedText style={[styles.link, { color: tintColor }]}>
                  Forgot password?
                </ThemedText>
              </TouchableOpacity>

              <Button
                onPress={handleSignIn}
                variant="primary"
                loading={loading}
                disabled={loading}
              >
                Sign In
              </Button>
            </View>
          </Card>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              Don't have an account?
            </ThemedText>
            <Link href="/(auth)/sign-up" replace asChild>
              <TouchableOpacity>
                <ThemedText style={[styles.link, { color: tintColor }]}>
                  Create account
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
