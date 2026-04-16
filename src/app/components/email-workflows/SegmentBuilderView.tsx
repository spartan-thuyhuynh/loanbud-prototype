import { SegmentsView } from "./SegmentsView";
import type { Contact } from "../../types";

interface SegmentBuilderViewProps {
  contacts: Contact[];
  onBack: () => void;
}

export const SegmentBuilderView = ({ contacts, onBack }: SegmentBuilderViewProps) => (
  <div className="h-full flex flex-col">
    <div className="px-8 py-4 border-b border-border bg-card flex items-center gap-3">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg hover:bg-muted/80 transition-all text-sm"
      >
        ← Back
      </button>
      <span className="text-muted-foreground text-sm">Segment Builder</span>
    </div>
    <div className="flex-1 overflow-auto">
      <SegmentsView contacts={contacts} />
    </div>
  </div>
);
