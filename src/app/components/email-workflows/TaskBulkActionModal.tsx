import { useState } from "react";

type BulkMode = "complete" | "reschedule" | "delete" | null;

interface TaskBulkActionModalProps {
  isOpen: boolean;
  mode: BulkMode;
  selectedCount: number;
  onComplete: (disposition: string) => void;
  onReschedule: (newDate: Date) => void;
  onDelete: () => void;
  onClose: () => void;
}

const dispositions = ["Answered", "VM Left", "No Answer", "Not Needed"];

export function TaskBulkActionModal({
  isOpen,
  mode,
  selectedCount,
  onComplete,
  onReschedule,
  onDelete,
  onClose,
}: TaskBulkActionModalProps) {
  const [rescheduleDate, setRescheduleDate] = useState("");

  if (!isOpen) return null;

  const plural = selectedCount !== 1 ? "s" : "";

  const handleReschedule = () => {
    if (rescheduleDate) {
      onReschedule(new Date(rescheduleDate));
      setRescheduleDate("");
    }
  };

  const handleClose = () => {
    setRescheduleDate("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-8 max-w-lg w-full mx-4">
        {/* Complete mode */}
        {mode === "complete" && (
          <>
            <h3
              className="text-2xl mb-2"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Complete Tasks
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Select the call outcome for {selectedCount} task{plural}:
            </p>
            <div className="grid grid-cols-2 gap-2 mb-8">
              {dispositions.map((dis) => (
                <button
                  key={dis}
                  onClick={() => onComplete(dis)}
                  className="px-4 py-3 border border-border rounded-xl text-xs hover:bg-primary hover:text-white hover:border-primary transition-all text-left flex justify-between items-center group"
                >
                  {dis}
                  <svg
                    className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="px-6 py-3 border-2 border-border text-foreground rounded-lg hover:bg-muted transition-all"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* Reschedule mode */}
        {mode === "reschedule" && (
          <>
            <h3
              className="text-2xl mb-2"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Reschedule Tasks
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Set a new due date for {selectedCount} task{plural}:
            </p>
            <div className="mb-6">
              <label className="block text-sm mb-2 text-muted-foreground">
                New Schedule Date
              </label>
              <input
                type="datetime-local"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReschedule}
                disabled={!rescheduleDate}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Update Schedule
              </button>
              <button
                onClick={handleClose}
                className="px-6 py-3 border-2 border-border text-foreground rounded-lg hover:bg-muted transition-all"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* Delete mode */}
        {mode === "delete" && (
          <>
            <h3
              className="text-2xl mb-4"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Delete Tasks
            </h3>
            <p className="text-sm text-muted-foreground mb-8">
              Are you sure you want to delete{" "}
              <strong className="text-foreground">
                {selectedCount} task{plural}
              </strong>
              ? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onDelete}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                Delete {selectedCount} Task{plural}
              </button>
              <button
                onClick={handleClose}
                className="px-6 py-3 border-2 border-border text-foreground rounded-lg hover:bg-muted transition-all"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
