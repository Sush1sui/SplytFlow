import { useCallback, useMemo, useState } from "react";
import type { AlertDialogModalProps, ConfirmTone } from "./alert-dialog-modal";

type SharedDialogOptions = {
  title: string;
  message: string;
  disableBackdropClose?: boolean;
};

type ConfirmDialogOptions = SharedDialogOptions & {
  confirmText?: string;
  cancelText?: string;
  confirmTone?: ConfirmTone;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
};

type OkDialogOptions = SharedDialogOptions & {
  okText?: string;
  confirmTone?: ConfirmTone;
  onOk?: () => void | Promise<void>;
  onClose?: () => void | Promise<void>;
};

type UseAlertDialogResult = {
  alertDialogProps: AlertDialogModalProps;
  showConfirm: (options: ConfirmDialogOptions) => void;
  showOk: (options: OkDialogOptions) => void;
  closeDialog: () => void;
};

type InternalDialogState = Omit<AlertDialogModalProps, "visible">;

export default function useAlertDialog(): UseAlertDialogResult {
  const [dialogState, setDialogState] = useState<InternalDialogState | null>(
    null,
  );

  const closeDialog = useCallback(() => {
    setDialogState(null);
  }, []);

  const showConfirm = useCallback(
    ({
      title,
      message,
      confirmText,
      cancelText,
      confirmTone,
      disableBackdropClose,
      onConfirm,
      onCancel,
    }: ConfirmDialogOptions) => {
      setDialogState({
        mode: "confirm",
        title,
        message,
        confirmText,
        cancelText,
        confirmTone,
        disableBackdropClose,
        onConfirm: () => {
          closeDialog();
          void onConfirm?.();
        },
        onCancel: () => {
          closeDialog();
          void onCancel?.();
        },
        onClose: () => {
          closeDialog();
          void onCancel?.();
        },
      });
    },
    [closeDialog],
  );

  const showOk = useCallback(
    ({
      title,
      message,
      okText,
      confirmTone,
      disableBackdropClose,
      onOk,
      onClose,
    }: OkDialogOptions) => {
      setDialogState({
        mode: "ok",
        title,
        message,
        okText,
        confirmTone,
        disableBackdropClose,
        onOk: () => {
          closeDialog();
          void onOk?.();
        },
        onClose: () => {
          closeDialog();
          void onClose?.();
        },
      });
    },
    [closeDialog],
  );

  const alertDialogProps = useMemo<AlertDialogModalProps>(
    () => ({
      visible: dialogState !== null,
      title: dialogState?.title ?? "",
      message: dialogState?.message ?? "",
      mode: dialogState?.mode ?? "confirm",
      okText: dialogState?.okText,
      confirmText: dialogState?.confirmText,
      cancelText: dialogState?.cancelText,
      confirmTone: dialogState?.confirmTone,
      pending: dialogState?.pending,
      disableBackdropClose: dialogState?.disableBackdropClose,
      onClose: dialogState?.onClose ?? closeDialog,
      onOk: dialogState?.onOk,
      onConfirm: dialogState?.onConfirm,
      onCancel: dialogState?.onCancel,
    }),
    [closeDialog, dialogState],
  );

  return {
    alertDialogProps,
    showConfirm,
    showOk,
    closeDialog,
  };
}
