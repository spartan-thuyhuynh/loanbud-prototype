import { useState } from "react";
import { Calendar, CheckCircle2, Trash2 } from "lucide-react";
import type { TaskItem } from "@/app/types";
import { TaskActionModal } from "./TaskActionModal";
import { TaskBulkActionsBar } from "./TaskBulkActionsBar";
import { TaskBulkActionModal } from "./TaskBulkActionModal";

type ModalMode = "complete" | "reschedule" | "delete" | null;

interface TaskQueueProps {
  tasks: TaskItem[];
  onComplete: (taskId: string, disposition: string) => void;
  onReschedule: (taskId: string, newDate: Date) => void;
  onDelete: (taskId: string) => void;
  onBulkComplete: (taskIds: string[], disposition: string) => void;
  onBulkReschedule: (taskIds: string[], newDate: Date) => void;
  onBulkDelete: (taskIds: string[]) => void;
}

export function TaskQueue({
  tasks,
  onComplete,
  onReschedule,
  onDelete,
  onBulkComplete,
  onBulkReschedule,
  onBulkDelete,
}: TaskQueueProps) {
  const [modalTask, setModalTask] = useState<TaskItem | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState<ModalMode>(null);

  const pendingTasks = tasks
    .filter((t) => t.status === "pending")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Single-task modal
  const openModal = (task: TaskItem, mode: ModalMode) => {
    setModalTask(task);
    setModalMode(mode);
  };
  const closeModal = () => {
    setModalTask(null);
    setModalMode(null);
  };

  // Bulk selection
  const handleSelectAll = () => {
    if (selectedTasks.length === pendingTasks.length && pendingTasks.length > 0) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(pendingTasks.map((t) => t.id));
    }
  };
  const handleSelectTask = (id: string) => {
    setSelectedTasks((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  // Bulk modal
  const openBulkModal = (mode: ModalMode) => setBulkMode(mode);
  const closeBulkModal = () => setBulkMode(null);

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className={`flex-1 overflow-auto ${selectedTasks.length > 0 ? "pb-20" : ""}`}>
      <table className="w-full table-fixed min-w-[1200px]">
        <thead className="bg-muted/50 border-b border-border sticky top-0">
          <tr>
            <th className="w-[50px] px-6 py-4 text-left">
              <input
                type="checkbox"
                checked={
                  selectedTasks.length === pendingTasks.length &&
                  pendingTasks.length > 0
                }
                onChange={handleSelectAll}
                className="rounded border-border"
              />
            </th>
            <th
              className="w-[200px] px-6 py-4 text-left text-sm text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Contact
            </th>
            <th
              className="px-6 py-4 w-[100px] text-left text-sm text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Type
            </th>
            <th
              className="w-[200px] px-6 py-4 text-left text-sm text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Objective
            </th>
            <th
              className="w-[160px] px-6 py-4 text-left text-sm text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Due Date
            </th>
            <th
              className="w-[160px] px-6 py-4 text-left text-sm text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Source
            </th>
            <th
              className="w-[160px] px-6 py-4 text-left text-sm text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {pendingTasks.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-6 py-12 text-center text-muted-foreground"
              >
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>All caught up!</p>
              </td>
            </tr>
          ) : (
            pendingTasks.map((task) => {
              const isSelected = selectedTasks.includes(task.id);
              return (
                <tr
                  key={task.id}
                  className={`group hover:bg-muted/20 transition-colors ${isSelected ? "bg-muted/10" : ""}`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectTask(task.id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-foreground">{task.contactName}</div>
                    <div className="text-xs text-muted-foreground uppercase">
                      {task.contactStatus}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] rounded-full uppercase tracking-tighter">
                      {task.taskType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="text-sm truncate max-w-[200px]"
                      title={task.triggerContext}
                    >
                      {task.triggerContext}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatDate(task.dueDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {task.source}
                  </td>
                  <td className="px-6 py-4 text-left">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openModal(task, "complete")}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Complete"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal(task, "reschedule")}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Reschedule"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal(task, "delete")}
                        className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      </div>

      {selectedTasks.length > 0 && (
        <TaskBulkActionsBar
          selectedCount={selectedTasks.length}
          onComplete={() => openBulkModal("complete")}
          onReschedule={() => openBulkModal("reschedule")}
          onDelete={() => openBulkModal("delete")}
        />
      )}

      {/* Single-task action modal */}
      <TaskActionModal
        isOpen={modalMode !== null}
        mode={modalMode}
        task={modalTask}
        onComplete={(id, dis) => {
          onComplete(id, dis);
          closeModal();
        }}
        onReschedule={(id, date) => {
          onReschedule(id, date);
          closeModal();
        }}
        onDelete={(id) => {
          onDelete(id);
          closeModal();
        }}
        onClose={closeModal}
      />

      {/* Bulk action modal */}
      <TaskBulkActionModal
        isOpen={bulkMode !== null}
        mode={bulkMode}
        selectedCount={selectedTasks.length}
        onComplete={(dis) => {
          onBulkComplete(selectedTasks, dis);
          setSelectedTasks([]);
          closeBulkModal();
        }}
        onReschedule={(date) => {
          onBulkReschedule(selectedTasks, date);
          setSelectedTasks([]);
          closeBulkModal();
        }}
        onDelete={() => {
          onBulkDelete(selectedTasks);
          setSelectedTasks([]);
          closeBulkModal();
        }}
        onClose={closeBulkModal}
      />
    </div>
  );
}
