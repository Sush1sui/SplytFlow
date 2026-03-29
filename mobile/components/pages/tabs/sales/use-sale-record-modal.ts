import { useCallback, useEffect, useMemo, useState } from "react";
import { Dimensions } from "react-native";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { formatDateOnly } from "@/lib/utils/calendar-helper";
import {
  buildCalendarDays,
  canGoToNextMonth,
  getCalendarCursor,
  getInitialLocalDate,
  getInitialLocalTime,
  getTodayParts,
  isValidLocalTime,
  parseAmount,
  toAmountInput,
} from "@/lib/utils/sale-record-modal-helper";
import { submitButtonBaseStyle } from "@/components/pages/tabs/sales/sale-record-modal.styles";

const SCREEN_HEIGHT = Dimensions.get("window").height;

type UseSaleRecordModalOptions = {
  visible: boolean;
  mode: "add" | "edit";
  saleCreatedAt?: string | null;
  initialAmount?: number | null;
  pending: boolean;
  onSubmit?: (amount: number, localDate?: string, localTime?: string) => void;
};

export function useSaleRecordModal({
  visible,
  mode,
  saleCreatedAt,
  initialAmount,
  pending,
  onSubmit,
}: UseSaleRecordModalOptions) {
  const today = useMemo(getTodayParts, []);

  // ─── Form state ───────────────────────────────────────────────────────────
  const [amountInput, setAmountInput] = useState("");
  const [selectedLocalDate, setSelectedLocalDate] = useState("");
  const [selectedLocalTime, setSelectedLocalTime] = useState("");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());

  // ─── Animation ────────────────────────────────────────────────────────────
  const [modalMounted, setModalMounted] = useState(false);
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setModalMounted(true);
      opacity.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) });
      translateY.value = withSpring(0, { damping: 24, stiffness: 220, mass: 0.9 });
    } else {
      opacity.value = withTiming(0, { duration: 220, easing: Easing.in(Easing.cubic) });
      translateY.value = withTiming(
        SCREEN_HEIGHT,
        { duration: 240, easing: Easing.in(Easing.cubic) },
        (finished) => { if (finished) runOnJS(setModalMounted)(false); },
      );
    }
  }, [visible]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // ─── Field initialization effects ─────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;
    setAmountInput(toAmountInput(initialAmount));
  }, [visible, initialAmount]);

  useEffect(() => {
    if (!visible) return;
    const initialLocalDate = getInitialLocalDate(saleCreatedAt);
    const initialLocalTime = getInitialLocalTime(saleCreatedAt);
    const { year, month } = getCalendarCursor(initialLocalDate);
    setSelectedLocalDate(initialLocalDate);
    setSelectedLocalTime(initialLocalTime);
    setCalendarYear(year);
    setCalendarMonth(month);
  }, [visible, saleCreatedAt]);

  // ─── Derived values ───────────────────────────────────────────────────────
  const dateLabel = selectedLocalDate || "yyyy-mm-dd";
  const calendarDays = useMemo(
    () => buildCalendarDays(calendarYear, calendarMonth),
    [calendarMonth, calendarYear],
  );
  const canGoNextMonth = useMemo(
    () => canGoToNextMonth(calendarYear, calendarMonth, today),
    [calendarMonth, calendarYear, today],
  );
  const parsedAmount = useMemo(() => parseAmount(amountInput), [amountInput]);
  const canSubmitTime = mode === "edit" || isValidLocalTime(selectedLocalTime);
  const canSubmit = Number.isFinite(parsedAmount) && parsedAmount > 0 && !pending && canSubmitTime;

  const submitButtonStyle = {
    ...submitButtonBaseStyle,
    backgroundColor: canSubmit ? "#4f46e5" : "#a5b4fc",
    borderColor: canSubmit ? "#4f46e5" : "#a5b4fc",
  };

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    const dateToSubmit =
      mode === "add"
        ? selectedLocalDate
        : saleCreatedAt ? getInitialLocalDate(saleCreatedAt) : undefined;
    const timeToSubmit =
      mode === "add"
        ? selectedLocalTime
        : saleCreatedAt ? getInitialLocalTime(saleCreatedAt) : undefined;
    onSubmit?.(parsedAmount, dateToSubmit, timeToSubmit);
  }, [canSubmit, mode, onSubmit, parsedAmount, selectedLocalDate, selectedLocalTime, saleCreatedAt]);

  const handleOpenPicker = useCallback(() => {
    if (mode !== "add" || pending) return;
    const { year, month } = getCalendarCursor(selectedLocalDate);
    setCalendarYear(year);
    setCalendarMonth(month);
    setPickerVisible(true);
  }, [mode, pending, selectedLocalDate]);

  const handleOpenTimePicker = useCallback(() => {
    if (mode !== "add" || pending) return;
    setTimePickerVisible(true);
  }, [mode, pending]);

  const handlePickDay = useCallback((day: number) => {
    setSelectedLocalDate(formatDateOnly(calendarYear, calendarMonth, day));
    setPickerVisible(false);
  }, [calendarMonth, calendarYear]);

  const handlePreviousMonth = useCallback(() => {
    setCalendarMonth((prev) => {
      if (prev === 0) { setCalendarYear((y) => y - 1); return 11; }
      return prev - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    if (!canGoNextMonth) return;
    setCalendarMonth((prev) => {
      if (prev === 11) { setCalendarYear((y) => y + 1); return 0; }
      return prev + 1;
    });
  }, [canGoNextMonth]);

  return {
    // animation
    modalMounted,
    overlayAnimatedStyle,
    sheetAnimatedStyle,
    // field state
    amountInput,
    setAmountInput,
    selectedLocalDate,
    selectedLocalTime,
    setSelectedLocalTime,
    dateLabel,
    // calendar
    calendarYear,
    calendarMonth,
    calendarDays,
    canGoNextMonth,
    today,
    // pickers
    pickerVisible,
    setPickerVisible,
    timePickerVisible,
    setTimePickerVisible,
    // submit
    canSubmit,
    submitButtonStyle,
    // handlers
    handleSubmit,
    handleOpenPicker,
    handleOpenTimePicker,
    handlePickDay,
    handlePreviousMonth,
    handleNextMonth,
  };
}
