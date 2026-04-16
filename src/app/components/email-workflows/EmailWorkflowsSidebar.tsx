import type { EmailWorkflowSubItem, View } from "../../types";

interface EmailWorkflowsSidebarProps {
  items: EmailWorkflowSubItem[];
  activeView: View;
  onViewChange: (view: View) => void;
  onResetSegmentBuilder: () => void;
}

export const EmailWorkflowsSidebar = ({
  items,
  activeView,
  onViewChange,
  onResetSegmentBuilder,
}: EmailWorkflowsSidebarProps) => (
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
        {items.map((item) => {
          const isActive = activeView === item.id;
          return (
            <div key={item.id}>
              <button
                onClick={() => {
                  onViewChange(item.id);
                  onResetSegmentBuilder();
                }}
                className={`
            w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
            transition-all duration-200 text-sm
            ${isActive ? "bg-white text-black" : "text-black hover:bg-black/10"}
          `}
              >
                <span className="flex-1 text-left">{item.label}</span>
              </button>
              {item.dividerAfter && (
                <div className="border-t border-black/20 my-3" />
              )}
            </div>
          );
        })}
      </div>
    </nav>

    <div className="p-4 border-t border-black/10">
      <div className="text-xs text-black/60">
        <p className="mb-1">Phase 1: MVP</p>
        <p className="opacity-70">Manual Send + Reminders</p>
      </div>
    </div>
  </aside>
);
