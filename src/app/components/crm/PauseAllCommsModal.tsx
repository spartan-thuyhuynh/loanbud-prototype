import { useState } from "react";
import { X, PauseCircle } from "lucide-react";

interface PauseAllCommsModalProps {
  isOpen: boolean;
  contactName: string;
  activeEnrollmentCount: number;
  onConfirm: (pausedUntil: Date | null, reason: string) => void;
  onClose: () => void;
}

function defaultResumeDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}

function minDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export function PauseAllCommsModal({
  isOpen,
  contactName,
  activeEnrollmentCount,
  onConfirm,
  onClose,
}: PauseAllCommsModalProps) {
  const [resumeDate, setResumeDate] = useState(defaultResumeDate);
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    const parsedDate = resumeDate ? new Date(resumeDate + "T00:00:00") : null;
    onConfirm(parsedDate, reason.trim());
    setResumeDate(defaultResumeDate());
    setReason("");
  };

  const handleClose = () => {
    setResumeDate(defaultResumeDate());
    setReason("");
    onClose();
  };

  const workflowWord = activeEnrollmentCount === 1 ? "workflow" : "workflows";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-xl p-8 max-w-lg w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
              <PauseCircle className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold">Pause All Communications</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          This will pause{" "}
          <span className="font-semibold text-foreground">
            {activeEnrollmentCount} active {workflowWord}
          </span>{" "}
          for <span className="font-semibold text-foreground">{contactName}</span>. All pending
          tasks will be suspended until communications are resumed.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Resume on{" "}
              <span className="text-muted-foreground font-normal">(optional — leave blank to pause indefinitely)</span>
            </label>
            <input
              type="date"
              value={resumeDate}
              min={minDate()}
              onChange={(e) => setResumeDate(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Reason{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Contact on vacation until Jun 1"
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Pause All
          </button>
        </div>
      </div>
    </div>
  );
}
