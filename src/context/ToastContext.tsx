import React, { createContext, useContext, useState, useCallback } from "react";
import Toast, { ToastVariant } from "../components/Toast";

interface ToastOptions {
  variant?: ToastVariant;
  duration?: number;
  /** Optional action button (e.g. 'Undo'). Tapping it dismisses the toast and fires onPress. */
  action?: { label: string; onPress: () => void };
}

interface ToastState {
  showToast: (message: string, opts?: ToastOptions) => void;
}

const ToastContext = createContext<ToastState>({ showToast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [variant, setVariant] = useState<ToastVariant>("success");
  const [duration, setDuration] = useState<number>(1200);
  const [action, setAction] = useState<ToastOptions["action"] | undefined>(undefined);

  const showToast = useCallback((msg: string, opts?: ToastOptions) => {
    setMessage(msg);
    setVariant(opts?.variant ?? "success");
    // Toasts with an action need longer to read + tap. Default to 4s
    // when an action is present so undo has time to land.
    setDuration(opts?.duration ?? (opts?.action ? 4000 : 1200));
    setAction(opts?.action);
    setVisible(true);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        message={message}
        visible={visible}
        onHide={() => setVisible(false)}
        variant={variant}
        duration={duration}
        action={action}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
