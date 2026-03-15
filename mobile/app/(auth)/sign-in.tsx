import React, { useState, useRef, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  Alert,
  Animated,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import useAuthStyles from "./auth-stylesheet";
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
  const styles = useAuthStyles();
  const { login } = useAuthContext();
  const background = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");

  // Entrance animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(cardAnim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(footerAnim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const makeAnimStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [28, 0],
        }),
      },
    ],
  });

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password", [
        { text: "OK", style: "default" },
      ]);
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (error: unknown) {
      Alert.alert(
        "Login Failed",
        error instanceof Error ? error.message : "An error occurred",
        [{ text: "OK", style: "default" }],
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View style={[styles.header, makeAnimStyle(headerAnim)]}>
            <View
              style={[styles.logoCircle, { backgroundColor: `${tintColor}18` }]}
            >
              <Ionicons name="flash" size={34} color={tintColor} />
            </View>
            <ThemedText type="title" style={styles.title}>
              SplytFlow
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Welcome back! Sign in to continue
            </ThemedText>
          </Animated.View>
          <Animated.View style={[{ width: "100%" }, makeAnimStyle(cardAnim)]}>
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
          </Animated.View>

          <Animated.View style={[styles.footer, makeAnimStyle(footerAnim)]}>
            <ThemedText style={styles.footerText}>
              Don&apos;t have an account?
            </ThemedText>
            <Link href="/(auth)/sign-up" replace asChild>
              <TouchableOpacity>
                <ThemedText style={[styles.link, { color: tintColor }]}>
                  Create account
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
