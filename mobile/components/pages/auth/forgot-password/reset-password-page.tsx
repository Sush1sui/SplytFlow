import React, { useCallback, useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { YStack } from "tamagui";
import { PasswordResetRouteParams } from "@/types/auth.types";
import { useAuthActions } from "@/lib/context/auth-context";
import useToast from "@/lib/context/toast-context";
import ResetPasswordForm from "./reset-password-form";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function getParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default function ResetPasswordPage() {
  const { resetPassword } = useAuthActions();
  const { showToast } = useToast();
  const params = useLocalSearchParams<PasswordResetRouteParams>();

  const email = useMemo(() => getParam(params.email).trim(), [params.email]);
  const resetToken = useMemo(
    () => getParam(params.resetToken).trim(),
    [params.resetToken],
  );

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (resetToken) {
      return;
    }

    showToast({
      message: "Your reset session has expired. Request a new code.",
      type: "warning",
      closable: true,
    });

    router.replace("/(auth)/forgot-password");
  }, [resetToken, showToast]);

  const handleSubmit = useCallback(async () => {
    if (!resetToken) {
      showToast({
        message: "Your reset session has expired. Request a new code.",
        type: "warning",
        closable: true,
      });
      return;
    }

    if (!newPassword || !confirmPassword) {
      showToast({
        message: "Please enter and confirm your new password.",
        type: "warning",
        closable: true,
      });
      return;
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      showToast({
        message:
          "Use at least 8 characters with uppercase, lowercase, number, and special character.",
        type: "warning",
        closable: true,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast({
        message: "Passwords do not match.",
        type: "warning",
        closable: true,
      });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(resetToken, newPassword, confirmPassword);

      showToast({
        message: "Password reset successful. You can now sign in.",
        type: "success",
        closable: true,
      });

      router.replace("/(auth)/signin");
    } catch (error: any) {
      const message =
        error?.body?.error ??
        error?.message ??
        "Could not reset password. Please try again.";

      showToast({
        message,
        type: "danger",
        closable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [confirmPassword, newPassword, resetPassword, resetToken, showToast]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        <YStack
          style={{
            flex: 1,
            backgroundColor: "#f4f6fb",
            paddingHorizontal: 20,
            paddingVertical: 28,
            paddingTop: isKeyboardVisible ? 48 : 28,
            justifyContent: isKeyboardVisible ? "flex-start" : "center",
          }}
        >
          <Animated.View entering={FadeInDown.duration(360).delay(80)}>
            <ResetPasswordForm
              email={email}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showNewPassword={showNewPassword}
              setShowNewPassword={setShowNewPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              loading={loading}
              onSubmit={handleSubmit}
            />
          </Animated.View>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
