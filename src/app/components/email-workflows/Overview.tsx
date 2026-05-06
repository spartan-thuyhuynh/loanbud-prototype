import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ChevronRight,
  GitBranch,
  FileText,
  PauseCircle,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";

import { useAppData } from "@/app/contexts/AppDataContext";
import { CURRENT_USER } from "@/app/config/featureFlags";
import { TaskQueue } from "./TaskQueue";

export function Overview() {
  const navigate = useNavigate();
  const { taskItems: tasks, workflows, workflowEnrollments } = useAppData();
  // --- State ---
  const [searchTerm, setSearchTerm] = useState("");

  // --- Logic ---
  const activeEnrollmentsByWorkflow = workflowEnrollments.reduce(
    (acc, e) => {
      if (e.status === "active")
        acc[e.workflowId] = (acc[e.workflowId] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.source?.toLowerCase() ?? "").includes(searchTerm.toLowerCase());
    // Overview shows only the current user's tasks
    const matchesUser = task.assignee === CURRENT_USER;
    return matchesSearch && matchesUser;
  });

  return (
    <div className="h-full flex flex-col bg-background overflow-auto font-sans">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6 sticky top-0 z-10">
        <h2 className="text-3xl font-semibold">Overview</h2>
        <p className="text-muted-foreground mt-1">
          Monitor active workflows and manage follow-up workload
        </p>
      </div>

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Workflow Activity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Workflow Activity</h3>
              <button
                onClick={() => navigate("/email-workflows/flows")}
                className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex gap-3">
              {workflows.slice(0, 4).map((workflow) => {
                const isActive = workflow.status === "active";
                const isPaused = workflow.status === "paused";
                const activeCount =
                  activeEnrollmentsByWorkflow[workflow.id] ?? 0;

                const icon = isActive ? (
                  <GitBranch className="w-3.5 h-3.5" />
                ) : isPaused ? (
                  <PauseCircle className="w-3.5 h-3.5" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                );

                return (
                  <div
                    key={workflow.id}
                    className={cn(
                      "flex-1 min-w-0 flex flex-col gap-2.5 p-4 rounded-xl border cursor-pointer group transition-all hover:shadow-sm",
                      isActive
                        ? "bg-green-50/60 border-green-200 hover:border-green-400"
                        : isPaused
                          ? "bg-amber-50/60 border-amber-200 hover:border-amber-400"
                          : "bg-card border-border hover:border-foreground/20",
                    )}
                    onClick={() =>
                      navigate(`/email-workflows/flows/${workflow.id}/board`)
                    }
                  >
                    {/* Icon + status badge */}
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center",
                          isActive && "bg-green-100 text-green-600",
                          isPaused && "bg-amber-100 text-amber-600",
                          !isActive &&
                            !isPaused &&
                            "bg-muted text-muted-foreground",
                        )}
                      >
                        {icon}
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize",
                          isActive && "bg-green-100 text-green-700",
                          isPaused && "bg-amber-100 text-amber-700",
                          !isActive &&
                            !isPaused &&
                            "bg-muted text-muted-foreground",
                        )}
                      >
                        {workflow.status}
                      </span>
                    </div>

                    {/* Name + segment */}
                    <div>
                      <div className="font-semibold text-sm truncate">
                        {workflow.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {workflow.segmentName}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-2 mt-auto">
                      <span className="text-xs text-muted-foreground">
                        {workflow.steps.length} steps
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs font-semibold text-foreground">
                        {activeCount} enrolled
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* My Tasks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">My Tasks</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Assigned to {CURRENT_USER} · {filteredTasks.filter(t => t.status !== "completed").length} pending
                </p>
              </div>
              <button
                onClick={() => navigate("/email-workflows/tasks")}
                className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <TaskQueue
                tasks={filteredTasks}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
