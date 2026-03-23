import React from "react";
import { ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button, Input, Paragraph, XStack, YStack } from "tamagui";

const logs = [
  { title: "Morning Sales Batch", time: "10:42 AM", amount: "+$150.00" },
  { title: "Early Walk-ins", time: "09:15 AM", amount: "+$85.50" },
  { title: "Afternoon Rush", time: "01:30 PM", amount: "+$225.00" },
];

export default function HomeScreen() {
  return (
    <YStack style={{ flex: 1, backgroundColor: "#f4f6fb" }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: 56,
          paddingBottom: 110,
        }}
      >
        <XStack
          style={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <YStack>
            <Paragraph style={{ color: "#6b7280", fontSize: 16 }}>
              Good morning,
            </Paragraph>
            <Paragraph
              style={{ color: "#0f172a", fontSize: 26, fontWeight: "800" }}
            >
              John Doe
            </Paragraph>
          </YStack>

          <YStack
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: "#dde4ff",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="account-outline"
              size={22}
              color="#4f46e5"
            />
          </YStack>
        </XStack>

        <YStack
          style={{
            marginTop: 20,
            borderRadius: 20,
            padding: 18,
            backgroundColor: "#4f46e5",
            shadowColor: "#4f46e5",
            shadowOpacity: 0.28,
            shadowOffset: { width: 0, height: 8 },
            shadowRadius: 18,
            elevation: 8,
          }}
          gap="$3"
        >
          <Paragraph
            style={{ color: "#dbe4ff", fontWeight: "700", fontSize: 16 }}
          >
            Total Sales Today
          </Paragraph>
          <Paragraph
            style={{
              color: "#ffffff",
              fontSize: 36,
              lineHeight: 40,
              fontWeight: "900",
            }}
          >
            $1,240.50
          </Paragraph>
          <YStack
            style={{ height: 1, backgroundColor: "rgba(255,255,255,0.25)" }}
          />

          <XStack
            style={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <YStack>
              <Paragraph style={{ color: "#dbe4ff", fontSize: 13 }}>
                Net Sales (After Splits)
              </Paragraph>
              <Paragraph
                style={{ color: "#ffffff", fontSize: 24, fontWeight: "800" }}
              >
                $682.27
              </Paragraph>
            </YStack>

            <XStack
              style={{
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: "#5d55ee",
                alignItems: "center",
              }}
              gap="$1"
            >
              <MaterialCommunityIcons
                name="arrow-top-right"
                size={14}
                color="#9ff3c7"
              />
              <Paragraph
                style={{ color: "#9ff3c7", fontWeight: "700", fontSize: 12 }}
              >
                +15% (30d)
              </Paragraph>
            </XStack>
          </XStack>
        </YStack>

        <YStack style={{ marginTop: 24 }} gap="$2">
          <Paragraph
            style={{ color: "#0f172a", fontSize: 22, fontWeight: "800" }}
          >
            Quick Add Sale
          </Paragraph>
          <XStack gap="$2">
            <Input
              value="$ 0.00"
              editable={false}
              style={{
                flex: 1,
                backgroundColor: "#ffffff",
                borderColor: "#d6dce8",
                borderRadius: 10,
                height: 48,
                color: "#94a3b8",
                fontWeight: "700",
              }}
            />
            <Button
              style={{
                backgroundColor: "#111827",
                borderColor: "#111827",
                borderRadius: 10,
                height: 48,
                width: 96,
              }}
            >
              <XStack style={{ alignItems: "center" }} gap="$1.5">
                <MaterialCommunityIcons name="plus" size={16} color="#ffffff" />
                <Paragraph style={{ color: "#ffffff", fontWeight: "800" }}>
                  Add
                </Paragraph>
              </XStack>
            </Button>
          </XStack>
        </YStack>

        <YStack style={{ marginTop: 24 }} gap="$2">
          <XStack
            style={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <Paragraph
              style={{ color: "#0f172a", fontSize: 22, fontWeight: "800" }}
            >
              Recent Logs
            </Paragraph>
            <Paragraph style={{ color: "#4f46e5", fontWeight: "600" }}>
              View All
            </Paragraph>
          </XStack>

          {logs.map((log) => (
            <XStack
              key={log.title}
              style={{
                alignItems: "center",
                borderRadius: 14,
                backgroundColor: "#ffffff",
                borderColor: "#e5eaf3",
                borderWidth: 1,
                padding: 12,
              }}
              gap="$3"
            >
              <YStack
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: "#d8f7e4",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="arrow-top-right"
                  size={18}
                  color="#22c55e"
                />
              </YStack>

              <YStack style={{ flex: 1 }}>
                <Paragraph
                  style={{ color: "#0f172a", fontWeight: "700", fontSize: 16 }}
                >
                  {log.title}
                </Paragraph>
                <Paragraph style={{ color: "#6b7280", fontSize: 13 }}>
                  {log.time}
                </Paragraph>
              </YStack>

              <Paragraph
                style={{ color: "#0f172a", fontWeight: "800", fontSize: 22 }}
              >
                {log.amount}
              </Paragraph>
            </XStack>
          ))}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
