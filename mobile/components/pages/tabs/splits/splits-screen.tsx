import React, { useEffect, useMemo } from "react";
import { ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Paragraph, XStack, YStack } from "tamagui";
import SplitGroupCard from "./split-group-card";
import NoSplitCard from "./no-split-card";
import LoadingSplitGroups from "./loading-split-groups";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchSplitGroupsWithSplits } from "@/lib/store/splitSlice";
import { useAuthState } from "@/lib/context/auth-context";
import useTabResponsive from "../shared/use-tab-responsive";

export default function SplitsScreen() {
  const dispatch = useAppDispatch();
  const { user, loading: UserLoading } = useAuthState();
  const { font, space } = useTabResponsive();
  const { splitGroups, activeSplitGroupId, status } = useAppSelector(
    (state) => state.split,
  );

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchSplitGroupsWithSplits(user.id));
    }
  }, [dispatch, user?.id]);

  const groupsWithTotals = useMemo(
    () =>
      splitGroups.map((group) => ({
        ...group,
        totalPercent: group.splits.reduce((sum, split) => sum + split.value, 0),
      })),
    [splitGroups],
  );

  if (UserLoading || status === "loading") {
    return (
      <YStack
        style={{ flex: 1, backgroundColor: "#f4f6fb", marginTop: space(16) }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 20,
            paddingTop: 56,
            paddingBottom: 110,
          }}
        >
          <YStack
            style={{
              width: 150,
              height: 30,
              borderRadius: 15,
              backgroundColor: "#e7ecf5",
              marginBottom: 20,
            }}
          />
          <YStack gap="$3">
            <LoadingSplitGroups />
          </YStack>
        </ScrollView>
      </YStack>
    );
  }

  return (
    <YStack style={{ flex: 1, backgroundColor: "#f4f6fb" }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 20,
          paddingTop: 56,
          paddingBottom: 110,
        }}
      >
        <XStack
          style={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Paragraph
            style={{
              color: "#0f172a",
              fontSize: font(28, 22, 30),
              lineHeight: font(34, 28, 36),
              fontWeight: "800",
            }}
          >
            Config Splits
          </Paragraph>

          <YStack
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: "#dde4ff",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons name="plus" size={22} color="#4f46e5" />
          </YStack>
        </XStack>

        {splitGroups.length === 0 ? (
          <NoSplitCard />
        ) : (
          <YStack style={{ marginTop: space(16) }} gap="$3">
            {groupsWithTotals.map((group) => (
              <SplitGroupCard
                key={group.id}
                title={group.name}
                totalPercent={group.totalPercent}
                active={group.id === activeSplitGroupId}
                splits={group.splits}
              />
            ))}
          </YStack>
        )}
      </ScrollView>
    </YStack>
  );
}
