import { useState } from "react";
import {
  Play,
  Pause,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  GitBranch,
  ArrowRight,

  Search,
  User,
  Edit,
  UserPlus,
  BarChart3,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  type: "campaign" | "flow";
  status: "active" | "scheduled" | "paused";
  audienceSize: number;
  progress: number;
  currentStep?: string;
}

import type { TaskItem } from "@/app/types";
import { store } from "@/app/data/store";

export function Overview() {
  const [activeCampaigns] = useState<Campaign[]>([
    {
      id: "1",
      name: "New Broker Outreach - April",
      type: "campaign",
      status: "active",
      audienceSize: 45,
      progress: 100,
    },
    {
      id: "2",
      name: "New Broker Onboarding",
      type: "flow",
      status: "active",
      audienceSize: 234,
      progress: 3,
      currentStep: "Step 3: Follow-up Email",
    },
    {
      id: "3",
      name: "Re-engagement Campaign",
      type: "campaign",
      status: "scheduled",
      audienceSize: 120,
      progress: 0,
    },
    {
      id: "4",
      name: "Listing Follow-up Sequence",
      type: "flow",
      status: "paused",
      audienceSize: 89,
      progress: 2,
      currentStep: "Step 2: Waiting",
    },
  ]);

  const [tasks] = useState<TaskItem[]>(store.taskItems.read());

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "assignee">("list");
  const [selectedTasks, _setSelectedTasks] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const assignees = Array.from(new Set(tasks.map((t) => t.assignee)));
  const sources = Array.from(new Set(tasks.map((t) => t.source)));

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || task.status === filterStatus;
    const matchesAssignee =
      filterAssignee === "all" || task.assignee === filterAssignee;
    const matchesSource =
      filterSource === "all" || task.source === filterSource;
    return matchesSearch && matchesStatus && matchesAssignee && matchesSource;
  });

  const tasksByAssignee = assignees.reduce(
    (acc, assignee) => {
      acc[assignee] = filteredTasks.filter((t) => t.assignee === assignee);
      return acc;
    },
    {} as Record<string, TaskItem[]>,
  );

  const formatDateTime = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue":
        return "bg-red-100 text-red-700 border-red-200";
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getWorkloadLevel = (taskCount: number) => {
    if (taskCount >= 10) return { label: "High", color: "text-red-600" };
    if (taskCount >= 5) return { label: "Medium", color: "text-amber-600" };
    return { label: "Low", color: "text-green-600" };
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-auto">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6 sticky top-0 z-10">
        <h2
          className="text-3xl mb-2"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
        >
          Overview
        </h2>
        <p className="text-muted-foreground">
          Monitor active campaigns and manage follow-up workload
        </p>
      </div>

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Campaign Status Snapshot */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3
                className="text-2xl"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                Campaign Status
              </h3>
              <button className="text-primary hover:underline flex items-center gap-2">
                View All Campaigns
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Active Campaigns */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="bg-green-50 px-6 py-3 border-b border-green-200">
                  <div className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-green-700" />
                    <h4
                      className="text-green-900"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontWeight: 600,
                      }}
                    >
                      Active (
                      {
                        activeCampaigns.filter((c) => c.status === "active")
                          .length
                      }
                      )
                    </h4>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {activeCampaigns
                    .filter((c) => c.status === "active")
                    .map((campaign) => (
                      <div
                        key={campaign.id}
                        className="p-4 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {campaign.type === "campaign" ? (
                              <Mail className="w-4 h-4 text-primary" />
                            ) : (
                              <GitBranch className="w-4 h-4 text-primary" />
                            )}
                            <span className="font-medium">{campaign.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {campaign.audienceSize} contacts
                          </span>
                        </div>
                        {campaign.currentStep && (
                          <div className="text-sm text-muted-foreground mb-2">
                            {campaign.currentStep}
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-600 transition-all"
                              style={{
                                width: `${campaign.type === "campaign" ? campaign.progress : (campaign.progress / 5) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {campaign.type === "campaign"
                              ? `${campaign.progress}%`
                              : `Step ${campaign.progress}/5`}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Scheduled & Paused */}
              <div className="space-y-4">
                {activeCampaigns.filter((c) => c.status === "scheduled")
                  .length > 0 && (
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="bg-blue-50 px-6 py-3 border-b border-blue-200">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-700" />
                        <h4
                          className="text-blue-900"
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontWeight: 600,
                          }}
                        >
                          Scheduled (
                          {
                            activeCampaigns.filter(
                              (c) => c.status === "scheduled",
                            ).length
                          }
                          )
                        </h4>
                      </div>
                    </div>
                    <div className="divide-y divide-border">
                      {activeCampaigns
                        .filter((c) => c.status === "scheduled")
                        .map((campaign) => (
                          <div
                            key={campaign.id}
                            className="p-4 hover:bg-muted/20 transition-colors"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {campaign.type === "campaign" ? (
                                <Mail className="w-4 h-4 text-primary" />
                              ) : (
                                <GitBranch className="w-4 h-4 text-primary" />
                              )}
                              <span className="font-medium">
                                {campaign.name}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {campaign.audienceSize} contacts
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {activeCampaigns.filter((c) => c.status === "paused").length >
                  0 && (
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="bg-amber-50 px-6 py-3 border-b border-amber-200">
                      <div className="flex items-center gap-2">
                        <Pause className="w-5 h-5 text-amber-700" />
                        <h4
                          className="text-amber-900"
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontWeight: 600,
                          }}
                        >
                          Paused (
                          {
                            activeCampaigns.filter((c) => c.status === "paused")
                              .length
                          }
                          )
                        </h4>
                      </div>
                    </div>
                    <div className="divide-y divide-border">
                      {activeCampaigns
                        .filter((c) => c.status === "paused")
                        .map((campaign) => (
                          <div
                            key={campaign.id}
                            className="p-4 hover:bg-muted/20 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  {campaign.type === "campaign" ? (
                                    <Mail className="w-4 h-4 text-primary" />
                                  ) : (
                                    <GitBranch className="w-4 h-4 text-primary" />
                                  )}
                                  <span className="font-medium">
                                    {campaign.name}
                                  </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {campaign.audienceSize} contacts •{" "}
                                  {campaign.currentStep}
                                </div>
                              </div>
                              <button className="p-2 hover:bg-muted rounded-lg transition-all">
                                <Play className="w-5 h-5 text-green-600" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Task Management Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-3"></div>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {/* Search and Filters */}
              <div className="px-6 py-4 border-b border-border space-y-3">
                {/* Stats Bar */}
                <div className="flex items-center gap-8 pt-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-muted-foreground">
                      Pending:{" "}
                    </span>
                    <span
                      className="font-medium text-sm"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {tasks.filter((t) => t.status === "pending").length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-muted-foreground">
                      Overdue:{" "}
                    </span>
                    <span
                      className="font-medium text-sm"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {tasks.filter((t) => t.status === "overdue").length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">
                      Completed:{" "}
                    </span>
                    <span
                      className="font-medium text-sm"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {tasks.filter((t) => t.status === "completed").length}
                    </span>
                  </div>
                  <div className="ml-auto text-sm">
                    <span className="text-muted-foreground">Showing: </span>
                    <span
                      className="font-medium"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {filteredTasks.length}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search tasks or contacts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 border-2 rounded-lg transition-all flex items-center gap-2 ${
                      showFilters
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                    {(filterStatus !== "all" ||
                      filterAssignee !== "all" ||
                      filterSource !== "all") && (
                      <span className="px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                        {
                          [
                            filterStatus !== "all",
                            filterAssignee !== "all",
                            filterSource !== "all",
                          ].filter(Boolean).length
                        }
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() =>
                      setViewMode(viewMode === "list" ? "assignee" : "list")
                    }
                    className="px-4 py-2 border-2 border-border rounded-lg hover:bg-muted transition-all flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    {viewMode === "list" ? "View by Assignee" : "View List"}
                  </button>
                </div>

                {showFilters && (
                  <div className="p-4 bg-muted/30 border border-border rounded-lg">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm mb-2 text-muted-foreground">
                          Status
                        </label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="all">All Statuses</option>
                          <option value="pending">Pending</option>
                          <option value="overdue">Overdue</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm mb-2 text-muted-foreground">
                          Assignee
                        </label>
                        <select
                          value={filterAssignee}
                          onChange={(e) => setFilterAssignee(e.target.value)}
                          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="all">All Assignees</option>
                          {assignees.map((assignee) => (
                            <option key={assignee} value={assignee}>
                              {assignee}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm mb-2 text-muted-foreground">
                          Source
                        </label>
                        <select
                          value={filterSource}
                          onChange={(e) => setFilterSource(e.target.value)}
                          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="all">All Sources</option>
                          {sources.map((source) => (
                            <option key={source} value={source}>
                              {source}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bulk Actions */}
              {selectedTasks.length > 0 && (
                <div className="border-b border-border bg-accent/10 px-6 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {selectedTasks.length} task
                      {selectedTasks.length !== 1 ? "s" : ""} selected
                    </span>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all text-sm">
                        Bulk Reassign
                      </button>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm">
                        Mark Complete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* List View */}
              {viewMode === "list" ? (
                <div>
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-6 py-4 text-left">
                          <input
                            type="checkbox"
                            className="rounded border-border"
                          />
                        </th>
                        <th
                          className="px-6 py-4 text-left text-sm text-muted-foreground"
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontWeight: 600,
                          }}
                        >
                          Contact
                        </th>
                        <th
                          className="px-6 py-4 text-left text-sm text-muted-foreground"
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontWeight: 600,
                          }}
                        >
                          Task Type
                        </th>
                        <th
                          className="px-6 py-4 text-left text-sm text-muted-foreground"
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontWeight: 600,
                          }}
                        >
                          Source
                        </th>
                        <th
                          className="px-6 py-4 text-left text-sm text-muted-foreground"
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontWeight: 600,
                          }}
                        >
                          Due Date
                        </th>
                        <th
                          className="px-6 py-4 text-left text-sm text-muted-foreground"
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontWeight: 600,
                          }}
                        >
                          Assignee
                        </th>
                        <th
                          className="px-6 py-4 text-left text-sm text-muted-foreground"
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontWeight: 600,
                          }}
                        >
                          Status
                        </th>
                        <th
                          className="px-6 py-4 text-left text-sm text-muted-foreground"
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontWeight: 600,
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredTasks.map((task) => (
                        <tr
                          key={task.id}
                          className="hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              className="rounded border-border"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium">
                                {task.contactName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Status: {task.contactStatus}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              {task.taskType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm">{task.source}</div>
                              {task.ruleName && (
                                <div className="text-xs text-muted-foreground">
                                  Rule: {task.ruleName}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span style={{ fontFamily: "var(--font-mono)" }}>
                                {formatDateTime(task.dueDate)}
                              </span>
                            </div>
                            {task.triggerContext && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {task.triggerContext}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="w-4 h-4 text-muted-foreground" />
                              {task.assignee}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(task.status)}`}
                            >
                              {task.status.charAt(0).toUpperCase() +
                                task.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {task.status !== "completed" && (
                                <>
                                  <button
                                    className="p-2 hover:bg-muted rounded-lg transition-all"
                                    title="Complete"
                                  >
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  </button>
                                  <button
                                    className="p-2 hover:bg-muted rounded-lg transition-all"
                                    title="Reassign"
                                  >
                                    <UserPlus className="w-4 h-4 text-blue-600" />
                                  </button>
                                  <button
                                    className="p-2 hover:bg-muted rounded-lg transition-all"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4 text-muted-foreground" />
                                  </button>
                                </>
                              )}
                              {task.status === "completed" && task.outcome && (
                                <span className="text-sm text-muted-foreground italic">
                                  {task.outcome}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredTasks.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No tasks found</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Assignee View */
                <div className="p-6 space-y-6">
                  <h4
                    className="text-lg"
                    style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                  >
                    Workload by Assignee
                  </h4>
                  {assignees.map((assignee) => {
                    const assigneeTasks = tasksByAssignee[assignee];
                    const pendingCount = assigneeTasks.filter(
                      (t) => t.status === "pending",
                    ).length;
                    const overdueCount = assigneeTasks.filter(
                      (t) => t.status === "overdue",
                    ).length;
                    const workload = getWorkloadLevel(
                      pendingCount + overdueCount,
                    );

                    return (
                      <div
                        key={assignee}
                        className="border border-border rounded-lg overflow-hidden"
                      >
                        <div className="bg-muted/50 px-6 py-4 border-b border-border">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <User className="w-5 h-5 text-primary" />
                              <h5
                                className="text-base"
                                style={{
                                  fontFamily: "var(--font-sans)",
                                  fontWeight: 600,
                                }}
                              >
                                {assignee}
                              </h5>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-sm">
                                <span className="text-muted-foreground">
                                  Workload:{" "}
                                </span>
                                <span
                                  className={`font-medium ${workload.color}`}
                                >
                                  {workload.label}
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">
                                  Pending:{" "}
                                </span>
                                <span
                                  className="font-medium"
                                  style={{ fontFamily: "var(--font-mono)" }}
                                >
                                  {pendingCount}
                                </span>
                              </div>
                              {overdueCount > 0 && (
                                <div className="text-sm">
                                  <span className="text-red-600">
                                    Overdue:{" "}
                                  </span>
                                  <span
                                    className="font-medium text-red-600"
                                    style={{ fontFamily: "var(--font-mono)" }}
                                  >
                                    {overdueCount}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="divide-y divide-border">
                          {assigneeTasks.slice(0, 5).map((task) => (
                            <div
                              key={task.id}
                              className="p-4 hover:bg-muted/20 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="font-medium">
                                      {task.contactName}
                                    </span>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(task.status)}`}
                                    >
                                      {task.taskType}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>{task.source}</span>
                                    <span>•</span>
                                    <span>{formatDateTime(task.dueDate)}</span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {task.status !== "completed" && (
                                    <>
                                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm">
                                        Complete
                                      </button>
                                      <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-all text-sm">
                                        Edit
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          {assigneeTasks.length > 5 && (
                            <div className="p-4 text-center">
                              <button className="text-primary hover:underline text-sm flex items-center gap-2 mx-auto">
                                Show {assigneeTasks.length - 5} more tasks
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
