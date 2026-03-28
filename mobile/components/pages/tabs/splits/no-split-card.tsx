import React from "react";
import { YStack, Paragraph } from "tamagui";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useTabResponsive from "../shared/use-tab-responsive";

export default function NoSplitCard() {
  const { font } = useTabResponsive();

  return (
    <YStack
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingBottom: 48,
      }}
    >
      {/* Outer glow shell */}
      <YStack
        style={{
          borderRadius: 28,
          borderWidth: 1,
          borderColor: "#e0e7ff",
          backgroundColor: "#ffffff",
          padding: 36,
          alignItems: "center",
          width: "100%",
          maxWidth: 320,
          shadowColor: "#4f46e5",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 24,
          elevation: 6,
        }}
      >
        {/* Icon backdrop circle */}
        <YStack
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "#eef2ff",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          {/* Inner accent ring */}
          <YStack
            style={{
              position: "absolute",
              width: 80,
              height: 80,
              borderRadius: 40,
              borderWidth: 1.5,
              borderColor: "#c7d2fe",
            }}
          />
          <MaterialCommunityIcons
            name="chart-donut-variant"
            size={38}
            color="#4f46e5"
          />
        </YStack>

        <Paragraph
          style={{
            color: "#0f172a",
            fontSize: font(18, 16, 20),
            fontWeight: "800",
            textAlign: "center",
            letterSpacing: -0.3,
          }}
        >
          No Split Groups Yet
        </Paragraph>

        <Paragraph
          style={{
            color: "#94a3b8",
            fontSize: font(13, 12, 14),
            textAlign: "center",
            marginTop: 8,
            lineHeight: 20,
            maxWidth: 220,
          }}
        >
          Tap the{" "}
          <Paragraph
            style={{
              color: "#4f46e5",
              fontWeight: "700",
              fontSize: font(13, 12, 14),
            }}
          >
            +
          </Paragraph>{" "}
          button above to create your first split group and start tracking.
        </Paragraph>

        {/* Bottom decorative pill */}
        <YStack
          style={{
            marginTop: 24,
            backgroundColor: "#eef2ff",
            borderRadius: 20,
            paddingVertical: 8,
            paddingHorizontal: 20,
          }}
        >
          <Paragraph
            style={{
              color: "#4f46e5",
              fontSize: font(12, 11, 13),
              fontWeight: "700",
              letterSpacing: 0.3,
            }}
          >
            CREATE SPLIT GROUP
          </Paragraph>
        </YStack>
      </YStack>
    </YStack>
  );
}
