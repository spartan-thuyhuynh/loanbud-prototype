import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Phone,
  Mail,
  Plus,
  CheckCircle2,
  Calendar,
  Trash2,
  Clock,
} from "lucide-react";
import { useAppData } from "@/app/contexts/AppDataContext";
import { CreateTaskModal } from "@/app/components/email-workflows/CreateTaskModal";
import { TaskActionModal } from "@/app/components/email-workflows/TaskActionModal";
import type { TaskItem } from "@/app/types";

type TaskModalMode = "complete" | "reschedule" | "delete" | null;

const STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-100 text-blue-700",
  Draft: "bg-yellow-100 text-yellow-700",
  Submitted: "bg-purple-100 text-purple-700",
  "On Hold": "bg-orange-100 text-orange-700",
  Declined: "bg-red-100 text-red-700",
};

const EMAIL_STATUS_COLORS: Record<string, string> = {
  Sent: "bg-blue-100 text-blue-600",
  Delivered: "bg-green-100 text-green-600",
  Opened: "bg-purple-100 text-purple-600",
};

const SEQ_DAY_LABEL: Record<number, string> = {
  0: "Day 0",
  2: "Day 2",
  6: "Day 6",
  11: "Day 11",
  14: "Day 14",
};

function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatShortDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
}

export function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    contacts,
    emailHistory,
    taskItems,
    handleCompleteTask,
    handleRescheduleTask,
    handleDeleteTask,
  } = useAppData();

  const [activeTab, setActiveTab] = useState<"timeline" | "tasks">("timeline");
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [modalTask, setModalTask] = useState<TaskItem | null>(null);
  const [modalMode, setModalMode] = useState<TaskModalMode>(null);
  const [infoOpen, setInfoOpen] = useState(true);

  const contact = contacts.find((c) => c.id === id);

  if (!contact) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="mb-4">Contact not found.</p>
          <button onClick={() => navigate("/crm/contacts")} className="text-primary underline text-sm">
            Back to contacts
          </button>
        </div>
      </div>
    );
  }

  const contactEmails = emailHistory
    .filter((e) => e.contactId === contact.id)
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

  const contactTasks = taskItems
    .filter((t) => t.contactId === contact.id)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const pendingTasks = contactTasks.filter((t) => t.status !== "completed");

  const initials = `${contact.firstName[0] ?? ""}${contact.lastName[0] ?? ""}`.toUpperCase();

  const openModal = (task: TaskItem, mode: TaskModalMode) => {
    setModalTask(task);
    setModalMode(mode);
  };
  const closeModal = () => {
    setModalTask(null);
    setModalMode(null);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Back nav */}
      <div className="px-6 py-3 border-b border-border bg-card flex items-center gap-2">
        <button
          onClick={() => navigate("/crm/contacts")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Contacts
        </button>
      </div>

      {/* 3-column body */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT PANEL ── */}
        <aside className="w-72 shrink-0 border-r border-border bg-card flex flex-col overflow-y-auto">
          <div className="p-6 flex flex-col items-center text-center border-b border-border">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mb-3">
              <span className="text-xl font-semibold text-primary">{initials}</span>
            </div>
            <h2 className="text-lg font-semibold leading-tight">{contact.firstName} {contact.lastName}</h2>
            <span className="mt-1.5 text-xs px-2.5 py-0.5 bg-muted rounded-full text-muted-foreground">{contact.userType}</span>

            {contact.optedOut && (
              <div className="mt-3 w-full px-3 py-2 bg-destructive/10 border border-destructive/30 rounded-lg text-xs text-destructive text-center">
                Opted out — do not email
              </div>
            )}

            {/* Action icons */}
            <div className="flex gap-3 mt-4">
              <a
                href={`tel:${contact.phone}`}
                className="flex flex-col items-center gap-1 group"
                title="Call"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center group-hover:opacity-80 transition-opacity">
                  <Phone className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-[10px] text-muted-foreground">Call</span>
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="flex flex-col items-center gap-1 group"
                title="Email"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center group-hover:opacity-80 transition-opacity">
                  <Mail className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-[10px] text-muted-foreground">Mail</span>
              </a>
              <button
                onClick={() => setShowCreateTask(true)}
                className="flex flex-col items-center gap-1 group"
                title="Add task"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center group-hover:opacity-80 transition-opacity">
                  <Plus className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-[10px] text-muted-foreground">Task</span>
              </button>
            </div>
          </div>

          {/* Contact info accordion */}
          <div className="p-5">
            <button
              onClick={() => setInfoOpen((v) => !v)}
              className="flex items-center justify-between w-full mb-3"
            >
              <span className="text-sm font-semibold">Contact Info</span>
              <span className="text-muted-foreground text-xs">{infoOpen ? "▲" : "▼"}</span>
            </button>

            {infoOpen && (
              <div className="space-y-3">
                <InfoRow label="Phone" value={contact.phone} />
                <InfoRow label="Email" value={contact.email} />
                <InfoRow label="Listing" value={contact.listingName} />
                <InfoRow
                  label="Status"
                  value={
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[contact.listingStatus] ?? "bg-muted text-muted-foreground"}`}>
                      {contact.listingStatus}
                    </span>
                  }
                />
                <InfoRow label="Created" value={formatShortDate(contact.createAt)} />
                <InfoRow label="Opted Out" value={contact.optedOut ? "Yes" : "No"} />
              </div>
            )}
          </div>
        </aside>

        {/* ── CENTER PANEL ── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="border-b border-border bg-card px-6 flex gap-6">
            {(["timeline", "tasks"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm capitalize border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "timeline" ? "Timeline" : `Tasks (${contactTasks.length})`}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* TIMELINE TAB */}
            {activeTab === "timeline" && (
              <div>
                {contactEmails.length === 0 ? (
                  <EmptyState icon={Mail} message="No emails sent to this contact yet." />
                ) : (
                  <div className="space-y-2">
                    {contactEmails.map((email) => (
                      <div key={email.id} className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl">
                        <div className={`mt-0.5 shrink-0 text-[10px] px-2 py-1 rounded-full font-medium uppercase tracking-wide ${EMAIL_STATUS_COLORS[email.status] ?? "bg-muted text-muted-foreground"}`}>
                          {email.status}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{email.subject}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            From: {email.senderIdentity}
                          </div>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          {SEQ_DAY_LABEL[email.sequenceDay] && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                              {SEQ_DAY_LABEL[email.sequenceDay]}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">{formatDate(email.sentAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TASKS TAB */}
            {activeTab === "tasks" && (
              <div>
                {contactTasks.length === 0 ? (
                  <EmptyState icon={CheckCircle2} message="No tasks for this contact." />
                ) : (
                  <div className="space-y-2">
                    {contactTasks.map((task) => {
                      const isOverdue = task.status !== "completed" && new Date(task.dueDate) < new Date();
                      const isCompleted = task.status === "completed";
                      return (
                        <div
                          key={task.id}
                          className={`flex items-start gap-4 p-4 bg-card border rounded-xl transition-colors ${
                            isCompleted ? "border-border opacity-60" : isOverdue ? "border-red-200 bg-red-50/30" : "border-border"
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">
                            <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wide font-medium ${
                              isCompleted ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                            }`}>
                              {task.taskType}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            {task.triggerContext && (
                              <div className="text-sm text-foreground line-clamp-2">{task.triggerContext}</div>
                            )}
                            {task.notes && (
                              <div className="text-xs text-muted-foreground italic mt-0.5 line-clamp-1">VM: {task.notes}</div>
                            )}
                            <div className="flex items-center gap-1.5 mt-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className={`text-xs ${isOverdue && !isCompleted ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                                {formatDate(task.dueDate)}
                              </span>
                              {isOverdue && !isCompleted && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded uppercase tracking-tight">Overdue</span>
                              )}
                              {isCompleted && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded uppercase tracking-tight">Done</span>
                              )}
                            </div>
                          </div>
                          {!isCompleted && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => openModal(task, "complete")} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Complete">
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => openModal(task, "reschedule")} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Reschedule">
                                <Calendar className="w-4 h-4" />
                              </button>
                              <button onClick={() => openModal(task, "delete")} className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* ── RIGHT PANEL ── */}
        <aside className="w-72 shrink-0 border-l border-border bg-card flex flex-col overflow-y-auto">

          {/* Linked Listing */}
          <div className="p-5 border-b border-border">
            <h3 className="text-sm font-semibold mb-3">Linked Listing</h3>
            <div className="p-4 border border-border rounded-xl bg-background">
              <div className="text-sm font-medium">{contact.listingName}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[contact.listingStatus] ?? "bg-muted text-muted-foreground"}`}>
                  {contact.listingStatus}
                </span>
                {contact.optedOut && (
                  <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded-full">Opted Out</span>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="p-5 flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Upcoming Tasks</h3>
              <button
                onClick={() => setShowCreateTask(true)}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Task
              </button>
            </div>

            {pendingTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No upcoming tasks</p>
            ) : (
              <div className="space-y-2">
                {pendingTasks.map((task) => {
                  const isOverdue = new Date(task.dueDate) < new Date();
                  return (
                    <div key={task.id} className={`p-3 border rounded-lg ${isOverdue ? "border-red-200 bg-red-50/30" : "border-border bg-background"}`}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full uppercase tracking-wide">{task.taskType}</span>
                        <span className={`text-[10px] ${isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                      {task.triggerContext && (
                        <div className="text-xs text-foreground line-clamp-2">{task.triggerContext}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        preselectedContactId={contact.id}
      />

      <TaskActionModal
        isOpen={modalMode !== null}
        mode={modalMode}
        task={modalTask}
        onComplete={(taskId, dis) => { handleCompleteTask(taskId, dis); closeModal(); }}
        onReschedule={(taskId, date) => { handleRescheduleTask(taskId, date); closeModal(); }}
        onDelete={(taskId) => { handleDeleteTask(taskId); closeModal(); }}
        onClose={closeModal}
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">{label}</div>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Icon className="w-10 h-10 mb-3 opacity-20" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
