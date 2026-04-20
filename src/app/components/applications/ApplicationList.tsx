import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Button } from "@ui/button";
import { Checkbox } from "@ui/checkbox";
import { Switch } from "@ui/switch";
import type { ApplicationStage } from "@app/types";
import { useAppData } from "@/app/contexts/AppDataContext";

const STAGE_COLORS: Record<
  ApplicationStage,
  { dot: string; bg: string; text: string }
> = {
  Leads: { dot: "bg-blue-400", bg: "bg-blue-50", text: "text-blue-700" },
  "Prequalification Review": {
    dot: "bg-violet-500",
    bg: "bg-violet-50",
    text: "text-violet-700",
  },
  "Completed Initial Application": {
    dot: "bg-teal-500",
    bg: "bg-teal-50",
    text: "text-teal-700",
  },
  "Submitted to Underwriting": {
    dot: "bg-orange-400",
    bg: "bg-orange-50",
    text: "text-orange-700",
  },
  "Requested Prepaid Docs": {
    dot: "bg-yellow-500",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
  },
  "On Hold": {
    dot: "bg-slate-400",
    bg: "bg-slate-50",
    text: "text-slate-600",
  },
  Withdrawn: { dot: "bg-red-400", bg: "bg-red-50", text: "text-red-700" },
  Funded: { dot: "bg-green-500", bg: "bg-green-50", text: "text-green-700" },
};

const TAB_ORDER: Array<ApplicationStage | "All"> = [
  "All",
  "Leads",
  "Prequalification Review",

  "Requested Prepaid Docs",
  "On Hold",
  "Withdrawn",
  "Funded",
];

export function ApplicationList() {
  const { applications } = useAppData();
  const [activeTab, setActiveTab] = useState<ApplicationStage | "All">("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const tabCounts = useMemo(() => {
    const counts: Partial<Record<ApplicationStage, number>> = {};
    for (const app of applications) {
      counts[app.stage] = (counts[app.stage] ?? 0) + 1;
    }
    return counts;
  }, [applications]);

  const visibleRows = useMemo(() => {
    let rows =
      activeTab === "All"
        ? applications
        : applications.filter((a) => a.stage === activeTab);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      rows = rows.filter(
        (a) =>
          a.applicationNumber.includes(q) ||
          a.loanPurpose.toLowerCase().includes(q) ||
          a.branchName.toLowerCase().includes(q) ||
          a.loanOfficerName.toLowerCase().includes(q) ||
          a.assigneeName.toLowerCase().includes(q) ||
          a.stage.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [applications, activeTab, searchTerm]);

  const allVisibleSelected =
    visibleRows.length > 0 && visibleRows.every((r) => selectedIds.has(r.id));
  const someSelected = visibleRows.some((r) => selectedIds.has(r.id));

  function toggleAll() {
    if (allVisibleSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        visibleRows.forEach((r) => next.delete(r.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        visibleRows.forEach((r) => next.add(r.id));
        return next;
      });
    }
  }

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function getTabLabel(tab: ApplicationStage | "All"): string {
    if (tab === "All") return `All Applications (${applications.length})`;
    const count = tabCounts[tab] ?? 0;
    return `${tab} (${count})`;
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4">
          <h2
            className="text-xl sm:text-2xl md:text-3xl"
            style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
          >
            Applications
          </h2>
          <p className="text-muted-foreground text-sm">
            {applications.length} applications
          </p>
        </div>

        {/* Tab strip */}
        <div className="flex gap-1 overflow-x-auto mb-4 pb-1 scrollbar-none">
          {TAB_ORDER.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs sm:text-sm border transition-colors ${
                activeTab === tab
                  ? "bg-primary/10 text-primary border-primary/20 font-semibold"
                  : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
              }`}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[140px] sm:min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              style={{ height: "38px" }}
            />
          </div>
          <Button variant="outline" className="px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap">
            Apply Filters
          </Button>
          <Button variant="outline" className="px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap hidden sm:inline-flex">
            Customize table
          </Button>
          <Button variant="outline" className="px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap">
            Actions
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto whitespace-nowrap">
            <span className="hidden xs:inline">Deactivate applications</span>
            <Switch />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-3 py-3 md:px-4 md:py-4 w-10">
                  <Checkbox
                    checked={
                      allVisibleSelected
                        ? true
                        : someSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={toggleAll}
                  />
                </th>
                {[
                  "Stage",
                  "ID",
                  "Loan Purpose",
                  "Branch",
                  "Loan Officer",
                  "Assigned To",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-3 py-3 md:px-6 md:py-4 text-left text-xs sm:text-sm text-muted-foreground"
                    style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleRows.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 py-3 md:px-4 md:py-4">
                    <Checkbox
                      checked={selectedIds.has(app.id)}
                      onCheckedChange={() => toggleRow(app.id)}
                    />
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4">
                    <span
                      className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium ${STAGE_COLORS[app.stage].bg} ${STAGE_COLORS[app.stage].text}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STAGE_COLORS[app.stage].dot}`}
                      />
                      <span className="hidden sm:inline">{app.stage}</span>
                      <span className="sm:hidden">{app.stage.split(" ")[0]}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4">
                    <span
                      className="text-xs sm:text-sm font-mono"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {app.applicationNumber}
                    </span>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4">
                    <span className="text-xs sm:text-sm">{app.loanPurpose}</span>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4 hidden md:table-cell">
                    <span className="text-sm">{app.branchName}</span>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4">
                    <span className="text-xs sm:text-sm text-blue-600">
                      {app.loanOfficerName}
                    </span>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4 hidden sm:table-cell">
                    <span className="text-sm">{app.assigneeName}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {visibleRows.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <p>No applications match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
