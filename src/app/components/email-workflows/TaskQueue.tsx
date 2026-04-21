import { useState, useRef, useEffect } from "react";
import { Pencil, CheckCircle2, Trash2, Plus, ArrowUp, ArrowDown, Search, BarChart3, Phone, Mail, X } from "lucide-react";
import { Link } from "react-router";
import type { TaskItem } from "@/app/types";
import { useAppData } from "@/app/contexts/AppDataContext";
import { TaskActionModal } from "./TaskActionModal";
import { TaskBulkActionsBar } from "./TaskBulkActionsBar";
import { TaskBulkActionModal } from "./TaskBulkActionModal";
import { CreateTaskModal } from "./CreateTaskModal";
import { QuickEmailModal } from "./QuickEmailModal";

type ModalMode = "complete" | "reschedule" | "delete" | null;
type DueDateFilter = "all" | "today" | "this-week" | "overdue";
type SortField = "dueDate" | "name" | "source";

interface TaskQueueProps {
  tasks?: TaskItem[];
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  viewMode?: "list" | "assignee";
  onViewModeToggle?: () => void;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isWithinDays(date: Date, days: number) {
  const now = new Date();
  const limit = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return date >= now && date <= limit;
}

// ── Call Dialer Popover ───────────────────────────────────────────
function CallDialer({ phone, name, onClose }: { phone: string; name: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const digits = ["1","2","3","4","5","6","7","8","9","*","0","#"];
  const [input, setInput] = useState(phone.replace(/\D/g, ""));

  return (
    <div ref={ref} className="absolute z-50 bg-card border border-border rounded-2xl shadow-xl p-5 w-64 top-8 left-0">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-muted-foreground truncate">{name}</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
      </div>
      <div className="text-center text-lg font-semibold tracking-widest mb-3 bg-muted/40 rounded-xl py-2 px-3 min-h-[2.5rem]">
        {input || <span className="text-muted-foreground text-sm">Enter number</span>}
      </div>
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {digits.map((d) => (
          <button
            key={d}
            onClick={() => setInput((v) => v + d)}
            className="py-2.5 rounded-xl text-sm font-medium bg-muted/50 hover:bg-muted transition-colors"
          >
            {d}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <a
          href={`tel:${input}`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Phone className="w-4 h-4" /> Call
        </a>
        <button
          onClick={() => setInput((v) => v.slice(0, -1))}
          className="px-3 py-2.5 bg-muted hover:bg-muted/80 rounded-xl text-sm text-muted-foreground transition-colors"
        >
          ⌫
        </button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────
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

  const allTasks = tasksProp ?? taskItems;
  const contactById = new Map(contacts.map((c) => [c.id, c]));

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalTask, setModalTask] = useState<TaskItem | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState<ModalMode>(null);

  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilter>("all");
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortField, setSortField] = useState<SortField>("dueDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Popover state: taskId → "phone" only (email uses full modal)
  const [openPopover, setOpenPopover] = useState<{ taskId: string; type: "phone" } | null>(null);
  const [emailModal, setEmailModal] = useState<{ email: string; name: string } | null>(null);

  const now = new Date();

  const filtered = allTasks.filter((t) => {
    if (!showCompleted && t.status === "completed") return false;
    const due = new Date(t.dueDate);
    if (dueDateFilter === "today" && !isSameDay(due, now)) return false;
    if (dueDateFilter === "this-week" && !isWithinDays(due, 7)) return false;
    if (dueDateFilter === "overdue" && !(due < now && t.status !== "completed")) return false;
    return true;
  });

  const isOverdue = (t: TaskItem) => t.status === "overdue" || (new Date(t.dueDate) < now && t.status !== "completed");

  const comparator = (a: TaskItem, b: TaskItem): number => {
    if (sortField === "dueDate") return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (sortField === "name") return a.contactName.localeCompare(b.contactName);
    return (a.source ?? "").localeCompare(b.source ?? "");
  };

  const overdueTasks = filtered.filter(isOverdue).sort(comparator);
  const nonOverdueTasks = filtered.filter((t) => !isOverdue(t)).sort(comparator);
  const pendingTasks = [
    ...(sortDir === "asc" ? overdueTasks : [...overdueTasks].reverse()),
    ...(sortDir === "asc" ? nonOverdueTasks : [...nonOverdueTasks].reverse()),
  ];

  const openModal = (task: TaskItem, mode: ModalMode) => { setModalTask(task); setModalMode(mode); };
  const closeModal = () => { setModalTask(null); setModalMode(null); };

  const handleSelectAll = () => {
    if (selectedTasks.length === pendingTasks.length && pendingTasks.length > 0) setSelectedTasks([]);
    else setSelectedTasks(pendingTasks.map((t) => t.id));
  };
  const handleSelectTask = (id: string) => {
    setSelectedTasks((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const openBulkModal = (mode: ModalMode) => setBulkMode(mode);
  const closeBulkModal = () => setBulkMode(null);

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
    setSelectedTasks([]);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />;
  };

  const dueDateChips: { key: DueDateFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "this-week", label: "This Week" },
    { key: "overdue", label: "Overdue" },
  ];

  const dueDateCounts: Record<DueDateFilter, number> = {
    all: allTasks.filter((t) => t.status !== "completed").length,
    today: allTasks.filter((t) => t.status !== "completed" && isSameDay(new Date(t.dueDate), now)).length,
    "this-week": allTasks.filter((t) => t.status !== "completed" && isWithinDays(new Date(t.dueDate), 7)).length,
    overdue: allTasks.filter((t) => isOverdue(t)).length,
  };

  const togglePopover = (taskId: string) => {
    setOpenPopover((prev) =>
      prev?.taskId === taskId ? null : { taskId, type: "phone" }
    );
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Page header */}
      <div className="border-b border-border bg-card px-8 py-5 shrink-0">
        <h1 className="text-3xl font-semibold text-foreground">Tasks</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{allTasks.length} tasks</p>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
      {/* Filter row: due date chips + show completed + New Task */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-border gap-4 shrink-0">
        <div className="flex items-center gap-1">
          {dueDateChips.map(({ key, label }) => {
            const active = dueDateFilter === key;
            const count = dueDateCounts[key];
            const isOverdueChip = key === "overdue";
            return (
              <button
                key={key}
                onClick={() => { setDueDateFilter(key); setSelectedTasks([]); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  active && isOverdueChip
                    ? "bg-red-50 text-red-600 border-red-200"
                    : active
                    ? "bg-muted text-foreground border-border"
                    : "text-muted-foreground hover:bg-muted/60 border-border"
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`text-[11px] font-semibold tabular-nums ${active && isOverdueChip ? "text-red-400" : "text-muted-foreground"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => { setShowCompleted(e.target.checked); setSelectedTasks([]); }}
              className="rounded border-border"
            />
            Show completed
          </label>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            New Task
          </button>
        </div>
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

      <div className={`flex-1 overflow-auto ${selectedTasks.length > 0 ? "pb-20" : ""}`}>
        <table className="w-full table-fixed min-w-[1500px]">
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
              <th className="w-[110px] px-4 py-4 text-left text-sm font-semibold text-muted-foreground">Actions</th>
              <th
                className="w-[150px] px-4 py-4 text-left text-sm font-semibold text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                onClick={() => toggleSort("dueDate")}
              >
                <div className="flex items-center gap-1.5">Due Date <SortIcon field="dueDate" /></div>
              </th>
              <th
                className="w-[190px] px-4 py-4 text-left text-sm font-semibold text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                onClick={() => toggleSort("name")}
              >
                <div className="flex items-center gap-1.5">Contact <SortIcon field="name" /></div>
              </th>
              <th className="w-[160px] px-4 py-4 text-left text-sm font-semibold text-muted-foreground">Phone</th>
              <th className="w-[190px] px-4 py-4 text-left text-sm font-semibold text-muted-foreground">Email</th>
              <th className="w-[90px] px-4 py-4 text-left text-sm font-semibold text-muted-foreground">Type</th>
              <th
                className="w-[170px] px-4 py-4 text-left text-sm font-semibold text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                onClick={() => toggleSort("source")}
              >
                <div className="flex items-center gap-1.5">Source <SortIcon field="source" /></div>
              </th>
              <th className="w-[130px] px-4 py-4 text-left text-sm font-semibold text-muted-foreground">Assignee</th>
              <th className="w-[190px] px-4 py-4 text-left text-sm font-semibold text-muted-foreground">Objective / Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pendingTasks.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-muted-foreground">
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
                const overdueFlag = isOverdue(task);
                const showPhone = openPopover?.taskId === task.id;
                return (
                  <tr
                    key={task.id}
                    className={`group hover:bg-muted/20 transition-colors ${isSelected ? "bg-muted/10" : ""}`}
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
                      {task.status !== "completed" && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => openModal(task, "complete")} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Complete">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => openModal(task, "reschedule")} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => openModal(task, "delete")} className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {task.status === "completed" && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] rounded-full uppercase tracking-tighter">Done</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">{formatDate(task.dueDate)}</div>
                      {overdueFlag && task.status !== "completed" && (
                        <span className="mt-1 inline-block text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded uppercase tracking-tighter">Overdue</span>
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
                      <span className="shrink-0 text-[10px] px-1.5 py-0.5 bg-muted rounded uppercase tracking-tighter text-muted-foreground">
                        {task.contactStatus}
                      </span>
                    </td>
                    {/* Phone cell with dialer popover */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="relative">
                        {contact && phone !== "—" ? (
                          <button
                            onClick={() => togglePopover(task.id)}
                            className="flex items-center gap-1.5 text-sm text-foreground hover:text-primary transition-colors group/phone"
                          >
                            <Phone className="w-3.5 h-3.5 text-muted-foreground group-hover/phone:text-primary" />
                            {phone}
                          </button>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                        {showPhone && contact && (
                          <CallDialer
                            phone={phone}
                            name={task.contactName}
                            onClose={() => setOpenPopover(null)}
                          />
                        )}
                      </div>
                    </td>
                    {/* Email cell — opens full QuickEmailModal */}
                    <td className="px-4 py-4">
                      {contact && email !== "—" ? (
                        <button
                          onClick={() => setEmailModal({ email, name: task.contactName })}
                          className="flex items-center gap-1.5 text-sm text-foreground hover:text-primary transition-colors group/email truncate max-w-full"
                          title={email}
                        >
                          <Mail className="w-3.5 h-3.5 text-muted-foreground group-hover/email:text-primary shrink-0" />
                          <span className="truncate">{email}</span>
                        </button>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] rounded-full uppercase tracking-tighter">
                        {task.taskType}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {task.source ? (
                        <>
                          <div className="text-sm text-foreground truncate" title={task.source}>{task.source}</div>
                          {task.ruleName && <div className="text-xs text-muted-foreground truncate">{task.ruleName}</div>}
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {task.assignee ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-semibold text-primary">{task.assignee.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="text-xs text-muted-foreground truncate" title={task.assignee}>{task.assignee}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {task.triggerContext && (
                        <div className="text-sm text-foreground line-clamp-2" title={task.triggerContext}>{task.triggerContext}</div>
                      )}
                      {task.notes && (
                        <div className="mt-1 text-xs text-muted-foreground italic line-clamp-2">VM: {task.notes}</div>
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
        onComplete={(id, dis, note) => { handleCompleteTask(id, dis, note); closeModal(); }}
        onReschedule={(id, date, assignee, objective) => { handleRescheduleTask(id, date, assignee, objective); closeModal(); }}
        onDelete={(id) => { handleDeleteTask(id); closeModal(); }}
        onClose={closeModal}
      />

      <TaskBulkActionModal
        isOpen={bulkMode !== null}
        mode={bulkMode}
        selectedCount={selectedTasks.length}
        onComplete={(dis, note) => { handleBulkCompleteTask(selectedTasks, dis, note); setSelectedTasks([]); closeBulkModal(); }}
        onReschedule={(date) => { handleBulkRescheduleTask(selectedTasks, date); setSelectedTasks([]); closeBulkModal(); }}
        onDelete={() => { handleBulkDeleteTask(selectedTasks); setSelectedTasks([]); closeBulkModal(); }}
        onClose={closeBulkModal}
      />

      <CreateTaskModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />

      {emailModal && (
        <QuickEmailModal
          toEmail={emailModal.email}
          toName={emailModal.name}
          onClose={() => setEmailModal(null)}
        />
      )}
      </div>
    </div>
  );
}
