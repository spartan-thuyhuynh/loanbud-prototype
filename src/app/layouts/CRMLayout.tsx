import { Outlet } from "react-router";
import { CRMSidebar } from "../components/crm";
import { crmSubItems } from "../data/navigation";

export function CRMLayout() {
  return (
    <>
      <CRMSidebar items={crmSubItems} />
      <main className="flex-1 overflow-auto">
        <div className="h-full">
          <Outlet />
        </div>
      </main>
    </>
  );
}
