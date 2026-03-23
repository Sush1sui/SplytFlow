import React from "react";
import { ScrollView } from "react-native";
import { Button, Input, Paragraph, XStack, YStack } from "tamagui";
import SalesDonutChart from "./sales-donut-chart";
import useTabResponsive from "../shared/use-tab-responsive";

const ranges = ["Today", "Yesterday", "Last Week", "Last Month"];

export default function SalesScreen() {
  const { isNarrow, font, space } = useTabResponsive();

  return (
    <YStack style={{ flex: 1, backgroundColor: "#f4f6fb" }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: 56,
          paddingBottom: 110,
        }}
      >
        <Paragraph
          style={{
            color: "#0f172a",
            fontSize: font(28, 22, 30),
            lineHeight: font(34, 28, 36),
            fontWeight: "800",
          }}
        >
          Analytics
        </Paragraph>

        <XStack style={{ marginTop: space(16), flexWrap: "wrap" }} gap="$2">
          {ranges.map((range, index) => (
            <YStack
              key={range}
              style={{
                borderRadius: 999,
                borderWidth: 1,
                borderColor: index === 0 ? "#4f46e5" : "#d9e0ec",
                backgroundColor: index === 0 ? "#4f46e5" : "#ffffff",
                paddingHorizontal: space(14),
                paddingVertical: space(8),
              }}
            >
              <Paragraph
                style={{
                  color: index === 0 ? "#ffffff" : "#334155",
                  fontSize: font(14, 12, 15),
                  fontWeight: index === 0 ? "700" : "500",
                }}
              >
                {range}
              </Paragraph>
            </YStack>
          ))}
        </XStack>

        <XStack
          style={{
            marginTop: space(16),
            flexDirection: isNarrow ? "column" : "row",
          }}
          gap="$3"
        >
          <YStack
            style={{
              flex: 1,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#e2e8f0",
              backgroundColor: "#ffffff",
              padding: space(14),
            }}
          >
            <Paragraph style={{ color: "#64748b", fontSize: font(13, 12, 14) }}>
              Gross Sales
            </Paragraph>
            <Paragraph
              style={{
                color: "#0f172a",
                fontSize: font(26, 20, 28),
                fontWeight: "800",
              }}
            >
              $1,240.50
            </Paragraph>
            <Paragraph
              style={{
                color: "#16a34a",
                fontWeight: "600",
                fontSize: font(13, 12, 14),
              }}
            >
              +8% vs prior
            </Paragraph>
          </YStack>

          <YStack
            style={{
              flex: 1,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#e2e8f0",
              backgroundColor: "#ffffff",
              padding: space(14),
            }}
          >
            <Paragraph style={{ color: "#64748b", fontSize: font(13, 12, 14) }}>
              Net Profit
            </Paragraph>
            <Paragraph
              style={{
                color: "#4f46e5",
                fontSize: font(26, 20, 28),
                fontWeight: "800",
              }}
            >
              $682.27
            </Paragraph>
            <Paragraph
              style={{
                color: "#16a34a",
                fontWeight: "600",
                fontSize: font(13, 12, 14),
              }}
            >
              +12% vs prior
            </Paragraph>
          </YStack>
        </XStack>

        <YStack
          style={{
            marginTop: space(18),
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#e2e8f0",
            backgroundColor: "#ffffff",
            padding: space(16),
          }}
          gap="$3"
        >
          <Paragraph
            style={{
              color: "#0f172a",
              fontWeight: "800",
              fontSize: font(18, 15, 20),
              textAlign: "center",
            }}
          >
            Net Sales & Splits Distribution
          </Paragraph>
          <SalesDonutChart />
        </YStack>

        <YStack style={{ marginTop: space(22) }} gap="$2">
          <Paragraph
            style={{
              color: "#0f172a",
              fontWeight: "800",
              fontSize: font(20, 16, 22),
            }}
          >
            Add Custom Sale Record
          </Paragraph>

          <YStack
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#e2e8f0",
              backgroundColor: "#ffffff",
              padding: space(16),
            }}
            gap="$2"
          >
            <YStack gap="$1">
              <Paragraph
                style={{
                  color: "#64748b",
                  fontWeight: "600",
                  fontSize: font(14, 12, 15),
                }}
              >
                Date
              </Paragraph>
              <Input
                editable={false}
                value="   mm/dd/yyyy"
                style={{
                  height: 46,
                  borderRadius: 10,
                  borderColor: "#d6dce8",
                  backgroundColor: "#f8fafc",
                }}
              />
            </YStack>

            <YStack gap="$1">
              <Paragraph
                style={{
                  color: "#64748b",
                  fontWeight: "600",
                  fontSize: font(14, 12, 15),
                }}
              >
                Total Amount
              </Paragraph>
              <Input
                editable={false}
                value="$ 0.00"
                style={{
                  height: 46,
                  borderRadius: 10,
                  borderColor: "#d6dce8",
                  backgroundColor: "#f8fafc",
                  color: "#94a3b8",
                }}
              />
            </YStack>

            <Button
              style={{
                marginTop: 4,
                borderRadius: 10,
                height: 48,
                backgroundColor: "#4f46e5",
                borderColor: "#4f46e5",
              }}
            >
              <Paragraph
                style={{
                  color: "#ffffff",
                  fontWeight: "800",
                  fontSize: font(16, 14, 17),
                }}
              >
                Save Record
              </Paragraph>
            </Button>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
