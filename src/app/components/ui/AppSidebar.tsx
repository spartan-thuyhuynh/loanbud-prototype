import { useLocation, useNavigate } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CircleUser,
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import type { AppSidebarSection } from "../../types";

interface AppSidebarProps {
  sections: AppSidebarSection[];
  collapsed: boolean;
  onToggle: () => void;
  onOpenComposer: () => void;
  onOpenDialer: () => void;
}

export function AppSidebar({
  sections,
  collapsed,
  onToggle,
  onOpenComposer,
  onOpenDialer,
}: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (route?: string) => {
    if (!route) return false;
    return (
      location.pathname === route || location.pathname.startsWith(route + "/")
    );
  };

  const handleItemClick = (
    route?: string,
    action?: "openComposer" | "openDialer",
  ) => {
    if (action === "openComposer") {
      onOpenComposer();
      return;
    }
    if (action === "openDialer") {
      onOpenDialer();
      return;
    }
    if (route) navigate(route);
  };

  const renderItem = (item: AppSidebarSection["items"][number]) => {
    const Icon = item.icon;
    const active = isActive(item.route);
    const btn = (
      <button
        key={item.id}
        onClick={() => handleItemClick(item.route, item.action)}
        className={`
          w-full flex items-center gap-3 rounded-lg transition-all duration-150
          ${collapsed ? "justify-center p-3" : "px-3 py-2"}
          ${
            active
              ? "bg-[#4ade80] text-white"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }
        `}
      >
        <Icon className="w-5 h-5 shrink-0" />
        {!collapsed && (
          <>
            <span className="text-sm flex-1 text-left">{item.label}</span>
            {item.externalIcon && (
              <ExternalLink className="w-3.5 h-3.5 opacity-50" />
            )}
          </>
        )}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip.Provider key={item.id} delayDuration={300}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>{btn}</Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="right"
                sideOffset={12}
                className="z-[100] px-3 py-1.5 rounded bg-gray-900 text-white text-xs shadow-xl animate-in fade-in zoom-in-95 duration-200"
              >
                {item.label}
                <Tooltip.Arrow className="fill-gray-900" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      );
    }

    return btn;
  };

  return (
    <aside
      className="flex flex-col bg-[#053f4f] text-white shadow-xl transition-all duration-200 shrink-0"
      style={{ width: collapsed ? 64 : 220 }}
    >
      {/* Header — logo only */}
      <div className="flex items-center border-b border-white/10 h-14 px-3 shrink-0">
        <div
          className={`flex items-center gap-2 overflow-hidden ${collapsed ? "w-full justify-center" : ""}`}
        >
          <img
            src={`${import.meta.env.BASE_URL}symbol.png`}
            alt="LoanBud"
            width={22}
            height={22}
            className="object-contain shrink-0"
          />
          {!collapsed && (
            <span className="text-white font-semibold text-base whitespace-nowrap">
              LoanBud
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {sections.map((section, si) => (
          <div key={si}>
            {si > 0 && <hr className="border-white/10 mx-2 my-2" />}
            {!collapsed && section.label && (
              <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider px-4 mb-1">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5 px-2">
              {section.items.map(renderItem)}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer — account + toggle */}
      <div className="border-t border-white/10 shrink-0">
        <div
          className={`flex items-center px-2 py-2 gap-1 ${collapsed ? "flex-col" : "flex-row"}`}
        >
          <button
            className={`flex items-center gap-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors
              ${collapsed ? "justify-center p-3 w-full" : "px-3 py-2 flex-1"}`}
          >
            <CircleUser className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm">Account</span>}
          </button>
          <button
            onClick={onToggle}
            className={`p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors shrink-0
              ${collapsed ? "w-full flex justify-center" : ""}`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
