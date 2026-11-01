import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import { AnimatedToast } from "./AnimatedToast";

interface ToastContextType {
  toast: (message: string, type?: "copied" | "info") => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [currentType, setCurrentType] = useState<"copied" | "info">("copied");
  const timeoutRef = useRef<number | null>(null);

  const toast = useCallback((message: string, type: "copied" | "info" = "copied") => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    setCurrentMessage(message);
    setCurrentType(type);

    timeoutRef.current = window.setTimeout(() => {
      setCurrentMessage(null);
      timeoutRef.current = null;
    }, 1800);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <AnimatedToast message={currentMessage} type={currentType} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
