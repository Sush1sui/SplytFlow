import React from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Paragraph } from "tamagui";
import { getSplitIcon } from "@/constants/split-icons";

const SCREEN_HEIGHT = Dimensions.get("window").height;
// Give the scroll area up to ~50% of screen height so header + footer always stay visible
const SCROLL_MAX_HEIGHT = SCREEN_HEIGHT * 0.5;

type DraftSplit = {
  id?: string;
  name: string;
  value: string;
  deleted?: boolean;
};

type EditSplitsSheetProps = {
  groupName: string;
  visibleDraft: DraftSplit[];
  totalDeduction: number;
  saving: boolean;
  canSave: boolean;
  onClose?: () => void;
  onAddRow: () => void;
  onUpdateRow: (index: number, field: "name" | "value", text: string) => void;
  onDeleteRow: (index: number) => void;
  onSave: () => void;
};

export default function EditSplitsSheet({
  groupName,
  visibleDraft,
  totalDeduction,
  saving,
  canSave,
  onClose,
  onAddRow,
  onUpdateRow,
  onDeleteRow,
  onSave,
}: EditSplitsSheetProps) {
  return (
    <View
      style={{
        width: "100%",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        shadowColor: "#0f172a",
        shadowOpacity: 0.12,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: -8 },
        elevation: 14,
      }}
    >
      {/* ── Fixed header ─────────────────────────────────────────── */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 28,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: "#f1f5f9",
        }}
      >
        <View>
          <Paragraph
            style={{ color: "#0b1f44", fontWeight: "800", fontSize: 22 }}
          >
            Edit Splits
          </Paragraph>
          <Paragraph style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>
            {groupName}
          </Paragraph>
        </View>

        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.7}
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: "#eef1f6",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons name="close" size={20} color="#7b8699" />
        </TouchableOpacity>
      </View>

      {/* ── Scrollable rows — maxHeight keeps footer always visible ─ */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{ maxHeight: SCROLL_MAX_HEIGHT }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 4,
        }}
      >
        {visibleDraft.map((row, index) => {
          const iconInfo = getSplitIcon(row.name);
          return (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#f8fafc",
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#e8edf5",
                paddingVertical: 10,
                paddingHorizontal: 12,
                marginBottom: 10,
                gap: 10,
              }}
            >
              {/* Auto-detected icon */}
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  backgroundColor: iconInfo.iconBg,
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <MaterialCommunityIcons
                  name={iconInfo.icon}
                  size={17}
                  color={iconInfo.iconColor}
                />
              </View>

              {/* Name input */}
              <TextInput
                value={row.name}
                onChangeText={(t) => onUpdateRow(index, "name", t)}
                placeholder="Split name"
                placeholderTextColor="#94a3b8"
                style={{
                  flex: 1,
                  height: 38,
                  color: "#0f172a",
                  fontSize: 14,
                  fontWeight: "600",
                  padding: 0,
                }}
              />

              {/* Percent input */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#ffffff",
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#d1d8e3",
                  paddingHorizontal: 8,
                  height: 36,
                  minWidth: 66,
                  flexShrink: 0,
                  gap: 2,
                }}
              >
                <TextInput
                  value={row.value}
                  onChangeText={(t) => onUpdateRow(index, "value", t)}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor="#94a3b8"
                  style={{
                    flex: 1,
                    color: "#0f172a",
                    fontSize: 14,
                    fontWeight: "700",
                    textAlign: "right",
                    minWidth: 28,
                    padding: 0,
                  }}
                />
                <Paragraph
                  style={{ color: "#94a3b8", fontSize: 13, fontWeight: "600" }}
                >
                  %
                </Paragraph>
              </View>

              {/* Delete row */}
              <TouchableOpacity
                onPress={() => onDeleteRow(index)}
                activeOpacity={0.7}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: "#fee2e2",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <MaterialCommunityIcons name="close" size={15} color="#ef4444" />
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Add New Split */}
        <TouchableOpacity
          onPress={onAddRow}
          activeOpacity={0.75}
          style={{
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: "#c7d2fe",
            borderStyle: "dashed",
            paddingVertical: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f7ff",
            flexDirection: "row",
            gap: 6,
            marginBottom: 4,
          }}
        >
          <MaterialCommunityIcons
            name="plus-circle-outline"
            size={18}
            color="#6366f1"
          />
          <Paragraph
            style={{ color: "#6366f1", fontWeight: "700", fontSize: 14 }}
          >
            Add New Split
          </Paragraph>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Fixed footer ─────────────────────────────────────────── */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: Platform.OS === "ios" ? 36 : 28,
          borderTopWidth: 1,
          borderTopColor: "#f1f5f9",
          gap: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Paragraph
            style={{ color: "#64748b", fontWeight: "600", fontSize: 14 }}
          >
            Total Deduction:
          </Paragraph>
          <Paragraph
            style={{
              color: totalDeduction > 100 ? "#ef4444" : "#0f172a",
              fontWeight: "800",
              fontSize: 16,
            }}
          >
            {totalDeduction % 1 === 0
              ? totalDeduction
              : totalDeduction.toFixed(1)}
            %
          </Paragraph>
        </View>

        <TouchableOpacity
          onPress={onSave}
          disabled={!canSave || saving}
          activeOpacity={0.82}
          style={{
            height: 50,
            borderRadius: 14,
            backgroundColor: canSave && !saving ? "#4f46e5" : "#a5b4fc",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#4f46e5",
            shadowOpacity: canSave && !saving ? 0.3 : 0,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: canSave && !saving ? 6 : 0,
          }}
        >
          <Paragraph
            style={{ color: "#ffffff", fontWeight: "800", fontSize: 16 }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Paragraph>
        </TouchableOpacity>
      </View>
    </View>
  );
}
