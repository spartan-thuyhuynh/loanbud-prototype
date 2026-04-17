import { NavLink } from "react-router";
import type { EmailWorkflowSubItem } from "../../types";

interface EmailWorkflowsSidebarProps {
  items: EmailWorkflowSubItem[];
}

export const EmailWorkflowsSidebar = ({ items }: EmailWorkflowsSidebarProps) => (
  <aside className="w-52 bg-[#eaeaea] text-black flex flex-col shadow-xl">
    <div className="p-6 border-b border-black/10">
      <h2
        className="text-lg"
        style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
      >
        Email Workflows
      </h2>
    </div>

    <nav className="flex-1 px-4 py-4 overflow-auto">
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.id}>
            <NavLink
              to={`/email-workflows/${item.id}`}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
                transition-all duration-200 text-sm
                ${isActive ? "bg-white text-black" : "text-black hover:bg-black/10"}`
              }
            >
              <span className="flex-1 text-left">{item.label}</span>
            </NavLink>
            {item.dividerAfter && (
              <div className="border-t border-black/20 my-3" />
            )}
          </div>
        ))}
      </div>
    </nav>

    <div className="p-4 border-t border-black/10">
      <div className="text-xs text-black/60">
        <p className="mb-1">Phase 1: MVP</p>
        <p className="opacity-70">Manual Send + Tasks</p>
      </div>
    </div>
  </aside>
);
