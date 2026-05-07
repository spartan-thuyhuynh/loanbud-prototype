import { Outlet, useOutletContext } from "react-router";

interface RootOutletContext {
  onOpenComposer: () => void;
  onOpenDialer: (number?: string) => void;
}

export function CRMLayout() {
  const context = useOutletContext<RootOutletContext>();
  return (
    <main className="flex-1 overflow-auto h-full">
      <Outlet context={context} />
    </main>
  );
}
