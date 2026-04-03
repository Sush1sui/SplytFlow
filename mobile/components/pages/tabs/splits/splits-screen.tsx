import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Paragraph, XStack, YStack } from "tamagui";
import SplitGroupCard from "./split-group-card";
import NoSplitCard from "./no-split-card";
import LoadingSplitGroups from "./loading-split-groups";
import AddSplitGroupModal from "./add-split-group-modal";
import EditSplitsModal from "./edit-splits-modal";
import AlertDialogModal from "@/components/shared/alert-dialog-modal";
import useAlertDialog from "@/components/shared/use-alert-dialog";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  createSplitGroup,
  deleteSplitGroup,
  fetchSplitGroupsWithSplits,
  setActiveSplitGroup,
} from "@/lib/store/splitSlice";
import { useAuthState } from "@/lib/context/auth-context";
import useToast from "@/lib/context/toast-context";
import useTabResponsive from "../shared/use-tab-responsive";
import type { SplitRow } from "@/types/split.types";

export default function SplitsScreen() {
  const [addGroupVisible, setAddGroupVisible] = useState(false);
  const [editSplitsGroupId, setEditSplitsGroupId] = useState<string | null>(
    null,
  );

  const dispatch = useAppDispatch();
  const { user, loading: UserLoading } = useAuthState();
  const { showToast } = useToast();
  const { alertDialogProps, showConfirm } = useAlertDialog();
  const { font, space } = useTabResponsive();
  const { splitGroups, activeSplitGroupId, status, createGroupPending } =
    useAppSelector((state) => state.split);

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

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleSetActive = useCallback(
    (id: string) => {
      dispatch(setActiveSplitGroup(id));
    },
    [dispatch],
  );

  const handleDelete = useCallback(
    (id: string) => {
      const group = splitGroups.find((g) => g.id === id);
      showConfirm({
        title: "Delete split group?",
        message: `Are you sure you want to delete "${group?.name ?? "this group"}"? This cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
        confirmTone: "danger",
        onConfirm: async () => {
          if (!user?.id) return;

          try {
            await dispatch(deleteSplitGroup({ id, userId: user.id })).unwrap();
          } catch {
            showToast({
              message: "Could not delete split group. Please try again.",
              type: "danger",
            });
          }
        },
      });
    },
    [dispatch, showConfirm, showToast, splitGroups, user?.id],
  );

  const handleEditSplits = useCallback((id: string) => {
    setEditSplitsGroupId(id);
  }, []);

  // Derive the group being edited for the modal
  const editingGroup = useMemo(
    () => splitGroups.find((g) => g.id === editSplitsGroupId) ?? null,
    [splitGroups, editSplitsGroupId],
  );

  // ─── Loading state ────────────────────────────────────────────────────────

  if (UserLoading || status === "loading") {
    return (
      <YStack
        style={{ flex: 1, backgroundColor: "#f4f6fb", marginTop: space(16) }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          decelerationRate="normal"
          alwaysBounceVertical
          overScrollMode="always"
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
        showsVerticalScrollIndicator={false}
        decelerationRate="normal"
        alwaysBounceVertical
        overScrollMode="always"
        contentContainerStyle={{
          flexGrow: 1,
          padding: 20,
          paddingTop: 56,
          paddingBottom: 110,
        }}
      >
        {/* Page header */}
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

          <Pressable onPress={() => setAddGroupVisible(true)}>
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
          </Pressable>
        </XStack>

        {splitGroups.length === 0 ? (
          <NoSplitCard onPress={() => setAddGroupVisible(true)} />
        ) : (
          <YStack style={{ marginTop: space(16) }} gap="$3">
            {groupsWithTotals.map((group) => (
              <SplitGroupCard
                key={group.id}
                id={group.id}
                title={group.name}
                totalPercent={group.totalPercent}
                active={group.id === activeSplitGroupId}
                splits={group.splits}
                onSetActive={handleSetActive}
                onDelete={handleDelete}
                onEditSplits={handleEditSplits}
              />
            ))}
          </YStack>
        )}
      </ScrollView>

      {/* Add Group Modal */}
      <AddSplitGroupModal
        visible={addGroupVisible}
        pending={createGroupPending}
        onClose={() => setAddGroupVisible(false)}
        onSubmit={async (groupName) => {
          if (!user?.id) return;
          const result = await dispatch(
            createSplitGroup({ userId: user.id, name: groupName }),
          );
          if (createSplitGroup.fulfilled.match(result)) {
            setAddGroupVisible(false);
          }
        }}
      />

      {/* Edit Splits Modal */}
      <EditSplitsModal
        visible={editSplitsGroupId !== null}
        groupId={editSplitsGroupId}
        groupName={editingGroup?.name ?? ""}
        userId={user?.id ?? ""}
        splits={(editingGroup?.splits ?? []) as SplitRow[]}
        onClose={() => setEditSplitsGroupId(null)}
      />

      <AlertDialogModal {...alertDialogProps} />
    </YStack>
  );
}
