import { Outlet, useOutletContext } from "react-router";
import { CRMSidebar } from "../components/crm";
import { crmSubItems } from "../data/navigation";
import { AppHeader } from "../components/ui/AppHeader";
import { SHOW_APP_HEADER } from "../config/featureFlags";

interface RootOutletContext {
  onOpenComposer: () => void;
  onOpenDialer: () => void;
}

export function CRMLayout() {
  const { onOpenComposer, onOpenDialer } = useOutletContext<RootOutletContext>();

  return (
    <>
      <CRMSidebar items={crmSubItems} />
      <div className="flex flex-col flex-1 overflow-hidden">
        {SHOW_APP_HEADER && (
          <AppHeader onOpenComposer={onOpenComposer} onOpenDialer={onOpenDialer} />
        )}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
