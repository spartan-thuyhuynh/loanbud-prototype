import { createContext, useContext, useState } from "react";

type Version = "v1" | "v2";

interface VersionContextValue {
  version: Version;
  setVersion: (v: Version) => void;
}

const VersionContext = createContext<VersionContextValue | null>(null);

const STORAGE_KEY = "app-version";

export function VersionProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersionState] = useState<Version>(
    () => (localStorage.getItem(STORAGE_KEY) as Version | null) ?? "v1"
  );

  const setVersion = (v: Version) => {
    localStorage.setItem(STORAGE_KEY, v);
    setVersionState(v);
  };

  return (
    <VersionContext.Provider value={{ version, setVersion }}>
      {children}
    </VersionContext.Provider>
  );
}

export function useVersion(): VersionContextValue {
  const ctx = useContext(VersionContext);
  if (!ctx) throw new Error("useVersion must be used inside <VersionProvider>");
  return ctx;
}
