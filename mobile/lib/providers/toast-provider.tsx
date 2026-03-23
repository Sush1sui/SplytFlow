import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated } from "react-native";
import { Image, Paragraph, XStack, YStack, Button } from "tamagui";
import {
  ToastContext,
  ShowToastOptions,
  ToastType,
} from "@/lib/context/toast-context";
import madPng from "@/assets/icons/mad.png";

type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
  closable: boolean;
  durationMs: number;
};

const TOAST_DEFAULT_MS = 5000;
const DANGER_POP_MS = 3000;
const MAX_VISIBLE_TOASTS = 3;

const toastThemeByType: Record<
  ToastType,
  { bg: string; border: string; text: string }
> = {
  success: { bg: "#eafbf1", border: "#b8edcd", text: "#146c43" },
  danger: { bg: "#fff1f2", border: "#fecdd3", text: "#9f1239" },
  warning: { bg: "#fff7ed", border: "#fed7aa", text: "#9a3412" },
  info: { bg: "#eef2ff", border: "#c7d2fe", text: "#3730a3" },
};

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [showDangerPop, setShowDangerPop] = useState(false);
  const toastsRef = useRef<ToastItem[]>([]);

  const dangerOpacity = useRef(new Animated.Value(0)).current;

  const opacityMapRef = useRef<Record<string, Animated.Value>>({});
  const timerMapRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dangerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearToastTimer = useCallback((id: string) => {
    const timer = timerMapRef.current[id];
    if (timer) {
      clearTimeout(timer);
      delete timerMapRef.current[id];
    }
  }, []);

  const clearDangerTimer = useCallback(() => {
    if (dangerTimerRef.current) {
      clearTimeout(dangerTimerRef.current);
      dangerTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    toastsRef.current = toasts;
  }, [toasts]);

  const hideToast = useCallback(
    (id?: string) => {
      const targetId = id ?? toastsRef.current[0]?.id;
      if (!targetId) return;

      clearToastTimer(targetId);
      const opacity = opacityMapRef.current[targetId];

      if (!opacity) {
        setToasts((prev) => prev.filter((toast) => toast.id !== targetId));
        return;
      }

      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== targetId));
        delete opacityMapRef.current[targetId];
      });
    },
    [clearToastTimer],
  );

  const showToast = useCallback(
    ({
      message,
      type = "info",
      durationMs = TOAST_DEFAULT_MS,
      closable = true,
    }: ShowToastOptions) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const opacity = new Animated.Value(0);
      opacityMapRef.current[id] = opacity;

      setToasts((prev) => [
        ...prev,
        { id, message, type, closable, durationMs },
      ]);

      if (type === "danger") {
        setShowDangerPop(true);
        dangerOpacity.setValue(0);
        Animated.timing(dangerOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();

        clearDangerTimer();
        dangerTimerRef.current = setTimeout(() => {
          Animated.timing(dangerOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setShowDangerPop(false);
          });
        }, DANGER_POP_MS);
      }
    },
    [clearDangerTimer, dangerOpacity],
  );

  const visibleToasts = useMemo(
    () => toasts.slice(0, MAX_VISIBLE_TOASTS),
    [toasts],
  );

  useEffect(() => {
    visibleToasts.forEach((toast) => {
      const hasTimer = Boolean(timerMapRef.current[toast.id]);
      const opacity = opacityMapRef.current[toast.id];

      if (!opacity || hasTimer) return;

      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }).start();

      timerMapRef.current[toast.id] = setTimeout(() => {
        hideToast(toast.id);
      }, toast.durationMs);
    });
  }, [visibleToasts, hideToast]);

  useEffect(() => {
    return () => {
      Object.keys(timerMapRef.current).forEach((id) => clearToastTimer(id));
      clearDangerTimer();
    };
  }, [clearToastTimer, clearDangerTimer]);

  const contextValue = useMemo(
    () => ({ showToast, hideToast }),
    [showToast, hideToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {showDangerPop ? (
        <Animated.View
          style={{
            position: "absolute",
            top: 350,
            right: 0,
            zIndex: 999,
            opacity: dangerOpacity,
            transform: [{ rotate: "-30deg" }, { scale: 2 }],
          }}
          pointerEvents="none"
        >
          <Image
            source={madPng}
            width={150}
            height={150}
            resizeMode="contain"
            alt="Danger mood"
          />
        </Animated.View>
      ) : null}

      {visibleToasts.length > 0 ? (
        <YStack
          pointerEvents="box-none"
          style={{
            position: "absolute",
            top: 56,
            left: 16,
            right: 16,
            zIndex: 998,
          }}
          gap="$2"
        >
          {visibleToasts.map((toast) => {
            const theme = toastThemeByType[toast.type];
            const opacity =
              opacityMapRef.current[toast.id] ?? new Animated.Value(1);

            return (
              <Animated.View key={toast.id} style={{ opacity }}>
                <YStack
                  style={{
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.border,
                    backgroundColor: theme.bg,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                  }}
                >
                  <XStack
                    style={{
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                    gap="$2"
                  >
                    <Paragraph
                      style={{
                        color: theme.text,
                        fontWeight: "600",
                        flexShrink: 1,
                        paddingRight: toast.closable ? 8 : 0,
                      }}
                    >
                      {toast.message}
                    </Paragraph>

                    {toast.closable ? (
                      <Button
                        chromeless
                        onPress={() => hideToast(toast.id)}
                        style={{
                          color: theme.text,
                          paddingHorizontal: 2,
                          height: 24,
                        }}
                      >
                        x
                      </Button>
                    ) : null}
                  </XStack>
                </YStack>
              </Animated.View>
            );
          })}
        </YStack>
      ) : null}
    </ToastContext.Provider>
  );
}
