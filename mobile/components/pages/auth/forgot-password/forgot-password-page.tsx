import React, { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { YStack } from "tamagui";
import useToast from "@/lib/context/toast-context";
import useAlertDialog from "@/components/shared/use-alert-dialog";
import AlertDialogModal from "@/components/shared/alert-dialog-modal";
import { useAuthActions } from "@/lib/context/auth-context";
import { validateEmail } from "@/lib/utils/auth-validate";
import ForgotPasswordForm from "./forgot-password-form";

export default function ForgotPasswordPage() {
  const { OTP_passwordReset } = useAuthActions();
  const { showToast } = useToast();
  const { alertDialogProps, showOk } = useAlertDialog();

  const [email, setEmail] = useState("");
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

  const handleSubmit = useCallback(async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!validateEmail(normalizedEmail)) {
      showToast({
        message: "Please enter a valid email address.",
        type: "warning",
        closable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const success = await OTP_passwordReset(normalizedEmail);

      if (!success) {
        showToast({
          message: "Could not send reset code. Please try again.",
          type: "danger",
          closable: true,
        });
        return;
      }

      showOk({
        title: "Check your email",
        message: "We sent your 6-digit code. Continue to verify it.",
        okText: "Continue",
        onOk: () => {
          router.push({
            pathname: "/(public)/otp",
            params: {
              email: normalizedEmail,
              purpose: "password-reset",
            },
          });
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not send reset code right now.";

      showToast({
        message,
        type: "danger",
        closable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [OTP_passwordReset, email, showOk, showToast]);

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
            <ForgotPasswordForm
              email={email}
              setEmail={setEmail}
              loading={loading}
              onSubmit={handleSubmit}
            />
          </Animated.View>
        </YStack>
      </ScrollView>

      <AlertDialogModal {...alertDialogProps} />
    </KeyboardAvoidingView>
  );
}
