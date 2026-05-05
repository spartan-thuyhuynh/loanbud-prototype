import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { getTaskTypeConfig, getDispositionsForTaskType } from "@/app/lib/taskTypeRegistry";

interface OutcomeCapturePanelProps {
  taskType: string;
  onSubmit: (disposition: string, note: string | undefined) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

/**
 * Reusable outcome capture panel.
 * Disposition options and label are driven by the task type registry.
 * Used inside TaskDetailPanel (after a call ends) and in TaskActionModal.
 */
export function OutcomeCapturePanel({
  taskType,
  onSubmit,
  onCancel,
  isLoading = false,
}: OutcomeCapturePanelProps) {
  const [selectedDisposition, setSelectedDisposition] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const config = getTaskTypeConfig(taskType);
  const dispositions = getDispositionsForTaskType(taskType);

  // Determine prompt label from the first disposition-picker completion field
  const dispositionField = config.completionFields.find((f) => f.type === "disposition-picker");
  const promptLabel = dispositionField?.label ?? "Outcome";

  // Check if there's a note field in completionFields
  const hasNoteField = config.completionFields.some((f) => f.key === "outcome" && f.type === "textarea");
  const noteField = config.completionFields.find((f) => f.key === "outcome" && f.type === "textarea");

  const handleSubmit = () => {
    if (!selectedDisposition) return;
    onSubmit(selectedDisposition, note.trim() || undefined);
  };

  // Color the disposition chip based on its semantic meaning
  const getDispositionStyle = (dis: string, isSelected: boolean) => {
    if (isSelected) {
      if (dis === "Answered" || dis === "Attended" || dis.includes("Sent") || dis === "Approved" || dis === "Completed") {
        return "bg-green-600 text-white border-green-600";
      }
      if (dis.includes("Voicemail") || dis.includes("No-Show") || dis.includes("Partial")) {
        return "bg-amber-500 text-white border-amber-500";
      }
      if (dis.includes("No Answer") || dis === "Bounced" || dis === "Failed" || dis === "Denied" || dis === "Rejected") {
        return "bg-red-600 text-white border-red-600";
      }
      if (dis === "Not Needed" || dis === "Skipped" || dis === "Cancelled") {
        return "bg-gray-500 text-white border-gray-500";
      }
      return "bg-primary text-primary-foreground border-primary";
    }
    return "border-border hover:bg-muted/60 text-foreground";
  };

  // Icon for the selected state
  const getUnselectedLabel = (dis: string): string => {
    if (dis === "Answered" || dis === "Attended" || dis === "Approved" || dis === "Completed") return "✓ ";
    if (dis.includes("Voicemail") || dis.includes("VM")) return "📞 ";
    if (dis.includes("No Answer")) return "✕ ";
    return "";
  };

  const canSubmit = !!selectedDisposition && !isLoading;
  // Note is required only if the note field is marked required
  const noteRequired = noteField?.required ?? false;
  const submitBlocked = !canSubmit || (noteRequired && !note.trim());

  return (
    <div className="space-y-4">
      {/* Prompt */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">{promptLabel}</p>
        <div className={`grid gap-2 ${dispositions.length <= 2 ? "grid-cols-2" : "grid-cols-2"}`}>
          {dispositions.map((dis) => {
            const isSelected = selectedDisposition === dis;
            return (
              <button
                key={dis}
                onClick={() => setSelectedDisposition(dis)}
                className={`px-3 py-2.5 border rounded-xl text-xs font-medium transition-all text-left leading-snug ${getDispositionStyle(dis, isSelected)}`}
              >
                {isSelected ? <CheckCircle2 className="w-3 h-3 inline mr-1 -mt-0.5" /> : (
                  <span className="opacity-50">{getUnselectedLabel(dis)}</span>
                )}
                {dis}
              </button>
            );
          })}
        </div>
      </div>

      {/* Note field (if the task type supports it) */}
      {hasNoteField && (
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">
            {noteField?.label ?? "Note"}
            {noteRequired ? " *" : " (optional)"}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={noteField?.placeholder ?? "Add a note…"}
            rows={3}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSubmit}
          disabled={submitBlocked}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          Mark Task Done
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2.5 border border-border text-foreground rounded-lg text-sm hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

