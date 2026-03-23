import React, { useEffect, useState } from "react";
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
import SigninForm from "@/components/pages/auth/signin/signin-form";
import useAuthContext from "@/lib/context/auth-context";

export default function SignIn() {
  const { login } = useAuthContext();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const { email, password } = form;
      const success = await login(email, password);

      if (!success) {
        showToast({
          message: "Invalid email or password. Please try again.",
          type: "danger",
          closable: true,
        });
        setLoading(false);
        return;
      }

      router.replace("/(tabs)/(home)");
      setLoading(false);
    } catch (error) {
      console.error("Error during sign-in:", error);
      showToast({
        message: "An error occurred during sign-in. Please try again.",
        type: "danger",
        closable: true,
      });
      setLoading(false);
    }
  };

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
            <SigninForm
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleSubmit={handleSubmit}
              loading={loading}
              form={form}
              setForm={setForm}
            />
          </Animated.View>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
