import { useState } from "react";
import { Calendar, CheckCircle2, Trash2, Plus, ArrowUp, ArrowDown, ArrowUpDown, Search, BarChart3 } from "lucide-react";
import { Link } from "react-router";
import type { TaskItem } from "@/app/types";
import { useAppData } from "@/app/contexts/AppDataContext";
import { TaskActionModal } from "./TaskActionModal";
import { TaskBulkActionsBar } from "./TaskBulkActionsBar";
import { TaskBulkActionModal } from "./TaskBulkActionModal";
import { CreateTaskModal } from "./CreateTaskModal";

type ModalMode = "complete" | "reschedule" | "delete" | null;

interface TaskQueueProps {
  tasks?: TaskItem[];
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  viewMode?: "list" | "assignee";
  onViewModeToggle?: () => void;
}

export function TaskQueue({ tasks: tasksProp, searchTerm, onSearchChange, viewMode, onViewModeToggle }: TaskQueueProps) {
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
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "overdue">("pending");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const pendingTasks = tasks
    .filter((t) => statusFilter === "all" || t.status === statusFilter)
    .sort((a, b) => {
      const diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      return sortDir === "asc" ? diff : -diff;
    });

  const openModal = (task: TaskItem, mode: ModalMode) => {
    setModalTask(task);
    setModalMode(mode);
  };
  const closeModal = () => {
    setModalTask(null);
    setModalMode(null);
  };

  const handleSelectAll = () => {
    if (
      selectedTasks.length === pendingTasks.length &&
      pendingTasks.length > 0
    ) {
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
      {/* Header row 1: status chips + New Task */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border gap-4">
        <div className="flex items-center gap-1">
          {(["all", "pending", "overdue", "completed"] as const).map((s) => {
            const count = s === "all" ? tasks.length : tasks.filter((t) => t.status === s).length;
            const active = statusFilter === s;
            const chipStyle: Record<string, { active: string; inactive: string }> = {
              all:       { active: "bg-muted text-foreground border-border",                    inactive: "text-muted-foreground hover:bg-muted/60 border-border" },
              pending:   { active: "bg-blue-50 text-blue-700 border-blue-200",                inactive: "text-muted-foreground hover:bg-muted/60 border-border" },
              overdue:   { active: "bg-red-50 text-red-600 border-red-200",                   inactive: "text-muted-foreground hover:bg-muted/60 border-border" },
              completed: { active: "bg-green-50 text-green-700 border-green-200",             inactive: "text-muted-foreground hover:bg-muted/60 border-border" },
            };
            const countStyle: Record<string, string> = {
              all:       active ? "text-muted-foreground"  : "text-muted-foreground",
              pending:   active ? "text-blue-500"      : "text-muted-foreground",
              overdue:   active ? "text-red-400"       : "text-muted-foreground",
              completed: active ? "text-green-500"     : "text-muted-foreground",
            };
            return (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setSelectedTasks([]); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${active ? chipStyle[s].active : chipStyle[s].inactive}`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
                <span className={`text-[11px] font-semibold tabular-nums ${countStyle[s]}`}>{count}</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          New Task
        </button>
      </div>

      {/* Header row 2: search + view toggle (only when wired from parent) */}
      {onSearchChange && (
        <div className="flex items-center gap-3 px-5 py-2.5 border-b border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {onViewModeToggle && (
            <button
              onClick={onViewModeToggle}
              className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg hover:bg-muted text-xs font-medium transition-colors shrink-0"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              {viewMode === "list" ? "By Assignee" : "List View"}
            </button>
          )}
        </div>
      )}

      <div
        className={`flex-1 overflow-auto ${selectedTasks.length > 0 ? "pb-20" : ""}`}
      >
        <table className="w-full table-fixed min-w-[1400px]">
          <thead className="bg-muted/50 border-b border-border sticky top-0">
            <tr>
              <th className="w-[50px] px-4 py-4 text-left">
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
                className="w-[110px] px-4 py-4 text-left text-sm text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                Actions
              </th>
              <th
                className="w-[150px] px-4 py-4 text-left text-sm text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                onClick={() => setSortDir((d) => d === "asc" ? "desc" : "asc")}
              >
                <div className="flex items-center gap-1.5">
                  Due Date
                  {sortDir === "asc"
                    ? <ArrowUp className="w-3.5 h-3.5 text-primary" />
                    : sortDir === "desc"
                      ? <ArrowDown className="w-3.5 h-3.5 text-primary" />
                      : <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />}
                </div>
              </th>
              <th
                className="w-[220px] px-4 py-4 text-left text-sm text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                Name / Listing
              </th>
              <th
                className="w-[140px] px-4 py-4 text-left text-sm text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                Phone
              </th>
              <th
                className="w-[180px] px-4 py-4 text-left text-sm text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                Email
              </th>
              <th
                className="w-[110px] px-4 py-4 text-left text-sm text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                Status
              </th>
              <th
                className="w-[100px] px-4 py-4 text-left text-sm text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                Type
              </th>
              <th
                className="w-[220px] px-4 py-4 text-left text-sm text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                Objective / VM Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pendingTasks.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p>All caught up!</p>
                </td>
              </tr>
            ) : (
              pendingTasks.map((task) => {
                const isSelected = selectedTasks.includes(task.id);
                const contact = contactById.get(task.contactId);
                const phone = contact?.phone ?? "—";
                const email = contact?.email ?? "—";
                const listingName = contact?.listingName ?? "—";
                const isOverdue =
                  task.status === "overdue" ||
                  new Date(task.dueDate) < new Date();
                return (
                  <tr
                    key={task.id}
                    className={`group hover:bg-muted/20 transition-colors ${isSelected ? "bg-muted/10" : ""} }`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectTask(task.id)}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
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
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">
                        {formatDate(task.dueDate)}
                      </div>
                      {isOverdue && (
                        <span className="mt-1 inline-block text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded uppercase tracking-tighter">
                          Overdue
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        to={`/crm/contacts/${task.contactId}`}
                        className="text-sm font-medium text-primary hover:underline truncate block"
                        title={task.contactName}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {task.contactName}
                      </Link>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span
                          className="text-xs text-muted-foreground truncate"
                          title={listingName}
                        >
                          {listingName}
                        </span>
                        <span className="shrink-0 text-[10px] px-1.5 py-0.5 bg-muted rounded uppercase tracking-tighter text-muted-foreground">
                          {task.contactStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-muted-foreground">
                        {phone}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div
                        className="text-sm text-muted-foreground truncate"
                        title={email}
                      >
                        {email}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] rounded-full uppercase tracking-tighter">
                        {task.taskType}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {task.triggerContext && (
                        <div
                          className="text-sm text-foreground line-clamp-2"
                          title={task.triggerContext}
                        >
                          {task.triggerContext}
                        </div>
                      )}
                      {task.notes && (
                        <div
                          className="mt-1 text-xs text-muted-foreground italic line-clamp-2"
                          title={task.notes}
                        >
                          VM: {task.notes}
                        </div>
                      )}
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
        onComplete={(id, dis) => {
          handleCompleteTask(id, dis);
          closeModal();
        }}
        onReschedule={(id, date) => {
          handleRescheduleTask(id, date);
          closeModal();
        }}
        onDelete={(id) => {
          handleDeleteTask(id);
          closeModal();
        }}
        onClose={closeModal}
      />

      <TaskBulkActionModal
        isOpen={bulkMode !== null}
        mode={bulkMode}
        selectedCount={selectedTasks.length}
        onComplete={(dis) => {
          handleBulkCompleteTask(selectedTasks, dis);
          setSelectedTasks([]);
          closeBulkModal();
        }}
        onReschedule={(date) => {
          handleBulkRescheduleTask(selectedTasks, date);
          setSelectedTasks([]);
          closeBulkModal();
        }}
        onDelete={() => {
          handleBulkDeleteTask(selectedTasks);
          setSelectedTasks([]);
          closeBulkModal();
        }}
        onClose={closeBulkModal}
      />

      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
