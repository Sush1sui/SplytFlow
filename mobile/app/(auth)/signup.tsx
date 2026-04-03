import React, { useCallback, useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { YStack } from "tamagui";
import SignupForm from "@/components/pages/auth/signup/signup-form";
import AlertDialogModal from "@/components/shared/alert-dialog-modal";
import useAlertDialog from "@/components/shared/use-alert-dialog";
import { useAuthActions } from "@/lib/context/auth-context";
import useToast from "@/lib/context/toast-context";
import { router } from "expo-router";

export default function SignUp() {
  const { OTP_signup } = useAuthActions();
  const { showToast } = useToast();
  const { alertDialogProps, showOk } = useAlertDialog();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);
      const { firstName, lastName, email, password, confirmPassword } = form;
      const success = await OTP_signup(email);

      if (!success) {
        showToast({
          message: "Failed to send OTP. Please try again.",
          type: "danger",
          closable: true,
        });
        return;
      }

      showOk({
        title: "Check your email",
        message: "We sent your 6-digit code. Tap Continue to verify.",
        okText: "Continue",
        onOk: () => {
          router.push({
            pathname: "/(public)/otp",
            params: {
              email,
              firstName,
              lastName,
              password,
              confirmPassword,
              purpose: "signup",
            },
          });
        },
      });
    } catch (error) {
      console.error("Signup failed:", error);
    } finally {
      setLoading(false);
    }
  }, [OTP_signup, showToast, setLoading, router, form]);

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
          <Animated.View entering={FadeInDown.duration(380).delay(80)}>
            <SignupForm
              form={form}
              setForm={setForm}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              handleSubmit={handleSubmit}
              loading={loading}
            />
          </Animated.View>
        </YStack>
      </ScrollView>

      <AlertDialogModal {...alertDialogProps} />
    </KeyboardAvoidingView>
  );
}
