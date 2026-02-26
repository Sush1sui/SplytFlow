import React, { useState, useRef, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import useAuthStyles from "../(auth)/auth-stylesheet";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthContext } from "@/lib/context/auth-context";
import useOTPStyles from "./otp-stylesheet";
import { SignUpParams } from "@/lib/types/auth";

const OTP_LENGTH = 6;

export default function Otp() {
  const [otpValue, setOtpValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hiddenInputRef = useRef<TextInput>(null);
  const authStyles = useAuthStyles();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const {
    email,
    firstName,
    lastName,
    password,
    confirmPassword,
    purpose,
  }: SignUpParams = useLocalSearchParams();

  const { verifyOTP, OTP_signup } = useAuthContext();
  const background = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");

  const isTablet = width >= 768;

  // horizontal padding from parent scroll content (authStyles) + card internal padding
  const hPad = isTablet ? 48 : 24;
  const cardPadding = 24;
  const gapSize = isTablet ? 16 : 10;

  // compute available width for the OTP inputs and ensure they never exceed a max value
  const availableWidth = width - 2 * hPad - 2 * cardPadding;
  const maxDigit = isTablet ? 64 : 56;
  const calculatedSize = Math.floor(
    (availableWidth - gapSize * (OTP_LENGTH - 1)) / OTP_LENGTH,
  );
  const digitSize = Math.max(40, Math.min(maxDigit, calculatedSize));
  const digitFontSize = Math.floor(digitSize * 0.43);

  // digits array derived from the single string value
  const digits = Array.from(
    { length: OTP_LENGTH },
    (_, i) => otpValue[i] ?? "",
  );

  const otpStyles = useOTPStyles(isTablet, textColor);

  useEffect(() => {
    const t = setTimeout(() => hiddenInputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleResend = async () => {
    if (!canResend) return;

    if (email) {
      try {
        if (purpose === "signup") {
          await OTP_signup(email);
          setResendTimer(60);
          setCanResend(false);
          Alert.alert("Success", "A new OTP has been sent to your email");
        }
      } catch {
        Alert.alert("Error", "Failed to resend OTP. Please try again.");
      }
    }
  };

  const handleChange = (value: string) => {
    // keep only digits, max OTP_LENGTH
    const sanitized = value.replace(/[^0-9]/g, "").slice(0, OTP_LENGTH);
    setOtpValue(sanitized);
  };

  const handleVerify = async () => {
    if (otpValue.length !== OTP_LENGTH) {
      Alert.alert("Error", "Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    try {
      // redirects to home on success
      const success = await verifyOTP(
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        otpValue,
      );

      if (!success) {
        Alert.alert(
          "Error",
          "OTP verification failed. Please check the code and try again.",
        );
        return;
      }

      router.replace("/(tabs)/home");
    } catch (error: unknown) {
      Alert.alert(
        "Verification Failed",
        error instanceof Error ? error.message : "An error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={[authStyles.container, { backgroundColor: background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={authStyles.inner}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={authStyles.scrollContent}
        >
          <View style={authStyles.header}>
            <View
              style={[
                authStyles.logoCircle,
                { backgroundColor: `${tintColor}18` },
              ]}
            >
              <Ionicons name="shield-checkmark" size={34} color={tintColor} />
            </View>
            <ThemedText type="title" style={authStyles.title}>
              Verify Email
            </ThemedText>
            <ThemedText style={authStyles.subtitle}>
              Enter the 6-digit code sent to{"\n"}
              <ThemedText style={{ fontWeight: "600", opacity: 1 }}>
                {email}
              </ThemedText>
            </ThemedText>
          </View>

          <Card>
            <View style={authStyles.cardContent}>
              {/* Single hidden input captures all keyboard input */}
              <TextInput
                ref={hiddenInputRef}
                value={otpValue}
                onChangeText={handleChange}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                editable={!loading}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{
                  position: "absolute",
                  width: 0,
                  height: 0,
                  opacity: 0,
                }}
                caretHidden
              />

              {/* Tappable digit boxes that focus the hidden input */}
              <Pressable
                onPress={() => hiddenInputRef.current?.focus()}
                style={otpStyles.otpContainer}
              >
                {digits.map((digit, index) => {
                  const isActive = isFocused && index === otpValue.length;
                  return (
                    <View
                      key={index}
                      style={[
                        otpStyles.digitInput,
                        {
                          width: digitSize,
                          height: digitSize,
                          borderColor: digit
                            ? tintColor
                            : isActive
                              ? `${tintColor}80`
                              : `${textColor}30`,
                          backgroundColor: digit
                            ? `${tintColor}10`
                            : "transparent",
                          marginHorizontal: gapSize / 2,
                          justifyContent: "center",
                          alignItems: "center",
                        },
                      ]}
                    >
                      <ThemedText
                        style={{
                          fontSize: digitFontSize,
                          fontWeight: "600",
                          color: textColor,
                          lineHeight: digitFontSize * 1.2,
                        }}
                      >
                        {digit}
                      </ThemedText>
                      {isActive && (
                        <View
                          style={{
                            position: "absolute",
                            width: 2,
                            height: digitFontSize,
                            backgroundColor: tintColor,
                          }}
                        />
                      )}
                    </View>
                  );
                })}
              </Pressable>

              <Button
                onPress={handleVerify}
                variant="primary"
                loading={loading}
                disabled={loading || otpValue.length !== OTP_LENGTH}
              >
                Verify & Continue
              </Button>

              <View style={otpStyles.resendContainer}>
                <ThemedText style={otpStyles.resendText}>
                  Didn't receive the code?
                </ThemedText>
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={!canResend || loading}
                >
                  <ThemedText
                    style={[
                      otpStyles.resendLink,
                      {
                        color: canResend ? tintColor : `${textColor}40`,
                      },
                    ]}
                  >
                    {canResend ? "Resend Code" : `Resend in ${resendTimer}s`}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          <View style={[authStyles.footer, { marginTop: 16 }]}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={otpStyles.backButton}
            >
              <Ionicons name="chevron-back" size={20} color={tintColor} />
              <ThemedText style={[authStyles.link, { color: tintColor }]}>
                Back
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
