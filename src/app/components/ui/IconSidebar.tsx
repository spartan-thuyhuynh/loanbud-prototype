import type { IconNavItem } from "../../types";
import * as Tooltip from "@radix-ui/react-tooltip";

interface IconSidebarProps {
  items: IconNavItem[];
  activeSection: string | null;
  onSectionClick: (id: string) => void;
}

export const IconSidebar = ({
  items,
  activeSection,
  onSectionClick,
}: IconSidebarProps) => (
  <aside className="w-16 bg-[#2c3e50] text-white flex flex-col shadow-xl">
    {/* Logo */}
    <div className="p-3 border-b border-white/10 flex items-center justify-center">
      <img
        src="public/symbol.png"
        alt="Logo"
        width={24}
        height={24}
        className="object-contain"
      />
    </div>

    <nav className="flex-1 py-4 overflow-auto">
      <div className="space-y-2 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <Tooltip.Provider key={item.id} delayDuration={300}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => onSectionClick(item.id)}
                    className={`
                      w-full p-3 rounded-lg transition-all duration-200
                      ${isActive ? "bg-[#4ade80] text-white" : "text-white/70 hover:bg-white/10"}
                    `}
                  >
                    <Icon className="w-6 h-6 mx-auto" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="right"
                    sideOffset={12}
                    className="z-[100] px-3 py-1.5 rounded bg-gray-900 text-white text-xs shadow-xl animate-in fade-in zoom-in-95 duration-200"
                  >
                    {item.tooltip}
                    <Tooltip.Arrow className="fill-gray-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          );
        })}
      </div>
    </nav>
  </aside>
);
