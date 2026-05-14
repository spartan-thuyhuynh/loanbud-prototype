import { useVersion } from "../../contexts/VersionContext";
import { cn } from "./utils";

interface VersionToggleProps {
  collapsed?: boolean;
}

export function VersionToggle({ collapsed = false }: VersionToggleProps) {
  const { version, setVersion } = useVersion();

  if (collapsed) {
    return (
      <div className="flex justify-center">
        <button
          onClick={() => setVersion(version === "v1" ? "v2" : "v1")}
          className="w-8 h-6 rounded text-[10px] font-bold bg-[#053f4f] text-white"
          title={`Switch to ${version === "v1" ? "V2" : "V1"}`}
        >
          {version === "v1" ? "V1" : "V2"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 px-3 py-1.5">
      <div className="flex rounded-md border border-white/20 overflow-hidden text-[11px] font-semibold">
        <button
          onClick={() => setVersion("v1")}
          className={cn(
            "px-3 py-1 transition-colors",
            version === "v1"
              ? "bg-[#053f4f] text-white"
              : "bg-transparent text-white/50 hover:text-white/80"
          )}
        >
          V1
        </button>
        <div className="w-px bg-white/20" />
        <button
          onClick={() => setVersion("v2")}
          className={cn(
            "px-3 py-1 transition-colors",
            version === "v2"
              ? "bg-[#053f4f] text-white"
              : "bg-transparent text-white/50 hover:text-white/80"
          )}
        >
          V2
        </button>
      </div>
      {version === "v2" && (
        <span className="text-[9px] font-bold text-[#4ade80] tracking-wider uppercase">
          Beta
        </span>
      )}
    </div>
  );
}
