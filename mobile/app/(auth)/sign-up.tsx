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
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuthStyles } from "./auth-stylesheet";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PasswordStrength } from "@/components/ui/password-strength";
import { useAuthContext } from "@/lib/context/auth-context";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const styles = useAuthStyles();
  const { signup } = useAuthContext();
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

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await signup(firstName, lastName, email, password, confirmPassword);
    } catch (error) {
      Alert.alert(
        "Signup Failed",
        error instanceof Error ? error.message : "An error occurred",
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
              <Ionicons name="people" size={34} color={tintColor} />
            </View>
            <ThemedText type="title" style={styles.title}>
              SplytFlow
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Create your account to get started
            </ThemedText>
          </Animated.View>
          <Animated.View style={[{ width: "100%" }, makeAnimStyle(cardAnim)]}>
            <Card>
              <View style={styles.cardContent}>
                {/* Name row: side-by-side on wider screens */}
                <View style={styles.nameRow}>
                  <View style={styles.nameField}>
                    <Input
                      label="First Name"
                      placeholder="First name"
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                      leftIcon="person-outline"
                      editable={!loading}
                    />
                  </View>
                  <View style={styles.nameField}>
                    <Input
                      label="Last Name"
                      placeholder="Last name"
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                      leftIcon="person-outline"
                      editable={!loading}
                    />
                  </View>
                </View>

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
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  leftIcon="lock-closed-outline"
                  rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  editable={!loading}
                />

                <PasswordStrength password={password} />

                <Input
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  leftIcon="lock-closed-outline"
                  rightIcon={
                    showConfirmPassword ? "eye-off-outline" : "eye-outline"
                  }
                  onRightIconPress={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  error={
                    confirmPassword && password !== confirmPassword
                      ? "Passwords do not match"
                      : undefined
                  }
                  editable={!loading}
                />

                <Button
                  onPress={handleSignUp}
                  variant="primary"
                  loading={loading}
                  disabled={loading}
                >
                  Create Account
                </Button>
              </View>
            </Card>
          </Animated.View>

          <Animated.View style={[styles.footer, makeAnimStyle(footerAnim)]}>
            <ThemedText style={styles.footerText}>
              Already have an account?
            </ThemedText>
            <Link href="/(auth)/sign-in" replace asChild>
              <TouchableOpacity>
                <ThemedText style={[styles.link, { color: tintColor }]}>
                  Sign in
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
