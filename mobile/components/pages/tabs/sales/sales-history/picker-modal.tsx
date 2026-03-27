import React from "react";
import { Modal, Pressable, View } from "react-native";
import { Button, Paragraph, YStack } from "tamagui";

type PickerOption = {
  label: string;
  value: number;
};

type PickerModalProps = {
  visible: boolean;
  options: PickerOption[];
  selectedValue: number;
  onSelect: (value: number) => void;
  onClose: () => void;
};

export default function PickerModal({
  visible,
  options,
  selectedValue,
  onSelect,
  onClose,
}: PickerModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(2,6,23,0.35)",
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
              overflow: "hidden",
            }}
          >
            {options.map((option, index) => (
              <Button
                key={option.value}
                unstyled
                onPress={() => onSelect(option.value)}
                style={{
                  height: 48,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor:
                    option.value === selectedValue ? "#e0e7ff" : "#ffffff",
                  borderBottomWidth: index !== options.length - 1 ? 1 : 0,
                  borderBottomColor: "#eef2f7",
                }}
              >
                <Paragraph
                  style={{
                    color: option.value === selectedValue ? "#1d4ed8" : "#0f172a",
                    fontWeight: "600",
                    fontSize: 16,
                  }}
                >
                  {option.label}
                </Paragraph>
              </Button>
            ))}
          </YStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
