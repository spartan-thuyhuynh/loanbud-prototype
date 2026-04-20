import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Button } from "@ui/button";
import { Checkbox } from "@ui/checkbox";
import { Switch } from "@ui/switch";
import type { BusinessAcquisitionStage } from "@app/types";
import { useAppData } from "@/app/contexts/AppDataContext";

const BA_STAGE_COLORS: Record<
  BusinessAcquisitionStage,
  { dot: string; bg: string; text: string }
> = {
  "New Lead": { dot: "bg-blue-400", bg: "bg-blue-50", text: "text-blue-700" },
  Qualified: { dot: "bg-teal-500", bg: "bg-teal-50", text: "text-teal-700" },
  "Proposal Sent": {
    dot: "bg-violet-500",
    bg: "bg-violet-50",
    text: "text-violet-700",
  },
  Negotiation: {
    dot: "bg-orange-400",
    bg: "bg-orange-50",
    text: "text-orange-700",
  },
  "Closed Won": {
    dot: "bg-green-500",
    bg: "bg-green-50",
    text: "text-green-700",
  },
  "Closed Lost": { dot: "bg-red-400", bg: "bg-red-50", text: "text-red-700" },
  "On Hold": {
    dot: "bg-slate-400",
    bg: "bg-slate-50",
    text: "text-slate-600",
  },
};

const TAB_ORDER: Array<BusinessAcquisitionStage | "All"> = [
  "All",
  "New Lead",
  "Qualified",
  "Proposal Sent",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
  "On Hold",
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BusinessAcquisitionList() {
  const { businessAcquisitions } = useAppData();
  const [activeTab, setActiveTab] = useState<BusinessAcquisitionStage | "All">(
    "All",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const tabCounts = useMemo(() => {
    const counts: Partial<Record<BusinessAcquisitionStage, number>> = {};
    for (const rec of businessAcquisitions) {
      counts[rec.stage] = (counts[rec.stage] ?? 0) + 1;
    }
    return counts;
  }, [businessAcquisitions]);

  const visibleRows = useMemo(() => {
    let rows =
      activeTab === "All"
        ? businessAcquisitions
        : businessAcquisitions.filter((r) => r.stage === activeTab);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.recordNumber.includes(q) ||
          r.acquisitionType.toLowerCase().includes(q) ||
          r.branchName.toLowerCase().includes(q) ||
          r.agentName.toLowerCase().includes(q) ||
          r.assigneeName.toLowerCase().includes(q) ||
          r.stage.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [businessAcquisitions, activeTab, searchTerm]);

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

  function getTabLabel(tab: BusinessAcquisitionStage | "All"): string {
    if (tab === "All") return `All Records (${businessAcquisitions.length})`;
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
            Business Acquisition
          </h2>
          <p className="text-muted-foreground text-sm">
            {businessAcquisitions.length} records
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
              placeholder="Search business acquisitions..."
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
            <span className="hidden xs:inline">Deactivate records</span>
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
                  "Record #",
                  "Acquisition Type",
                  "Branch",
                  "Agent",
                  "Assigned To",
                  "Deal Value",
                ].map((col) => (
                  <th
                    key={col}
                    className={`px-3 py-3 md:px-6 md:py-4 text-left text-xs sm:text-sm text-muted-foreground${col === "Branch" ? " hidden md:table-cell" : col === "Assigned To" ? " hidden sm:table-cell" : ""}`}
                    style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleRows.map((rec) => (
                <tr
                  key={rec.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 py-3 md:px-4 md:py-4">
                    <Checkbox
                      checked={selectedIds.has(rec.id)}
                      onCheckedChange={() => toggleRow(rec.id)}
                    />
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4">
                    <span
                      className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium ${BA_STAGE_COLORS[rec.stage].bg} ${BA_STAGE_COLORS[rec.stage].text}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${BA_STAGE_COLORS[rec.stage].dot}`}
                      />
                      <span className="hidden sm:inline">{rec.stage}</span>
                      <span className="sm:hidden">{rec.stage.split(" ")[0]}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4">
                    <span
                      className="text-xs sm:text-sm font-mono"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {rec.recordNumber}
                    </span>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4">
                    <span className="text-xs sm:text-sm">{rec.acquisitionType}</span>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4 hidden md:table-cell">
                    <span className="text-sm">{rec.branchName}</span>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4">
                    <span className="text-xs sm:text-sm text-blue-600">
                      {rec.agentName}
                    </span>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4 hidden sm:table-cell">
                    <span className="text-sm">{rec.assigneeName}</span>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4">
                    <span className="text-xs sm:text-sm font-medium">
                      {formatCurrency(rec.dealValue)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {visibleRows.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <p>No records match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
