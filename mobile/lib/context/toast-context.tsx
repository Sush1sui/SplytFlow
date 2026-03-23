import { createContext, useContext } from "react";

export type ToastType = "success" | "danger" | "warning" | "info";

export interface ShowToastOptions {
  message: string;
  type?: ToastType;
  durationMs?: number;
  closable?: boolean;
}

export interface ToastContextValue {
  showToast: (options: ShowToastOptions) => void;
  hideToast: (id?: string) => void;
}

export const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
  hideToast: () => {},
});

const useToast = () => useContext(ToastContext);

export default useToast;
