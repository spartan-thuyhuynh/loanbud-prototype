import type { CRMSubItem, View } from "../../types";

interface CRMSidebarProps {
  items: CRMSubItem[];
  activeView: View;
  onViewChange: (view: View) => void;
}

export const CRMSidebar = ({
  items,
  activeView,
  onViewChange,
}: CRMSidebarProps) => (
  <aside className="w-52 bg-[#eaeaea] text-black flex flex-col shadow-xl">
    <div className="p-6 border-b border-black/10">
      <h2
        className="text-lg"
        style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
      >
        CRM
      </h2>
    </div>

    <nav className="flex-1 px-4 py-4 overflow-auto">
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          return (
            <div key={item.id}>
              <button
                onClick={() => onViewChange(item.id)}
                className={`
          w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
          transition-all duration-200 text-sm
          ${
            isActive ? "bg-white text-black" : "text-black/80 hover:bg-black/10"
          }
          `}
                title={item.tooltip}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span className="flex-1 text-left">{item.label}</span>
              </button>
              {item.dividerAfter && (
                <div className="border-t border-white/20 my-3" />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  </aside>
);
