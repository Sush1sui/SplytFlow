import React from "react";
import { Modal, Pressable } from "react-native";
import { Button, Paragraph, XStack, YStack } from "tamagui";

export type AlertDialogMode = "ok" | "confirm";
export type ConfirmTone = "default" | "danger";

export type AlertDialogModalProps = {
  visible: boolean;
  title: string;
  message: string;
  mode?: AlertDialogMode;
  okText?: string;
  confirmText?: string;
  cancelText?: string;
  confirmTone?: ConfirmTone;
  pending?: boolean;
  disableBackdropClose?: boolean;
  onClose?: () => void;
  onOk?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export default function AlertDialogModal({
  visible,
  title,
  message,
  mode = "confirm",
  okText = "OK",
  confirmText = "Yes",
  cancelText = "No",
  confirmTone = "default",
  pending = false,
  disableBackdropClose = false,
  onClose,
  onOk,
  onConfirm,
  onCancel,
}: AlertDialogModalProps) {
  const handleClose = () => {
    if (pending || disableBackdropClose) return;
    if (mode === "confirm") {
      (onCancel ?? onClose)?.();
      return;
    }
    onClose?.();
  };

  const handlePrimaryAction = () => {
    if (pending) return;
    if (mode === "confirm") {
      onConfirm?.();
      return;
    }
    (onOk ?? onClose)?.();
  };

  const handleCancelAction = () => {
    if (pending) return;
    (onCancel ?? onClose)?.();
  };

  const primaryButtonStyle =
    confirmTone === "danger"
      ? {
          backgroundColor: "#dc2626",
          borderColor: "#dc2626",
        }
      : {
          backgroundColor: "#4f46e5",
          borderColor: "#4f46e5",
        };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        onPress={handleClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(2, 6, 23, 0.4)",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <Pressable onPress={(event) => event.stopPropagation()}>
          <YStack
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#d9e2ef",
              backgroundColor: "#ffffff",
              padding: 18,
            }}
            gap="$3"
          >
            <YStack gap="$2">
              <Paragraph
                style={{
                  color: "#0f172a",
                  fontWeight: "800",
                  fontSize: 18,
                }}
              >
                {title}
              </Paragraph>

              <Paragraph
                style={{
                  color: "#475569",
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                {message}
              </Paragraph>
            </YStack>

            {mode === "confirm" ? (
              <XStack style={{ justifyContent: "flex-end" }} gap="$2">
                <Button
                  onPress={handleCancelAction}
                  disabled={pending}
                  style={{
                    minWidth: 86,
                    height: 42,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#cbd5e1",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <Paragraph
                    style={{
                      color: "#334155",
                      fontWeight: "700",
                      fontSize: 14,
                    }}
                  >
                    {cancelText}
                  </Paragraph>
                </Button>

                <Button
                  onPress={handlePrimaryAction}
                  disabled={pending}
                  style={{
                    minWidth: 86,
                    height: 42,
                    borderRadius: 10,
                    ...primaryButtonStyle,
                  }}
                >
                  <Paragraph
                    style={{
                      color: "#ffffff",
                      fontWeight: "700",
                      fontSize: 14,
                    }}
                  >
                    {confirmText}
                  </Paragraph>
                </Button>
              </XStack>
            ) : (
              <XStack style={{ justifyContent: "flex-end" }}>
                <Button
                  onPress={handlePrimaryAction}
                  disabled={pending}
                  style={{
                    minWidth: 86,
                    height: 42,
                    borderRadius: 10,
                    ...primaryButtonStyle,
                  }}
                >
                  <Paragraph
                    style={{
                      color: "#ffffff",
                      fontWeight: "700",
                      fontSize: 14,
                    }}
                  >
                    {okText}
                  </Paragraph>
                </Button>
              </XStack>
            )}
          </YStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
