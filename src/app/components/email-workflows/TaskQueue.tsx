import { useState } from "react";
import { Calendar, CheckCircle2, Trash2, Plus } from "lucide-react";
import { Link } from "react-router";
import type { TaskItem } from "@/app/types";
import { useAppData } from "@/app/contexts/AppDataContext";
import { TaskActionModal } from "./TaskActionModal";
import { TaskBulkActionsBar } from "./TaskBulkActionsBar";
import { TaskBulkActionModal } from "./TaskBulkActionModal";
import { CreateTaskModal } from "./CreateTaskModal";

type ModalMode = "complete" | "reschedule" | "delete" | null;

interface TaskQueueProps {
  // Optional: pass a pre-filtered list (e.g. from Overview). Falls back to all taskItems.
  tasks?: TaskItem[];
}

export function TaskQueue({ tasks: tasksProp }: TaskQueueProps) {
  const {
    contacts,
    taskItems,
    handleCompleteTask,
    handleRescheduleTask,
    handleDeleteTask,
    handleBulkCompleteTask,
    handleBulkRescheduleTask,
    handleBulkDeleteTask,
  } = useAppData();

  const tasks = tasksProp ?? taskItems;

  const contactById = new Map(contacts.map((c) => [c.id, c]));

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [modalTask, setModalTask] = useState<TaskItem | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState<ModalMode>(null);

  const pendingTasks = tasks
    .filter((t) => t.status === "pending")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const openModal = (task: TaskItem, mode: ModalMode) => {
    setModalTask(task);
    setModalMode(mode);
  };
  const closeModal = () => {
    setModalTask(null);
    setModalMode(null);
  };

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
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <span className="text-sm text-muted-foreground">{pendingTasks.length} pending task{pendingTasks.length !== 1 ? "s" : ""}</span>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          New Task
        </button>
      </div>

      <div className={`flex-1 overflow-auto ${selectedTasks.length > 0 ? "pb-20" : ""}`}>
        <table className="w-full table-fixed min-w-[1400px]">
          <thead className="bg-muted/50 border-b border-border sticky top-0">
            <tr>
              <th className="w-[50px] px-4 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedTasks.length === pendingTasks.length && pendingTasks.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-border"
                />
              </th>
              <th className="w-[160px] px-4 py-4 text-left text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>Name</th>
              <th className="w-[140px] px-4 py-4 text-left text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>Phone</th>
              <th className="w-[160px] px-4 py-4 text-left text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>Listing</th>
              <th className="w-[110px] px-4 py-4 text-left text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>Status</th>
              <th className="w-[100px] px-4 py-4 text-left text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>Type</th>
              <th className="w-[220px] px-4 py-4 text-left text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>Objective / VM Notes</th>
              <th className="w-[150px] px-4 py-4 text-left text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>Due Date</th>
              <th className="w-[110px] px-4 py-4 text-left text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pendingTasks.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p>All caught up!</p>
                </td>
              </tr>
            ) : (
              pendingTasks.map((task) => {
                const isSelected = selectedTasks.includes(task.id);
                const contact = contactById.get(task.contactId);
                const phone = contact?.phone ?? "—";
                const listingName = contact?.listingName ?? "—";
                const isOverdue = task.status === "overdue" || new Date(task.dueDate) < new Date();
                return (
                  <tr key={task.id} className={`group hover:bg-muted/20 transition-colors ${isSelected ? "bg-muted/10" : ""} ${isOverdue ? "bg-red-50/40" : ""}`}>
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectTask(task.id)}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <Link to={`/crm/contacts/${task.contactId}`} className="text-sm font-medium text-primary hover:underline truncate" title={task.contactName} onClick={(e) => e.stopPropagation()}>{task.contactName}</Link>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-muted-foreground">{phone}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-muted-foreground truncate" title={listingName}>{listingName}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded uppercase tracking-tighter text-muted-foreground whitespace-nowrap">{task.contactStatus}</span>
                      {isOverdue && (
                        <div className="mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded uppercase tracking-tighter">Overdue</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] rounded-full uppercase tracking-tighter">{task.taskType}</span>
                    </td>
                    <td className="px-4 py-4">
                      {task.triggerContext && (
                        <div className="text-sm text-foreground line-clamp-2" title={task.triggerContext}>{task.triggerContext}</div>
                      )}
                      {task.notes && (
                        <div className="mt-1 text-xs text-muted-foreground italic line-clamp-2" title={task.notes}>
                          VM: {task.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground whitespace-nowrap">{formatDate(task.dueDate)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openModal(task, "complete")} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Complete">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => openModal(task, "reschedule")} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Reschedule">
                          <Calendar className="w-4 h-4" />
                        </button>
                        <button onClick={() => openModal(task, "delete")} className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
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

      <TaskActionModal
        isOpen={modalMode !== null}
        mode={modalMode}
        task={modalTask}
        onComplete={(id, dis) => { handleCompleteTask(id, dis); closeModal(); }}
        onReschedule={(id, date) => { handleRescheduleTask(id, date); closeModal(); }}
        onDelete={(id) => { handleDeleteTask(id); closeModal(); }}
        onClose={closeModal}
      />

      <TaskBulkActionModal
        isOpen={bulkMode !== null}
        mode={bulkMode}
        selectedCount={selectedTasks.length}
        onComplete={(dis) => { handleBulkCompleteTask(selectedTasks, dis); setSelectedTasks([]); closeBulkModal(); }}
        onReschedule={(date) => { handleBulkRescheduleTask(selectedTasks, date); setSelectedTasks([]); closeBulkModal(); }}
        onDelete={() => { handleBulkDeleteTask(selectedTasks); setSelectedTasks([]); closeBulkModal(); }}
        onClose={closeBulkModal}
      />

      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
