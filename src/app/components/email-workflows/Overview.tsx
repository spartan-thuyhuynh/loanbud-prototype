import { useState } from "react";
import { Calendar, Mail, BarChart3, Zap } from "lucide-react";

import type { TaskItem } from "@/app/types";
import { useAppData } from "@/app/contexts/AppDataContext";
import {
  CAMPAIGN_STATUS_COLORS,
  CAMPAIGN_STATUS_LABELS,
} from "./campaign/campaign-data";
import { TaskQueue } from "./TaskQueue";

export function Overview() {
  const { taskItems: tasks, campaigns } = useAppData();
  // --- State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "assignee">("list");

  // --- Campaign groupings ---
  const sentCampaigns = campaigns.filter((c) => c.status === "sent");
  const scheduledCampaigns = campaigns.filter((c) => c.status === "scheduled");
  const autoCampaigns = campaigns.filter((c) => c.status === "auto");

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
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground mt-1">
          Monitor active campaigns and manage follow-up workload
        </p>
      </div>

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Campaign Status Snapshot */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Campaign Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sent Campaigns Card */}
              {sentCampaigns.length > 0 && (
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-green-50/50 px-6 py-4 border-b border-green-100 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${CAMPAIGN_STATUS_COLORS.sent}`}
                    />
                    <h4 className="font-bold text-green-900">
                      {CAMPAIGN_STATUS_LABELS.sent} ({sentCampaigns.length})
                    </h4>
                  </div>
                  <div className="divide-y divide-border max-h-64 overflow-y-auto">
                    {sentCampaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-primary" />
                            <span className="font-semibold">
                              {campaign.name}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {campaign.recipientCount} contacts
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{campaign.segmentName}</span>
                          <div className="flex items-center gap-3">
                            {campaign.sentAt && (
                              <span>Sent {formatDate(campaign.sentAt)}</span>
                            )}
                            {campaign.openRate !== undefined && (
                              <span className="text-green-600 font-medium">
                                {campaign.openRate}% open rate
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scheduled Campaigns Card */}
              {scheduledCampaigns.length > 0 && (
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-blue-50/50 px-6 py-4 border-b border-blue-100 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${CAMPAIGN_STATUS_COLORS.scheduled}`}
                    />
                    <h4 className="font-bold text-blue-900">
                      {CAMPAIGN_STATUS_LABELS.scheduled} (
                      {scheduledCampaigns.length})
                    </h4>
                  </div>
                  <div className="divide-y divide-border">
                    {scheduledCampaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="font-semibold">
                              {campaign.name}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {campaign.recipientCount} contacts
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{campaign.segmentName}</span>
                          {campaign.scheduledFor && (
                            <span>
                              Sends {formatDate(campaign.scheduledFor)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Auto Campaigns Card */}
              {autoCampaigns.length > 0 && (
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-purple-50/50 px-6 py-4 border-b border-purple-100 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${CAMPAIGN_STATUS_COLORS.auto}`}
                    />
                    <h4 className="font-bold text-purple-900">
                      {CAMPAIGN_STATUS_LABELS.auto} ({autoCampaigns.length})
                    </h4>
                  </div>
                  <div className="divide-y divide-border">
                    {autoCampaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="font-semibold">
                              {campaign.name}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {campaign.recipientCount} contacts
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{campaign.segmentName}</span>
                          <span className="text-purple-600 font-medium">
                            Triggers on segment entry
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
