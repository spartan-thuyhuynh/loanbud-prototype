import { useState } from "react";
import {
  Play,
  Calendar,
  AlertCircle,
  Clock,
  Mail,
  GitBranch,
  Search,
  BarChart3,
} from "lucide-react";

import type { TaskItem } from "@/app/types";
import { useAppData } from "@/app/contexts/AppDataContext";
import { TaskQueue } from "./TaskQueue";

interface Campaign {
  id: string;
  name: string;
  type: "campaign" | "flow";
  status: "active" | "scheduled" | "paused";
  audienceSize: number;
  progress: number;
  currentStep?: string;
}

export function Overview() {
  const { taskItems: tasks } = useAppData();
  // --- State ---
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
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, _setFilterStatus] = useState<string>("all");
  const [filterAssignee, _setFilterAssignee] = useState<string>("all");
  const [filterSource, _setFilterSource] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "assignee">("list");

  // --- Logic ---
  const assignees = Array.from(new Set(tasks.map((t) => t.assignee)));

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

  const getWorkloadLevel = (taskCount: number) => {
    if (taskCount >= 10) return { label: "High", color: "text-red-600" };
    if (taskCount >= 5) return { label: "Medium", color: "text-amber-600" };
    return { label: "Low", color: "text-green-600" };
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
              {/* Active Campaigns Card */}
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-green-50/50 px-6 py-4 border-b border-green-100 flex items-center gap-2">
                  <Play className="w-5 h-5 text-green-600" />
                  <h4 className="font-bold text-green-900">
                    Active (
                    {
                      activeCampaigns.filter((c) => c.status === "active")
                        .length
                    }
                    )
                  </h4>
                </div>
                <div className="divide-y divide-border">
                  {activeCampaigns
                    .filter((c) => c.status === "active")
                    .map((campaign) => (
                      <div
                        key={campaign.id}
                        className="p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {campaign.type === "campaign" ? (
                              <Mail className="w-4 h-4 text-primary" />
                            ) : (
                              <GitBranch className="w-4 h-4 text-primary" />
                            )}
                            <span className="font-semibold">
                              {campaign.name}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {campaign.audienceSize} contacts
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${campaign.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground">
                            {campaign.progress}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Scheduled/Paused Stack */}
              <div className="space-y-4 4 flex flex-col">
                {activeCampaigns.filter((c) => c.status === "scheduled")
                  .length > 0 && (
                  <div className="flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-blue-50/50 px-6 py-4 border-b border-blue-100 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <h4 className="font-bold text-blue-900">Scheduled</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      {activeCampaigns
                        .filter((c) => c.status === "scheduled")
                        .map((c) => (
                          <div
                            key={c.id}
                            className="flex justify-between text-sm"
                          >
                            <span className="font-medium">{c.name}</span>
                            <span className="text-muted-foreground">
                              {c.audienceSize} contacts
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Task Management Table Wrapper */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              {/* Toolbar */}
              <div className="px-6 py-4 border-b border-border space-y-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-muted-foreground">Pending:</span>
                    <span className="font-bold">
                      {tasks.filter((t) => t.status === "pending").length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-muted-foreground">Overdue:</span>
                    <span className="font-bold text-red-600">
                      {tasks.filter((t) => t.status === "overdue").length}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <button
                    onClick={() =>
                      setViewMode(viewMode === "list" ? "assignee" : "list")
                    }
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted text-sm font-medium flex items-center gap-2 transition-all"
                  >
                    <BarChart3 className="w-4 h-4" />
                    {viewMode === "list" ? "By Assignee" : "List View"}
                  </button>
                </div>
              </div>

              {/* Data Display */}
              {viewMode === "list" ? (
                <TaskQueue tasks={filteredTasks} />
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
