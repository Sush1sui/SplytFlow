import React, { useEffect, useMemo, useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { Alert, Modal, Pressable, ScrollView } from "react-native";
import { Button, Paragraph, XStack, YStack } from "tamagui";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";
import { useAuthState } from "@/lib/context/auth-context";
import { ApiError, apiFetcher } from "@/lib/api";
import { getLocalTimeZone } from "@/lib/utils/sale";
import { SaleRow } from "@/types/sale.types";
import { useAppDispatch } from "@/lib/store/hooks";
import { deleteSale, fetchSales, updateSale } from "@/lib/store/saleSlice";
import SaleHistoryRow from "./sale-history-row";
import SaleRecordModal from "./sale-record-modal";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function SaleHistoryPage() {
  const router = useRouter();
  const { user } = useAuthState();
  const dispatch = useAppDispatch();
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [rows, setRows] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [pickerType, setPickerType] = useState<"month" | "year" | null>(null);
  const [editingSale, setEditingSale] = useState<SaleRow | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadHistory = React.useCallback(async () => {
    if (!user?.id) {
      setRows([]);
      return;
    }

    const startLocalDate = formatDateOnly(
      new Date(selectedYear, selectedMonth, 1),
    );
    const endLocalDate = formatDateOnly(
      new Date(selectedYear, selectedMonth + 1, 0),
    );
    const timeZone = getLocalTimeZone();

    setLoading(true);
    try {
      const query = new URLSearchParams({
        userId: user.id,
        startLocalDate,
        endLocalDate,
        timeZone,
      });

      const data = await apiFetcher<SaleRow[]>(
        `${API_BASE_URL}${API_ENDPOINTS.SALE.RANGE}?${query.toString()}`,
      );

      setRows(
        [...data].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setRows([]);
      } else {
        setRows([]);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, user?.id]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, index) => currentYear - index);
  }, []);

  const totalAmount = useMemo(
    () => rows.reduce((sum, row) => sum + row.amount, 0),
    [rows],
  );

  const monthLabel = MONTH_NAMES[selectedMonth];
  const yearLabel = String(selectedYear);

  const pickerOptions =
    pickerType === "month"
      ? MONTH_NAMES.map((month, index) => ({
          label: month,
          value: index,
        }))
      : availableYears.map((year) => ({
          label: String(year),
          value: year,
        }));

  const handleSelectOption = (value: number) => {
    if (pickerType === "month") {
      setSelectedMonth(value);
    } else if (pickerType === "year") {
      setSelectedYear(value);
    }

    setPickerType(null);
  };

  const handleOpenEditModal = (sale: SaleRow) => {
    setEditingSale(sale);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    if (mutating) return;
    setModalVisible(false);
    setEditingSale(null);
  };

  const handleSubmitEdit = async (amount: number) => {
    if (!user?.id || !editingSale) return;

    setMutating(true);
    try {
      await dispatch(
        updateSale({ id: editingSale.id, userId: user.id, amount }),
      ).unwrap();
      await Promise.all([
        loadHistory(),
        dispatch(fetchSales(user.id)).unwrap(),
      ]);
      setModalVisible(false);
      setEditingSale(null);
    } catch {
      Alert.alert("Could not update sale", "Please try again.");
    } finally {
      setMutating(false);
    }
  };

  const handleDeleteSale = (sale: SaleRow) => {
    if (!user?.id) return;

    Alert.alert("Delete sale record?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setMutating(true);
          try {
            await dispatch(
              deleteSale({ id: sale.id, userId: user.id, amount: sale.amount }),
            ).unwrap();
            await Promise.all([
              loadHistory(),
              dispatch(fetchSales(user.id)).unwrap(),
            ]);
          } catch {
            Alert.alert("Could not delete sale", "Please try again.");
          } finally {
            setMutating(false);
          }
        },
      },
    ]);
  };

  return (
    <YStack style={{ flex: 1, backgroundColor: "#f4f6fb" }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: 56,
          paddingBottom: 110,
        }}
      >
        <XStack style={{ alignItems: "center" }} gap="$3">
          <Button
            unstyled
            chromeless
            onPress={() => router.back()}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#e2e8f0",
              backgroundColor: "#f8fafc",
            }}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={18}
              color="#64748b"
            />
          </Button>

          <Paragraph
            style={{ color: "#0f172a", fontSize: 34, fontWeight: "800" }}
          >
            History
          </Paragraph>
        </XStack>

        <XStack style={{ marginTop: 20 }} gap="$2.5">
          <Button
            unstyled
            onPress={() => setPickerType("month")}
            style={{
              flex: 1,
              height: 52,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#e2e8f0",
              backgroundColor: "#ffffff",
              paddingHorizontal: 14,
              alignItems: "center",
              justifyContent: "space-between",
              flexDirection: "row",
            }}
          >
            <Paragraph
              style={{ color: "#0f172a", fontWeight: "700", fontSize: 16 }}
            >
              {monthLabel}
            </Paragraph>
            <MaterialCommunityIcons
              name="chevron-down"
              size={18}
              color="#64748b"
            />
          </Button>

          <Button
            unstyled
            onPress={() => setPickerType("year")}
            style={{
              width: 122,
              height: 52,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#e2e8f0",
              backgroundColor: "#ffffff",
              paddingHorizontal: 14,
              alignItems: "center",
              justifyContent: "space-between",
              flexDirection: "row",
            }}
          >
            <Paragraph
              style={{ color: "#0f172a", fontWeight: "700", fontSize: 16 }}
            >
              {yearLabel}
            </Paragraph>
            <MaterialCommunityIcons
              name="chevron-down"
              size={18}
              color="#64748b"
            />
          </Button>
        </XStack>

        <XStack
          style={{
            marginTop: 18,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Paragraph style={{ color: "#64748b", fontSize: 18 }}>
            {rows.length} Records
          </Paragraph>
          <Paragraph
            style={{ color: "#4f46e5", fontWeight: "700", fontSize: 18 }}
          >
            Total: ${totalAmount.toFixed(2)}
          </Paragraph>
        </XStack>

        <YStack style={{ marginTop: 12 }} gap="$3">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <YStack
                key={`loading-row-${index}`}
                style={{
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  backgroundColor: "#ffffff",
                  paddingVertical: 14,
                  paddingHorizontal: 14,
                }}
                gap="$2"
              >
                <YStack
                  style={{
                    width: 120,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: "#e7ecf5",
                  }}
                />
                <YStack
                  style={{
                    width: 170,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#edf2f9",
                  }}
                />
              </YStack>
            ))
          ) : rows.length === 0 ? (
            <Paragraph style={{ color: "#64748b", fontSize: 14 }}>
              No records for the selected month and year.
            </Paragraph>
          ) : (
            rows.map((sale) => (
              <SaleHistoryRow
                key={sale.id}
                sale={sale}
                onEdit={() => handleOpenEditModal(sale)}
                onDelete={() => handleDeleteSale(sale)}
                disabled={mutating}
              />
            ))
          )}
        </YStack>
      </ScrollView>

      <Modal
        transparent
        visible={pickerType !== null}
        animationType="fade"
        onRequestClose={() => setPickerType(null)}
      >
        <Pressable
          onPress={() => setPickerType(null)}
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
              {pickerOptions.map((option) => (
                <Button
                  key={`${pickerType}-${option.value}`}
                  unstyled
                  onPress={() => handleSelectOption(option.value)}
                  style={{
                    height: 48,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor:
                      (pickerType === "month" &&
                        option.value === selectedMonth) ||
                      (pickerType === "year" && option.value === selectedYear)
                        ? "#e0e7ff"
                        : "#ffffff",
                    borderBottomWidth:
                      option !== pickerOptions[pickerOptions.length - 1]
                        ? 1
                        : 0,
                    borderBottomColor: "#eef2f7",
                  }}
                >
                  <Paragraph
                    style={{
                      color:
                        (pickerType === "month" &&
                          option.value === selectedMonth) ||
                        (pickerType === "year" && option.value === selectedYear)
                          ? "#1d4ed8"
                          : "#0f172a",
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

      <SaleRecordModal
        visible={modalVisible}
        mode="edit"
        saleCreatedAt={editingSale?.createdAt ?? null}
        initialAmount={editingSale?.amount ?? null}
        onClose={handleCloseModal}
        onSubmit={handleSubmitEdit}
        pending={mutating}
      />
    </YStack>
  );
}

function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
