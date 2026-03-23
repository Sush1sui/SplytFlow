import { useAuthActions } from "@/lib/context/auth-context";
import useToast from "@/lib/context/toast-context";
import { SignUpParams } from "@/types/auth.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput as RNTextInput,
} from "react-native";
import { Button, H2, Paragraph, Spinner, XStack, YStack } from "tamagui";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

const formatCountdown = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

export default function Otp() {
  const { verifyOTP, OTP_signup } = useAuthActions();
  const { showToast } = useToast();
  const {
    email,
    firstName,
    lastName,
    password,
    confirmPassword,
    purpose,
  }: SignUpParams = useLocalSearchParams();
  const [otpCode, setOtpCode] = useState("");
  const [isOtpFocused, setIsOtpFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(
    RESEND_COOLDOWN_SECONDS,
  );
  const hiddenInputRef = useRef<RNTextInput | null>(null);

  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setInterval(() => {
      setResendCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

  const focusInput = () => {
    hiddenInputRef.current?.focus();
  };

  const handleOtpChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setOtpCode(digits);
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || isResending) return;

    try {
      setIsResending(true);

      if (purpose === "signup") {
        const success = await OTP_signup(email);

        if (!success) {
          showToast({
            message: "Failed to resend OTP. Please try again.",
            type: "danger",
            closable: true,
          });
          return;
        }

        showToast({
          message: "A new OTP was sent to your email.",
          type: "success",
          closable: true,
        });

        setResendCountdown(RESEND_COOLDOWN_SECONDS);
      }
    } catch {
      showToast({
        message: "Could not resend OTP right now.",
        type: "danger",
        closable: true,
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (otpCode.length !== OTP_LENGTH) {
        showToast({
          message: "Please enter the full 6-digit code.",
          type: "warning",
          closable: true,
        });
        return;
      }

      setIsSubmitting(true);

      if (purpose === "signup") {
        const success = await verifyOTP(
          firstName,
          lastName,
          email,
          password,
          confirmPassword,
          otpCode,
        );

        if (!success) {
          showToast({
            message: "Invalid OTP. Please try again.",
            type: "danger",
            closable: true,
          });
          return;
        }

        router.replace("/(tabs)/home");
      }
    } catch (error) {
      showToast({
        message: "An error occurred while verifying the OTP.",
        type: "danger",
        closable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <YStack
          style={{
            flex: 1,
            backgroundColor: "#f4f6fb",
            paddingHorizontal: 20,
            paddingTop: 96,
            paddingBottom: 28,
          }}
        >
          <YStack
            style={{ width: "100%", maxWidth: 360, alignSelf: "center" }}
            gap="$4"
          >
            <YStack style={{ alignItems: "center" }} gap="$3">
              <YStack
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: "#dde4ff",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="email-outline"
                  size={30}
                  color="#4f46e5"
                />
              </YStack>

              <YStack style={{ alignItems: "center" }} gap="$2">
                <H2 style={{ fontSize: 42, lineHeight: 46 }}>Verify Email</H2>
                <Paragraph
                  style={{
                    color: "#5f6775",
                    textAlign: "center",
                    maxWidth: 280,
                    lineHeight: 24,
                    fontSize: 16,
                  }}
                >
                  We&apos;ve sent a 6-digit code to your email. Enter it below
                  to verify.
                </Paragraph>
              </YStack>
            </YStack>

            <XStack style={{ justifyContent: "space-between" }} gap="$2">
              <RNTextInput
                ref={hiddenInputRef}
                value={otpCode}
                onChangeText={handleOtpChange}
                onFocus={() => setIsOtpFocused(true)}
                onBlur={() => setIsOtpFocused(false)}
                maxLength={OTP_LENGTH}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                importantForAutofill="yes"
                style={{
                  position: "absolute",
                  width: 1,
                  height: 1,
                  opacity: 0,
                }}
              />

              {Array.from({ length: OTP_LENGTH }).map((_, index) => {
                const char = otpCode[index] ?? "";
                const activeCaretIndex = Math.min(
                  otpCode.length,
                  OTP_LENGTH - 1,
                );
                const isActive = isOtpFocused && activeCaretIndex === index;

                return (
                  <Pressable key={index} onPress={focusInput}>
                    <YStack
                      style={{
                        width: 50,
                        height: 58,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: isActive ? "#4f46e5" : "#cfd6e4",
                        backgroundColor: "#f4f6fb",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Paragraph
                        style={{
                          color: char ? "#1f2937" : "#94a3b8",
                          fontSize: 20,
                          fontWeight: "700",
                        }}
                      >
                        {char || "0"}
                      </Paragraph>
                    </YStack>
                  </Pressable>
                );
              })}
            </XStack>

            <YStack gap="$3" style={{ paddingTop: 10 }}>
              <Button
                size="$4"
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={{
                  backgroundColor: "#4f46e5",
                  borderColor: "#4f46e5",
                  borderRadius: 10,
                  height: 50,
                  justifyContent: "center",
                }}
              >
                <Paragraph style={{ color: "#ffffff", fontWeight: "700" }}>
                  {isSubmitting ? <Spinner color="#ffffff" /> : "Verify OTP"}
                </Paragraph>
              </Button>

              <Button
                size="$4"
                onPress={handleResend}
                disabled={isResending || resendCountdown > 0}
                style={{
                  borderColor: "#d3d9e5",
                  backgroundColor: "#f4f6fb",
                  borderRadius: 10,
                  height: 50,
                  justifyContent: "center",
                }}
              >
                <Paragraph style={{ color: "#111827", fontWeight: "600" }}>
                  {isResending ? (
                    <Spinner />
                  ) : resendCountdown > 0 ? (
                    `Resend in ${formatCountdown(resendCountdown)}`
                  ) : (
                    "Resend Code"
                  )}
                </Paragraph>
              </Button>
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
