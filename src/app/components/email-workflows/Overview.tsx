import { useState } from "react";
import { useNavigate } from "react-router";
import { Calendar, Mail, BarChart3, Zap, ChevronRight } from "lucide-react";
import { cn } from "@/app/components/ui/utils";

import type { TaskItem } from "@/app/types";
import { useAppData } from "@/app/contexts/AppDataContext";
import { TaskQueue } from "./TaskQueue";

export function Overview() {
  const navigate = useNavigate();
  const { taskItems: tasks, campaigns } = useAppData();
  // --- State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "assignee">("list");

  // --- Logic ---
  const assignees = Array.from(new Set(tasks.map((t) => t.assignee)));

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.source.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const tasksByAssignee = assignees.reduce(
    (acc, assignee) => {
      acc[assignee] = filteredTasks.filter((t) => t.assignee === assignee);
      return acc;
    },
    {} as Record<string, TaskItem[]>,
  );

  const getWorkloadLevel = (taskCount: number) => {
    if (taskCount >= 10) return { label: "High", color: "text-red-600" };
    if (taskCount >= 5) return { label: "Medium", color: "text-amber-600" };
    return { label: "Low", color: "text-green-600" };
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-auto font-sans">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6 sticky top-0 z-10">
        <h2 className="text-3xl font-semibold">Overview</h2>
        <p className="text-muted-foreground mt-1">
          Monitor active campaigns and manage follow-up workload
        </p>
      </div>

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Campaign Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Campaign Status</h3>
              <button
                onClick={() => navigate("/email-workflows/campaigns")}
                className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex gap-3">
              {campaigns.slice(0, 4).map((campaign) => {
                const icon =
                  campaign.status === "scheduled" ? (
                    <Calendar className="w-3.5 h-3.5" />
                  ) : campaign.status === "auto" ? (
                    <Zap className="w-3.5 h-3.5" />
                  ) : (
                    <Mail className="w-3.5 h-3.5" />
                  );

                return (
                  <div
                    key={campaign.id}
                    className={cn(
                      "flex-1 min-w-0 flex flex-col gap-2.5 p-4 rounded-xl border cursor-pointer group transition-all hover:shadow-sm",
                      campaign.hasNewActivity
                        ? "bg-blue-50/60 border-blue-200 hover:border-blue-400"
                        : "bg-card border-border hover:border-foreground/20",
                    )}
                    onClick={() =>
                      navigate(`/email-workflows/campaigns/${campaign.id}`)
                    }
                  >
                    {/* Icon + NEW badge */}
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center",
                          campaign.status === "sent" &&
                            "bg-green-100 text-green-600",
                          campaign.status === "scheduled" &&
                            "bg-blue-100 text-blue-600",
                          campaign.status === "auto" &&
                            "bg-purple-100 text-purple-600",
                        )}
                      >
                        {icon}
                      </div>
                      {campaign.hasNewActivity && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded-full uppercase tracking-wide">
                          <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                          New
                        </span>
                      )}
                    </div>

                    {/* Name + segment */}
                    <div>
                      <div className="font-semibold text-sm truncate">
                        {campaign.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {campaign.segmentName}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-2 mt-auto">
                      {campaign.openRate !== undefined && (
                        <span className="text-xs font-semibold text-green-600">
                          {campaign.openRate}% open
                        </span>
                      )}
                      {campaign.scheduledFor && (
                        <span className="text-xs text-muted-foreground">
                          Sends {formatDate(campaign.scheduledFor)}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {campaign.recipientCount} contacts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task Management Table Wrapper */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              {/* Data Display */}
              {viewMode === "list" ? (
                <TaskQueue
                  tasks={filteredTasks}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  viewMode={viewMode}
                  onViewModeToggle={() =>
                    setViewMode(viewMode === "list" ? "assignee" : "list")
                  }
                />
              ) : (
                <>
                  <div className="flex items-center gap-3 px-5 py-2.5 border-b border-border">
                    <button
                      onClick={() => setViewMode("list")}
                      className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg hover:bg-muted text-xs font-medium transition-colors"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      List View
                    </button>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assignees.map((assignee) => (
                      <div
                        key={assignee}
                        className="p-4 border border-border rounded-lg"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold">{assignee}</span>
                          <span
                            className={
                              getWorkloadLevel(tasksByAssignee[assignee].length)
                                .color
                            }
                          >
                            {
                              getWorkloadLevel(tasksByAssignee[assignee].length)
                                .label
                            }
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {tasksByAssignee[assignee].length} active tasks
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
