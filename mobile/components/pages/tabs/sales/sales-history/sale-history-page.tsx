import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView } from "react-native";
import { Paragraph, YStack } from "tamagui";
import { useAuthState } from "@/lib/context/auth-context";
import useToast from "@/lib/context/toast-context";
import { apiFetcher } from "@/lib/api";
import { formatDateOnly, getLocalTimeZone } from "@/lib/utils/sale";
import { SaleRow } from "@/types/sale.types";
import { useAppDispatch } from "@/lib/store/hooks";
import { deleteSale, fetchSales, updateSale } from "@/lib/store/saleSlice";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";
import {
  currencySymbol as getCurrencySymbol,
  isSupportedCurrency,
} from "@/constants/currency";
import { MONTH_NAMES } from "@/constants/sales";
import HistoryHeader from "./history-header";
import DatePickerRow from "./date-picker-row";
import StatsRow from "./stats-row";
import LoadingRows from "./loading-rows";
import PickerModal from "./picker-modal";
import AlertDialogModal from "@/components/shared/alert-dialog-modal";
import useAlertDialog from "@/components/shared/use-alert-dialog";
import SaleHistoryRow from "../sale-history-row";
import SaleRecordModal from "../sale-record-modal";
import useCurrencySettings from "@/lib/context/currency-context";

export default function SaleHistoryPage() {
  const { user } = useAuthState();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { alertDialogProps, showConfirm } = useAlertDialog();
  const { activeCurrency, currencySymbol, convertInputToStored } =
    useCurrencySettings();
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [rows, setRows] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [pickerType, setPickerType] = useState<"month" | "year" | null>(null);
  const [editingSale, setEditingSale] = useState<SaleRow | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const historyRequestRef = useRef(0);

  const loadHistory = React.useCallback(async () => {
    const requestId = ++historyRequestRef.current;

    if (!user?.id) {
      if (requestId === historyRequestRef.current) {
        setRows([]);
      }
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

      if (requestId !== historyRequestRef.current) {
        return;
      }

      setRows(
        [...data].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    } catch {
      if (requestId !== historyRequestRef.current) {
        return;
      }

      setRows([]);
    } finally {
      if (requestId === historyRequestRef.current) {
        setLoading(false);
      }
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

  const pickerOptions =
    pickerType === "month"
      ? MONTH_NAMES.map((month, index) => ({ label: month, value: index }))
      : availableYears.map((year) => ({ label: String(year), value: year }));

  const selectedValue = pickerType === "month" ? selectedMonth : selectedYear;

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
      const inputCurrency = isSupportedCurrency(editingSale.currencyCode)
        ? editingSale.currencyCode
        : activeCurrency;
      const storedAmount = await convertInputToStored(amount, inputCurrency);

      await dispatch(
        updateSale({
          id: editingSale.id,
          userId: user.id,
          amount: storedAmount,
          originalAmount: amount,
          currencyCode: inputCurrency,
        }),
      ).unwrap();
      await Promise.all([
        loadHistory(),
        dispatch(fetchSales(user.id)).unwrap(),
      ]);
      setModalVisible(false);
      setEditingSale(null);
    } catch {
      showToast({
        message: "Could not update sale. Please try again.",
        type: "danger",
      });
    } finally {
      setMutating(false);
    }
  };

  const handleDeleteSale = (sale: SaleRow) => {
    showConfirm({
      title: "Delete sale record?",
      message: "This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      confirmTone: "danger",
      onConfirm: async () => {
        if (!user?.id) return;

        setMutating(true);
        try {
          await dispatch(
            deleteSale({
              id: sale.id,
              userId: user.id,
              amount: sale.amount,
            }),
          ).unwrap();
          await Promise.all([
            loadHistory(),
            dispatch(fetchSales(user.id)).unwrap(),
          ]);
        } catch {
          showToast({
            message: "Could not delete sale. Please try again.",
            type: "danger",
          });
        } finally {
          setMutating(false);
        }
      },
    });
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
        <HistoryHeader />

        <DatePickerRow
          monthLabel={MONTH_NAMES[selectedMonth]}
          yearLabel={String(selectedYear)}
          onSelectMonth={() => setPickerType("month")}
          onSelectYear={() => setPickerType("year")}
        />

        <StatsRow recordCount={rows.length} totalAmount={totalAmount} />

        <YStack style={{ marginTop: 12 }} gap="$3">
          {loading ? (
            <LoadingRows />
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

      <PickerModal
        visible={pickerType !== null}
        options={pickerOptions}
        selectedValue={selectedValue}
        onSelect={handleSelectOption}
        onClose={() => setPickerType(null)}
      />

      <SaleRecordModal
        visible={modalVisible}
        mode="edit"
        saleCreatedAt={editingSale?.createdAt ?? null}
        initialAmount={
          editingSale
            ? (editingSale.originalAmount ?? editingSale.amount)
            : null
        }
        onClose={handleCloseModal}
        onSubmit={handleSubmitEdit}
        pending={mutating}
        currency={
          editingSale?.currencyCode
            ? getCurrencySymbol(editingSale.currencyCode)
            : currencySymbol
        }
      />

      <AlertDialogModal {...alertDialogProps} />
    </YStack>
  );
}
