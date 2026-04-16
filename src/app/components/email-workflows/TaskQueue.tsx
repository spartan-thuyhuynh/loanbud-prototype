import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  MessageSquare,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { TaskItem } from "@/app/types";
import React from "react";

interface TaskQueueProps {
  tasks: TaskItem[];
  onComplete: (taskId: string, disposition: string) => void;
  onReschedule: (taskId: string, newDate: Date) => void;
  onDelete: (taskId: string) => void;
}

const dispositions = ["Answered", "VM Left", "No Answer", "Not Needed"];

export function TaskQueue({
  tasks,
  onComplete,
  onReschedule,
  onDelete,
}: TaskQueueProps) {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showReschedule, setShowReschedule] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");

  const pendingTasks = tasks.filter((t) => t.status === "pending");

  const handleReschedule = (taskId: string) => {
    if (rescheduleDate) {
      onReschedule(taskId, new Date(rescheduleDate));
      setShowReschedule(null);
      setRescheduleDate("");
    }
  };

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
    <div className="flex flex-col h-full bg-card overflow-x-auto">
      <table className="w-full table-fixed min-w-[1300px] ">
        <thead className="bg-muted/50 border-b border-border sticky top-0">
          <tr>
            <th className="w-[50px] px-6 py-4 text-left"></th>
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
            pendingTasks
              .sort(
                (a, b) =>
                  new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
              )
              .map((task) => {
                const isExpanded = selectedTask === task.id;
                const isRescheduling = showReschedule === task.id;
                const _overdue = new Date(task.dueDate) < new Date();

                return (
                  <React.Fragment key={task.id}>
                    {/* Main Row */}
                    <tr
                      className={`group hover:bg-muted/30 transition-colors }`}
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            setSelectedTask(isExpanded ? null : task.id)
                          }
                          className="p-1 hover:bg-muted rounded"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className=" text-foreground">
                          {task.contactName}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">
                          {task.contactStatus}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-[10px]  rounded-full uppercase tracking-tighter">
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
                      <td className="px-6 py-4 text-sm text-muted-foreground w-600">
                        {task.source}
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedTask(task.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Complete"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowReschedule(task.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Reschedule"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(task.id)}
                            className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Section (Action UI) */}
                    {(isExpanded || isRescheduling) && (
                      <tr className="bg-muted/20">
                        <td
                          colSpan={7}
                          className="px-12 py-6 border-l-4 border-primary"
                        >
                          {isRescheduling ? (
                            <div className="flex items-end gap-4 animate-in slide-in-from-left-2 transition-all">
                              <div className="flex-1 max-w-sm">
                                <label className="block text-[10px]  uppercase text-muted-foreground mb-1.5">
                                  New Schedule Date
                                </label>
                                <input
                                  type="datetime-local"
                                  value={rescheduleDate}
                                  onChange={(e) =>
                                    setRescheduleDate(e.target.value)
                                  }
                                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none ring-primary/20 focus:ring-2"
                                />
                              </div>
                              <button
                                onClick={() => handleReschedule(task.id)}
                                className="px-6 py-2 bg-primary text-white rounded-lg text-sm  shadow-sm"
                              >
                                Update Schedule
                              </button>
                              <button
                                onClick={() => setShowReschedule(null)}
                                className="px-4 py-2 text-sm font-medium hover:underline"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in transition-all">
                              <div>
                                <h4 className="text-[10px]  uppercase text-primary tracking-widest mb-3">
                                  Complete Task
                                </h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Select the call outcome to log this activity:
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                  {dispositions.map((dis) => (
                                    <button
                                      key={dis}
                                      onClick={() => onComplete(task.id, dis)}
                                      className="px-4 py-3 border border-border rounded-xl text-xs  hover:bg-primary hover:text-white hover:border-primary transition-all text-left flex justify-between items-center group"
                                    >
                                      {dis}
                                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                              {task.notes && (
                                <div className="bg-background/50 p-4 rounded-xl border border-border">
                                  <div className="flex items-center gap-2 mb-2 text-primary">
                                    <MessageSquare className="w-4 h-4" />
                                    <span className="text-[10px]  uppercase tracking-widest">
                                      Scripts & Notes
                                    </span>
                                  </div>
                                  <p className="text-sm italic text-foreground leading-relaxed">
                                    "{task.notes}"
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
          )}
        </tbody>
      </table>
    </div>
  );
}

// Minimal ArrowRight for the dispositions
function ArrowRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
