import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface DialerContextValue {
  dialerOpen: boolean;
  dialerNumber: string;
  openDialer: (number?: string) => void;
  closeDialer: () => void;
}

const DialerContext = createContext<DialerContextValue | null>(null);

export function DialerProvider({ children }: { children: ReactNode }) {
  const [dialerOpen, setDialerOpen] = useState(false);
  const [dialerNumber, setDialerNumber] = useState("");

  const openDialer = (number?: string) => {
    setDialerNumber(number ?? "");
    setDialerOpen(true);
  };

  const closeDialer = () => {
    setDialerOpen(false);
  };

  return (
    <DialerContext.Provider value={{ dialerOpen, dialerNumber, openDialer, closeDialer }}>
      {children}
    </DialerContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDialer(): DialerContextValue {
  const ctx = useContext(DialerContext);
  if (!ctx) throw new Error("useDialer must be used within a DialerProvider");
  return ctx;
}
