import { Outlet, useMatch, useOutletContext } from "react-router";
import { EmailWorkflowsSidebar } from "../components/email-workflows";
import { emailWorkflowsSubItems } from "../data/navigation";
import { AppHeader } from "../components/ui/AppHeader";
import { SHOW_APP_HEADER } from "../config/featureFlags";

interface RootOutletContext {
  onOpenComposer: () => void;
  onOpenDialer: () => void;
}

export function EmailWorkflowsLayout() {
  const { onOpenComposer, onOpenDialer } = useOutletContext<RootOutletContext>();
  const isCompose = useMatch("/email-workflows/compose");
  const isSegmentBuilder = useMatch("/email-workflows/user-segments/builder");

  return (
    <>
      {!isCompose && !isSegmentBuilder && (
        <EmailWorkflowsSidebar items={emailWorkflowsSubItems} />
      )}
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
