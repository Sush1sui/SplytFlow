import React, { useMemo } from "react";
import { Modal, Pressable } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Button, Paragraph, XStack, YStack } from "tamagui";
import {
  buildLocalTime,
  splitLocalTime,
} from "@/lib/utils/sale-record-modal-helper";
import {
  closeButtonStyle,
  overlayStyle,
  pickerCardStyle,
  pickerTitleStyle,
  timeValueBoxStyle,
} from "@/components/pages/tabs/sales/sale-record-modal.styles";

type SaleTimePickerModalProps = {
  visible: boolean;
  localTime: string;
  onClose: () => void;
  onChange: (nextLocalTime: string) => void;
};

function SaleTimePickerModal({
  visible,
  localTime,
  onClose,
  onChange,
}: SaleTimePickerModalProps) {
  const { hour, minute } = useMemo(
    () => splitLocalTime(localTime),
    [localTime],
  );

  const updateHour = (delta: number) => {
    const nextHour = (hour + delta + 24) % 24;
    onChange(buildLocalTime(nextHour, minute));
  };

  const updateMinute = (delta: number) => {
    const nextMinute = (minute + delta + 60) % 60;
    onChange(buildLocalTime(hour, nextMinute));
  };

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
          ...overlayStyle,
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <Pressable onPress={(event) => event.stopPropagation()}>
          <YStack style={pickerCardStyle} gap="$3">
            <XStack
              style={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <Paragraph style={pickerTitleStyle}>Select Time</Paragraph>
              <Button
                unstyled
                chromeless
                onPress={onClose}
                style={closeButtonStyle}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={18}
                  color="#7b8699"
                />
              </Button>
            </XStack>

            <XStack
              style={{ justifyContent: "center", alignItems: "center" }}
              gap="$2.5"
            >
              <YStack gap="$1.5" style={{ alignItems: "center" }}>
                <Button
                  unstyled
                  onPress={() => updateHour(1)}
                  style={closeButtonStyle}
                >
                  <MaterialCommunityIcons
                    name="chevron-up"
                    size={18}
                    color="#475569"
                  />
                </Button>
                <YStack style={timeValueBoxStyle}>
                  <Paragraph
                    style={{
                      color: "#0f172a",
                      fontWeight: "700",
                      fontSize: 18,
                    }}
                  >
                    {String(hour).padStart(2, "0")}
                  </Paragraph>
                </YStack>
                <Button
                  unstyled
                  onPress={() => updateHour(-1)}
                  style={closeButtonStyle}
                >
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={18}
                    color="#475569"
                  />
                </Button>
              </YStack>

              <Paragraph
                style={{ color: "#64748b", fontWeight: "700", fontSize: 20 }}
              >
                :
              </Paragraph>

              <YStack gap="$1.5" style={{ alignItems: "center" }}>
                <Button
                  unstyled
                  onPress={() => updateMinute(1)}
                  style={closeButtonStyle}
                >
                  <MaterialCommunityIcons
                    name="chevron-up"
                    size={18}
                    color="#475569"
                  />
                </Button>
                <YStack style={timeValueBoxStyle}>
                  <Paragraph
                    style={{
                      color: "#0f172a",
                      fontWeight: "700",
                      fontSize: 18,
                    }}
                  >
                    {String(minute).padStart(2, "0")}
                  </Paragraph>
                </YStack>
                <Button
                  unstyled
                  onPress={() => updateMinute(-1)}
                  style={closeButtonStyle}
                >
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={18}
                    color="#475569"
                  />
                </Button>
              </YStack>
            </XStack>

            <XStack style={{ justifyContent: "flex-end" }} gap="$2">
              <Button
                unstyled
                chromeless
                onPress={onClose}
                style={{ paddingHorizontal: 8, height: 34 }}
              >
                <Paragraph style={{ color: "#64748b", fontWeight: "600" }}>
                  Done
                </Paragraph>
              </Button>
            </XStack>
          </YStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default React.memo(SaleTimePickerModal);
