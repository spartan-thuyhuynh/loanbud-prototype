import { Outlet, useMatch } from "react-router";
import { EmailWorkflowsSidebar } from "../components/email-workflows";
import { emailWorkflowsSubItems } from "../data/navigation";

export function EmailWorkflowsLayout() {
  const isCompose = useMatch("/email-workflows/compose");
  const isSegmentBuilder = useMatch("/email-workflows/user-segments/builder");

  return (
    <>
      {!isCompose && !isSegmentBuilder && <EmailWorkflowsSidebar items={emailWorkflowsSubItems} />}
      <main className="flex-1 overflow-auto">
        <div className="h-full">
          <Outlet />
        </div>
      </main>
    </>
  );
}
