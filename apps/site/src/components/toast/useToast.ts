import { createContext, useContext } from "react";

export interface ToastContextType {
  toast: (message: string, type?: "copied" | "info") => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
