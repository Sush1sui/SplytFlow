import { useAuthActions } from "@/lib/context/auth-context";
import useToast from "@/lib/context/toast-context";
import { OtpRouteParams } from "@/types/auth.types";
import AlertDialogModal from "@/components/shared/alert-dialog-modal";
import useAlertDialog from "@/components/shared/use-alert-dialog";
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

const getParamValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
};

export default function Otp() {
  const { verifyOTP, OTP_signup, OTP_passwordReset, verifyPasswordResetOTP } =
    useAuthActions();
  const { showToast } = useToast();
  const { alertDialogProps, showOk } = useAlertDialog();
  const params = useLocalSearchParams<OtpRouteParams>();
  const email = getParamValue(params.email).trim().toLowerCase();
  const firstName = getParamValue(params.firstName);
  const lastName = getParamValue(params.lastName);
  const password = getParamValue(params.password);
  const confirmPassword = getParamValue(params.confirmPassword);
  const purpose =
    getParamValue(params.purpose) === "password-reset"
      ? "password-reset"
      : "signup";
  const isPasswordResetFlow = purpose === "password-reset";
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

    if (!email) {
      showToast({
        message: "Email is missing. Please start again.",
        type: "warning",
        closable: true,
      });
      return;
    }

    try {
      setIsResending(true);

      const success = isPasswordResetFlow
        ? await OTP_passwordReset(email)
        : await OTP_signup(email);

      if (!success) {
        showToast({
          message: "Failed to resend OTP. Please try again.",
          type: "danger",
          closable: true,
        });
        return;
      }

      showOk({
        title: "New code sent",
        message: "A new 6-digit code was sent to your email.",
        okText: "Got it",
      });

      setResendCountdown(RESEND_COOLDOWN_SECONDS);
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

      if (!email) {
        showToast({
          message: "Email is missing. Please start again.",
          type: "danger",
          closable: true,
        });
        return;
      }

      if (isPasswordResetFlow) {
        const resetToken = await verifyPasswordResetOTP(email, otpCode);

        router.replace({
          pathname: "/(auth)/change-password",
          params: {
            email,
            resetToken,
            purpose: "password-reset",
          },
        });

        return;
      }

      if (!firstName || !lastName || !password || !confirmPassword) {
        showToast({
          message: "Signup details are missing. Please sign up again.",
          type: "danger",
          closable: true,
        });
        return;
      }

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

        router.replace("/(tabs)/(home)");
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
                <H2 style={{ fontSize: 42, lineHeight: 46 }}>
                  {isPasswordResetFlow ? "Verify Code" : "Verify Email"}
                </H2>
                <Paragraph
                  style={{
                    color: "#5f6775",
                    textAlign: "center",
                    maxWidth: 280,
                    lineHeight: 24,
                    fontSize: 16,
                  }}
                >
                  {isPasswordResetFlow
                    ? "We sent a 6-digit code to your email. Enter it below to continue resetting your password."
                    : "We've sent a 6-digit code to your email. Enter it below to verify."}
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

      <AlertDialogModal {...alertDialogProps} />
    </KeyboardAvoidingView>
  );
}
