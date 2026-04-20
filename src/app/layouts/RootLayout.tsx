import { Outlet, useLocation, useNavigate } from "react-router";
import { IconSidebar } from "../components/ui/IconSidebar";
import { iconNavItems } from "../data/navigation";

const SECTION_ROOTS: Record<string, string> = {
  applications: "/applications",
  "business-acquisition": "/business-acquisition",
  crm: "/crm/contacts",
  "email-workflows": "/email-workflows/overview",
  users: "/users",
  automations: "/automations",
  questionnaires: "/questionnaires",
  configurations: "/configurations",
};

export function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeSection = (() => {
    const p = location.pathname;
    if (p.startsWith("/crm")) return "crm";
    if (p.startsWith("/email-workflows")) return "email-workflows";
    // Match any top-level segment
    const segment = p.split("/")[1];
    return segment || null;
  })();

  const handleSectionClick = (id: string) => {
    const target = SECTION_ROOTS[id] ?? `/${id}`;
    navigate(target);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <IconSidebar
        items={iconNavItems}
        activeSection={activeSection}
        onSectionClick={handleSectionClick}
      />
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
