import { useState } from "react";
import { X } from "lucide-react";
import { useAppData } from "@/app/contexts/AppDataContext";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedContactId?: string;
}

const TASK_TYPES = ["Call", "Email", "Voicemail"];

export function CreateTaskModal({ isOpen, onClose, preselectedContactId }: CreateTaskModalProps) {
  const { contacts, handleCreateTask } = useAppData();

  const [contactId, setContactId] = useState(preselectedContactId ?? "");
  const [taskType, setTaskType] = useState("Call");
  const [dueDate, setDueDate] = useState("");
  const [objective, setObjective] = useState("");
  const [vmScript, setVmScript] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const showVmField = taskType === "Call" || taskType === "Voicemail";

  const handleClose = () => {
    setContactId(preselectedContactId ?? "");
    setTaskType("Call");
    setDueDate("");
    setObjective("");
    setVmScript("");
    setError("");
    onClose();
  };

  const handleSubmit = () => {
    if (!contactId) { setError("Please select a contact."); return; }
    if (!dueDate) { setError("Please set a due date."); return; }
    if (!objective.trim()) { setError("Objective is required."); return; }

    const contact = contacts.find((c) => c.id === contactId);
    handleCreateTask({
      contactId,
      contactName: contact ? `${contact.firstName} ${contact.lastName}` : contactId,
      taskType,
      dueDate: new Date(dueDate),
      objective: objective.trim(),
      vmScript: vmScript.trim() || undefined,
    });
    handleClose();
  };

  const activeContacts = contacts.filter((c) => !c.optedOut);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-xl p-8 max-w-lg w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">New Task</h3>
          <button onClick={handleClose} className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Contact <span className="text-destructive">*</span></label>
            <select
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select contact…</option>
              {activeContacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} — {c.listingName} ({c.listingStatus})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Task Type</label>
            <div className="flex gap-2">
              {TASK_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTaskType(t)}
                  className={`flex-1 py-2 text-sm rounded-lg border-2 transition-colors ${
                    taskType === t
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Due Date <span className="text-destructive">*</span></label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Call Objective <span className="text-destructive">*</span></label>
            <textarea
              rows={2}
              placeholder="e.g. Explain which documents are needed and how to upload them"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {showVmField && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Voicemail Script <span className="text-muted-foreground font-normal">(optional)</span></label>
              <textarea
                rows={2}
                placeholder="e.g. Hi {{first_name}}, this is [Name] from LoanBud — please give me a call back at [phone]."
                value={vmScript}
                onChange={(e) => setVmScript(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Create Task
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2.5 border-2 border-border text-foreground rounded-lg text-sm hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
