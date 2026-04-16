import { NavLink } from "react-router";
import type { CRMSubItem } from "../../types";

interface CRMSidebarProps {
  items: CRMSubItem[];
}

export const CRMSidebar = ({ items }: CRMSidebarProps) => (
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
          const Icon = item.icon;
          return (
            <div key={item.id}>
              <NavLink
                to={`/crm/${item.id}`}
                title={item.tooltip}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
                  transition-all duration-200 text-sm
                  ${isActive ? "bg-white text-black" : "text-black/80 hover:bg-black/10"}`
                }
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span className="flex-1 text-left">{item.label}</span>
              </NavLink>
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
