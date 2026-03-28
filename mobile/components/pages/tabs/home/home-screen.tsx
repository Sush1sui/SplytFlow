import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button, Paragraph, XStack, YStack } from "tamagui";
import { useAuthState } from "@/lib/context/auth-context";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  clearAllLogs,
  deleteLogByIndex,
  hydrateLogs,
} from "@/lib/store/logSlice";
import { computeNetSale, computePercentChange } from "@/lib/utils/sale";
import { fetchSales, fetchSalesRange } from "@/lib/store/saleSlice";
import useToast from "@/lib/context/toast-context";
import LogCard from "./log-card";
import NoLogCard from "./no-log-card";
import HomeSaleCard from "./home-sale-card";
import QuickAddSale from "./quick-add-sale";

export default function HomeScreen() {
  const { user } = useAuthState();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const logs = useAppSelector((s) => s.log.list);
  const splits = useAppSelector((s) => s.split);
  const sales = useAppSelector((s) => s.sale);

  const [totalSales, setTotalSales] = useState(0);
  const [netSales, setNetSales] = useState(0);
  const [salesChangePercent, setSalesChangePercent] = useState(0);

  useEffect(() => {
    const today = sales.sales.today ?? 0;
    const yesterday = sales.sales.oneDayAgo ?? 0;

    const activeSplit = splits.splitGroups.find(
      (group) => group.id === splits.activeSplitGroupId,
    );

    const totalSplitPct = activeSplit
      ? activeSplit.splits.reduce((sum, split) => sum + split.value, 0)
      : 0;

    setTotalSales(today);
    setNetSales(computeNetSale(today, totalSplitPct));
    setSalesChangePercent(computePercentChange(today, yesterday));
  }, [sales.sales, splits.splitGroups, splits.activeSplitGroupId]);

  useEffect(() => {
    dispatch(hydrateLogs());

    if (user?.id) {
      dispatch(fetchSales(user.id));
      dispatch(fetchSalesRange({ userId: user.id, preset: "1d" }));
    }
  }, [dispatch, user?.id]);

  const handleClearAllLogs = async () => {
    await dispatch(clearAllLogs()).unwrap();
  };

  const handleDeleteLog = async (index: number) => {
    await dispatch(deleteLogByIndex(index)).unwrap();
  };

  return (
    <YStack style={{ flex: 1, backgroundColor: "#f4f6fb" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        decelerationRate="normal"
        alwaysBounceVertical
        overScrollMode="always"
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

        <QuickAddSale />

        <YStack style={{ marginTop: 24 }} gap="$2">
          <XStack
            style={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <Paragraph
              style={{ color: "#0f172a", fontSize: 20, fontWeight: "800" }}
            >
              Recent Logs
            </Paragraph>
            <Button
              chromeless
              unstyled
              onPress={handleClearAllLogs}
              disabled={logs.length === 0}
              pressStyle={{ opacity: 0.7, background: "transparent" }}
              style={{
                opacity: logs.length === 0 ? 0.45 : 1,
                backgroundColor: "transparent",
              }}
            >
              <Paragraph style={{ color: "#4f46e5", fontWeight: "600" }}>
                Clear All
              </Paragraph>
            </Button>
          </XStack>

          {logs.length === 0 ? (
            <NoLogCard />
          ) : (
            logs.map((log, index) => (
              <LogCard
                key={`${log.id}-${index}`}
                log={log}
                currency="$"
                onDelete={() => handleDeleteLog(index)}
              />
            ))
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
