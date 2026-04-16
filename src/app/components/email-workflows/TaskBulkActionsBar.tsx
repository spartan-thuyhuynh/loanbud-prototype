import { CheckCircle2, Calendar, Trash2 } from "lucide-react";

interface TaskBulkActionsBarProps {
  selectedCount: number;
  onComplete: () => void;
  onReschedule: () => void;
  onDelete: () => void;
}

export function TaskBulkActionsBar({
  selectedCount,
  onComplete,
  onReschedule,
  onDelete,
}: TaskBulkActionsBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card px-8 py-4 z-40">
      <div className="flex items-center justify-between">
        <span className="text-sm">
          {selectedCount} task{selectedCount !== 1 ? "s" : ""} selected
        </span>
        <div className="flex gap-2">
          <button
            onClick={onComplete}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all text-sm flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete
          </button>
          <button
            onClick={onReschedule}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Reschedule
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
