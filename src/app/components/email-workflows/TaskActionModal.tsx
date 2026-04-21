import { useState } from "react";
import { MessageSquare } from "lucide-react";
import type { TaskItem } from "@/app/types";

type ModalMode = "complete" | "reschedule" | "delete" | null;

interface TaskActionModalProps {
  isOpen: boolean;
  mode: ModalMode;
  task: TaskItem | null;
  onComplete: (taskId: string, disposition: string, note?: string) => void;
  onReschedule: (taskId: string, newDate: Date) => void;
  onDelete: (taskId: string) => void;
  onClose: () => void;
}

const dispositions = [
  "Answered",
  "Voicemail Left",
  "No Answer — Voicemail Drop",
  "Not Needed",
];

export function TaskActionModal({
  isOpen,
  mode,
  task,
  onComplete,
  onReschedule,
  onDelete,
  onClose,
}: TaskActionModalProps) {
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [note, setNote] = useState("");
  const [selectedDisposition, setSelectedDisposition] = useState<string | null>(null);

  if (!isOpen || !task) return null;

  const handleComplete = () => {
    if (!selectedDisposition) return;
    onComplete(task.id, selectedDisposition, note.trim() || undefined);
    setNote("");
    setSelectedDisposition(null);
  };

  const handleReschedule = () => {
    if (rescheduleDate) {
      onReschedule(task.id, new Date(rescheduleDate));
      setRescheduleDate("");
    }
  };

  const handleClose = () => {
    setRescheduleDate("");
    setNote("");
    setSelectedDisposition(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-8 max-w-lg w-full mx-4">
        {/* Complete mode */}
        {mode === "complete" && (
          <>
            <h3
              className="text-2xl mb-1"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Complete Task
            </h3>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm text-muted-foreground">
                {task.contactName}
              </span>
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full uppercase tracking-tighter">
                {task.taskType}
              </span>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Select the call outcome to log this activity:
            </p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {dispositions.map((dis) => {
                const active = selectedDisposition === dis;
                return (
                  <button
                    key={dis}
                    onClick={() => setSelectedDisposition(dis)}
                    className={`px-4 py-3 border rounded-xl text-xs transition-all text-left ${
                      active
                        ? "bg-primary text-white border-primary"
                        : "border-border hover:bg-muted/60"
                    }`}
                  >
                    {dis}
                  </button>
                );
              })}
            </div>

            <div className="mb-5">
              <label className="block text-xs text-muted-foreground mb-1.5">
                Note (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note…"
                rows={3}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {task.notes && (
              <div className="bg-background/50 p-4 rounded-xl border border-border mb-5">
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-widest">
                    Scripts & Notes
                  </span>
                </div>
                <p className="text-sm italic text-foreground leading-relaxed">
                  "{task.notes}"
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleComplete}
                disabled={!selectedDisposition}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm
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

        {/* Reschedule mode */}
        {mode === "reschedule" && (
          <>
            <h3
              className="text-2xl mb-1"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Reschedule Task
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {task.contactName}
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
              Delete Task
            </h3>
            <p className="text-sm text-muted-foreground mb-8">
              Are you sure you want to delete this task for{" "}
              <strong className="text-foreground">{task.contactName}</strong>?
              This cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => onDelete(task.id)}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                Delete
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
