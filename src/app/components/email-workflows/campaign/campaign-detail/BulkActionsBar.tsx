import { Plus, UserPlus, UserMinus, Ban } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onCreateTasks: () => void;
  onMoveSegment: () => void;
  onRemoveSegment: () => void;
  onExclude: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onCreateTasks,
  onMoveSegment,
  onRemoveSegment,
  onExclude,
}: BulkActionsBarProps) {
  return (
    <div className="border-b border-border bg-accent/10 px-8 py-3">
      <div className="flex items-center justify-between">
        <span className="text-sm">
          {selectedCount} contact{selectedCount !== 1 ? "s" : ""} selected
        </span>
        <div className="flex gap-2">
          <button
            onClick={onCreateTasks}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Tasks
          </button>
          <button
            onClick={onMoveSegment}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Move to Segment
          </button>
          <button
            onClick={onRemoveSegment}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all text-sm flex items-center gap-2"
          >
            <UserMinus className="w-4 h-4" />
            Remove from Segment
          </button>
          <button
            onClick={onExclude}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm flex items-center gap-2"
          >
            <Ban className="w-4 h-4" />
            Exclude from Future
          </button>
        </div>
      </div>
    </div>
  );
}
