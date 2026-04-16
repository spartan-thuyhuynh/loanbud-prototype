import { Filter } from "lucide-react";

interface ContactFilterBarProps {
  filterEngagement: string;
  filterSegmentMatch: string;
  filteredCount: number;
  totalCount: number;
  onChangeEngagement: (v: string) => void;
  onChangeSegmentMatch: (v: string) => void;
  onClear: () => void;
}

export function ContactFilterBar({
  filterEngagement,
  filterSegmentMatch,
  filteredCount,
  totalCount,
  onChangeEngagement,
  onChangeSegmentMatch,
  onClear,
}: ContactFilterBarProps) {
  const hasActiveFilters =
    filterEngagement !== "all" || filterSegmentMatch !== "all";

  return (
    <div className="border-b border-border bg-muted/30 px-8 py-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filters:</span>
        </div>

        <select
          value={filterEngagement}
          onChange={(e) => onChangeEngagement(e.target.value)}
          className="px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
        >
          <option value="all">All Engagement</option>
          <option value="clicked">Clicked</option>
          <option value="opened">Opened</option>
          <option value="delivered">Delivered</option>
          <option value="no-response">No Response</option>
        </select>

        <select
          value={filterSegmentMatch}
          onChange={(e) => onChangeSegmentMatch(e.target.value)}
          className="px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
        >
          <option value="all">All Contacts</option>
          <option value="still-match">Still in Segment</option>
          <option value="no-longer-match">No Longer in Segment</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-sm text-primary hover:underline"
          >
            Clear Filters
          </button>
        )}

        <div className="ml-auto text-sm text-muted-foreground">
          Showing {filteredCount} of {totalCount} contacts
        </div>
      </div>
    </div>
  );
}
