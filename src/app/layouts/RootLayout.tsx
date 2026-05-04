import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { AppSidebar } from "../components/ui/AppSidebar";
import { AppHeader } from "../components/ui/AppHeader";
import { DialerPanel } from "../components/dialer/DialerPanel";
import { ComposerPanel } from "../components/composer/ComposerPanel";
import { appSidebarSections } from "../data/navigation";
import { SHOW_APP_HEADER } from "../config/featureFlags";

export function RootLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") !== "false"
  );
  const [dialerOpen, setDialerOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);

  const location = useLocation();
  // These routes render their own sub-sidebar and handle AppHeader internally
  const routeHasSubSidebar = ["/crm", "/email-workflows"].some((r) =>
    location.pathname.startsWith(r)
  );

  const handleToggleSidebar = () => {
    setSidebarCollapsed((v) => {
      localStorage.setItem("sidebar-collapsed", String(!v));
      return !v;
    });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <AppSidebar
        sections={appSidebarSections}
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        onOpenComposer={() => setComposerOpen(true)}
        onOpenDialer={() => setDialerOpen(true)}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        {SHOW_APP_HEADER && !routeHasSubSidebar && (
          <AppHeader
            onOpenComposer={() => setComposerOpen(true)}
            onOpenDialer={() => setDialerOpen(true)}
          />
        )}
        <div className="flex flex-1 overflow-hidden">
          <Outlet
            context={{
              onOpenComposer: () => setComposerOpen(true),
              onOpenDialer: () => setDialerOpen(true),
            }}
          />
        </div>
      </div>

      {dialerOpen && <DialerPanel onClose={() => setDialerOpen(false)} />}
      {composerOpen && (
        <ComposerPanel
          onClose={() => setComposerOpen(false)}
          offsetRight={dialerOpen ? 70 : 6}
        />
      )}
    </div>
  );
}
