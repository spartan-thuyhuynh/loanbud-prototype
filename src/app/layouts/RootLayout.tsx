import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { AppSidebar } from "../components/ui/AppSidebar";
import { AppHeader } from "../components/ui/AppHeader";
import { DialerPanel } from "../components/dialer/DialerPanel";
import { ComposerPanel } from "../components/composer/ComposerPanel";
import { appSidebarSections } from "../data/navigation";
import { SHOW_APP_HEADER } from "../config/featureFlags";
import { DialerProvider, useDialer } from "../contexts/DialerContext";

function RootLayoutInner() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") !== "false"
  );
  const [composerOpen, setComposerOpen] = useState(false);
  const { dialerOpen, dialerNumber, session, openDialer, closeDialer } = useDialer();

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
        onOpenDialer={() => openDialer()}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        {SHOW_APP_HEADER && !routeHasSubSidebar && (
          <AppHeader
            onOpenComposer={() => setComposerOpen(true)}
            onOpenDialer={() => openDialer()}
          />
        )}
        <div className="flex flex-1 overflow-hidden">
          <Outlet
            context={{
              onOpenComposer: () => setComposerOpen(true),
              onOpenDialer: openDialer,
            }}
          />
        </div>
      </div>

      {dialerOpen && (
        <DialerPanel
          onClose={closeDialer}
          initialNumber={dialerNumber}
          // When task-bound the TaskDetailPanel (420px) is open on the right —
          // shift the dialer left so it's never hidden behind the drawer.
          offsetRight={session?.taskId ? 444 : 24}
        />
      )}
      {composerOpen && (
        <ComposerPanel
          onClose={() => setComposerOpen(false)}
          offsetRight={dialerOpen ? 70 : 6}
        />
      )}
    </div>
  );
}

export function RootLayout() {
  return (
    <DialerProvider>
      <RootLayoutInner />
    </DialerProvider>
  );
}
