import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button, Input, Paragraph, XStack, YStack } from "tamagui";
import { useAuthState } from "@/lib/context/auth-context";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { hydrateLogs } from "@/lib/store/logSlice";
import { computeNetSale, computePercentChange } from "@/lib/utils/sale";
import LogCard from "./log-card";
import NoLogCard from "./no-log-card";
import HomeSaleCard from "./home-sale-card";

export default function HomeScreen() {
  const { user } = useAuthState();
  const dispatch = useAppDispatch();
  const logs = useAppSelector((s) => s.log.list);
  const splits = useAppSelector((s) => s.split);
  const sales = useAppSelector((s) => s.sale);

  const [totalSales, setTotalSales] = useState(0);
  const [netSales, setNetSales] = useState(0);
  const [salesChangePercent, setSalesChangePercent] = useState(0);

  useEffect(() => {
    const today = sales.sales.today ?? 0;
    const prev30 = sales.sales.oneMonthAgo ?? 0;

    const activeSplit = splits.splitGroups.find(
      (group) => group.id === splits.activeSplitGroupId,
    );

    const totalSplitPct = activeSplit
      ? activeSplit.splits.reduce((sum, split) => sum + split.value, 0)
      : 0;

    setTotalSales(today);
    setNetSales(computeNetSale(today, totalSplitPct));
    setSalesChangePercent(computePercentChange(today, prev30));
  }, [sales.sales, splits.splitGroups, splits.activeSplitGroupId]);

  useEffect(() => {
    dispatch(hydrateLogs());
  }, [dispatch]);

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
            <Paragraph style={{ color: "#6b7280", fontSize: 14 }}>
              Good morning{user && ","}
            </Paragraph>
            {user && (
              <Paragraph
                style={{ color: "#0f172a", fontSize: 22, fontWeight: "800" }}
              >
                {user.firstName}
              </Paragraph>
            )}
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

        <HomeSaleCard
          totalSales={totalSales}
          netSales={netSales}
          salesChangePercent={salesChangePercent}
          currency="$"
        />

        <YStack style={{ marginTop: 24 }} gap="$2">
          <Paragraph
            style={{ color: "#0f172a", fontSize: 20, fontWeight: "800" }}
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
              style={{ color: "#0f172a", fontSize: 20, fontWeight: "800" }}
            >
              Recent Logs
            </Paragraph>
            <Paragraph style={{ color: "#4f46e5", fontWeight: "600" }}>
              View All
            </Paragraph>
          </XStack>

          {logs.length === 0 ? (
            <NoLogCard />
          ) : (
            logs.map((log) => <LogCard key={log.id} log={log} currency="$" />)
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
