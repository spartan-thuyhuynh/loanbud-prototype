import type { ReactNode } from "react";
import { useVersion } from "../../contexts/VersionContext";

/** Renders v1 or v2 element depending on the active version context. */
export function VersionRoute({ v1, v2 }: { v1: ReactNode; v2: ReactNode }) {
  const { version } = useVersion();
  return <>{version === "v2" ? v2 : v1}</>;
}
