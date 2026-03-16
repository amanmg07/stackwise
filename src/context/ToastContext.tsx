import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/Toast";

interface ToastState {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastState>({ showToast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast message={message} visible={visible} onHide={() => setVisible(false)} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
