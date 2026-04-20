import { useState } from "react";

interface SaveSegmentModalProps {
  isOpen: boolean;
  onSave: (name: string, description: string) => void;
  onClose: () => void;
  initialName?: string;
  initialDescription?: string;
}

export function SaveSegmentModal({
  isOpen,
  onSave,
  onClose,
  initialName = "",
  initialDescription = "",
}: SaveSegmentModalProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), description.trim());
    setName("");
    setDescription("");
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-8 max-w-lg w-full mx-4">
        <h3
          className="text-2xl mb-6"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
        >
          Save Segment
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2 text-muted-foreground">
              Segment Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., New Broker Listings"
              autoFocus
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
          <div>
            <label className="block text-sm mb-2 text-muted-foreground">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this segment…"
              rows={3}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Segment
          </button>
          <button
            onClick={handleClose}
            className="px-6 py-3 border-2 border-border text-foreground rounded-lg hover:bg-muted transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
