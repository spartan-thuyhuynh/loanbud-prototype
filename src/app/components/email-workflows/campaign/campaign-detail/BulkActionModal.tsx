import type { BulkActionType } from "../types";

interface BulkActionModalProps {
  isOpen: boolean;
  actionType: BulkActionType;
  selectedCount: number;
  segmentName: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ACTION_TITLES: Record<BulkActionType, string> = {
  "create-tasks": "Create Follow-up Tasks",
  "move-segment": "Move to Another Segment",
  "remove-segment": "Remove from Segment",
  exclude: "Exclude from Future Campaigns",
};

export function BulkActionModal({
  isOpen,
  actionType,
  selectedCount,
  segmentName,
  onConfirm,
  onClose,
}: BulkActionModalProps) {
  if (!isOpen) return null;

  const plural = selectedCount !== 1 ? "s" : "";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-8 max-w-2xl w-full mx-4">
        <h3
          className="text-2xl mb-6"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
        >
          {ACTION_TITLES[actionType]}
        </h3>

        {actionType === "create-tasks" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Create tasks for {selectedCount} selected contact{plural}
            </p>
            <div>
              <label className="block text-sm mb-2 text-muted-foreground">
                Task Type
              </label>
              <select className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="call">Call</option>
                <option value="follow-up">Follow-up</option>
                <option value="status-check">Status Check</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2 text-muted-foreground">
                Assign To
              </label>
              <select className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select assignee...</option>
                <option value="john">John Doe</option>
                <option value="sarah">Sarah Chen</option>
                <option value="mike">Mike Johnson</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2 text-muted-foreground">
                Due Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        )}

        {actionType === "move-segment" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Move {selectedCount} contact{plural} to a different segment
            </p>
            <div>
              <label className="block text-sm mb-2 text-muted-foreground">
                Target Segment
              </label>
              <select className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select segment...</option>
                <option value="engaged">Engaged Contacts</option>
                <option value="unresponsive">Unresponsive</option>
                <option value="nurture">Nurture List</option>
              </select>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 Contacts will be added to the selected segment. They may
                remain in the current segment if conditions still match.
              </p>
            </div>
          </div>
        )}

        {actionType === "remove-segment" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Remove {selectedCount} contact{plural} from "{segmentName}"
            </p>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                ⚠️ This will prevent these contacts from being included in
                future campaigns that use this segment.
              </p>
            </div>
          </div>
        )}

        {actionType === "exclude" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Exclude {selectedCount} contact{plural} from future campaigns
              using this segment
            </p>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                ⚠️ <strong>Permanent exclusion:</strong> These contacts will be
                excluded from all future campaigns that use the "{segmentName}"
                segment.
              </p>
            </div>
            <div>
              <label className="block text-sm mb-2 text-muted-foreground">
                Reason (Optional)
              </label>
              <textarea
                placeholder="e.g., Unsubscribed, No longer relevant, etc."
                rows={3}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all"
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border-2 border-border text-foreground rounded-lg hover:bg-muted transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
