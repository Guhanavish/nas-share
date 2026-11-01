import { useState, useCallback, useRef, type ReactNode } from "react";
import { AnimatedToast } from "./AnimatedToast";
import { ToastContext } from "./useToast";

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
