import { useState } from "react";
import { BarChart2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAppData } from "../../../contexts/AppDataContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Badge } from "../../ui/badge";
import type { WorkflowStep, WorkflowEnrollment } from "../../../types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function isActionStep(step: WorkflowStep): boolean {
  return step.actionType !== "delay" && step.actionType !== "conditional";
}

function getActionTypeBadgeVariant(
  actionType: WorkflowStep["actionType"],
): "default" | "secondary" | "outline" {
  switch (actionType) {
    case "email":
      return "default";
    case "sms":
      return "secondary";
    case "call-reminder":
    case "voicemail-reminder":
      return "outline";
    default:
      return "outline";
  }
}

function actionTypeLabel(actionType: WorkflowStep["actionType"]): string {
  switch (actionType) {
    case "email":
      return "Email";
    case "sms":
      return "SMS";
    case "call-reminder":
      return "Call";
    case "voicemail-reminder":
      return "Voicemail";
    case "delay":
      return "Delay";
    case "conditional":
      return "Condition";
    default:
      return actionType;
  }
}

// Count enrollments that have progressed to or past the given step.
// "at step" = that step is currently pending
// "completed step" = that step is done or skipped
function stepCounts(
  enrollments: WorkflowEnrollment[],
  stepId: string,
): { atStep: number; completedStep: number } {
  let atStep = 0;
  let completedStep = 0;
  for (const enrollment of enrollments) {
    const sp = enrollment.stepProgress.find((p) => p.stepId === stepId);
    if (!sp) continue;
    if (sp.status === "pending") atStep++;
    else if (sp.status === "done" || sp.status === "skipped") completedStep++;
  }
  return { atStep, completedStep };
}

// ── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Empty prompt ──────────────────────────────────────────────────────────────

function SelectPrompt() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center p-10">
      <BarChart2 className="w-10 h-10 text-muted-foreground" />
      <p className="text-base font-semibold text-foreground">Select a workflow to view analytics</p>
      <p className="text-sm text-muted-foreground max-w-xs">
        Choose a workflow from the dropdown above to see enrollment stats, funnel data, and per-step
        performance.
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AnalyticsDashboard() {
  const { workflows, workflowEnrollments } = useAppData();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");

  const selectedWorkflow = workflows.find((w) => w.id === selectedWorkflowId) ?? null;

  // Enrollments for the selected workflow
  const enrollments = selectedWorkflow
    ? workflowEnrollments.filter((e) => e.workflowId === selectedWorkflow.id)
    : [];

  // KPI calculations
  const totalEnrolled = enrollments.length;

  const completed = enrollments.filter((e) => {
    const actionSteps = (selectedWorkflow?.steps ?? []).filter(isActionStep);
    return actionSteps.every((step) => {
      const sp = e.stepProgress.find((p) => p.stepId === step.id);
      return sp && sp.status !== "pending";
    });
  }).length;

  const completionRate =
    totalEnrolled > 0 ? Math.round((completed / totalEnrolled) * 100) : 0;

  const activeCount = enrollments.filter((e) => e.status === "active").length;

  // Action steps only (non-delay, non-conditional)
  const actionSteps = (selectedWorkflow?.steps ?? []).filter(isActionStep);

  // Funnel data for BarChart
  const funnelData = actionSteps.map((step) => {
    const { atStep, completedStep } = stepCounts(enrollments, step.id);
    return {
      name: step.name,
      atStep,
      completedStep,
      total: atStep + completedStep,
    };
  });

  // Find the step with the highest drop-off (lowest total relative to the first step)
  const dropOffStepName =
    funnelData.length > 1
      ? funnelData.slice(1).reduce((prev, curr) => {
          const prevDrop =
            funnelData[funnelData.indexOf(prev) - 1 + 1]?.total ?? 0;
          const currDrop =
            funnelData[funnelData.indexOf(curr) - 1 + 1]?.total ?? 0;
          return prevDrop > currDrop ? curr : prev;
        }, funnelData[1])?.name
      : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <BarChart2 className="w-5 h-5 text-teal-700" />
          <h1 className="text-lg font-semibold text-foreground">Analytics</h1>
        </div>
        <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
          <SelectTrigger className="w-64 h-9 text-sm">
            <SelectValue placeholder="Select a workflow…" />
          </SelectTrigger>
          <SelectContent>
            {workflows.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Body */}
      {!selectedWorkflow ? (
        <SelectPrompt />
      ) : (
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KpiCard label="Total Enrolled" value={totalEnrolled} />
            <KpiCard label="Completed" value={completed} />
            <KpiCard label="Completion Rate" value={`${completionRate}%`} />
            <KpiCard
              label="Active"
              value={activeCount}
              sub={`${totalEnrolled - activeCount} paused / completed`}
            />
          </div>

          {/* Funnel chart */}
          {funnelData.length > 0 && (
            <div className="rounded-lg border border-border bg-background p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">Enrollment Funnel</h2>
              <ResponsiveContainer width="100%" height={Math.max(funnelData.length * 44, 160)}>
                <BarChart
                  data={funnelData}
                  layout="vertical"
                  margin={{ top: 0, right: 24, bottom: 0, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={140}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12 }}
                    formatter={(value: number, name: string) => [
                      value,
                      name === "completedStep" ? "Completed" : "At step",
                    ]}
                  />
                  <Bar
                    dataKey="completedStep"
                    name="completedStep"
                    stackId="a"
                    fill="#053f4f"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="atStep"
                    name="atStep"
                    stackId="a"
                    fill={dropOffStepName ? "#f59e0b" : "#0d9488"}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              <p className="mt-2 text-xs text-muted-foreground">
                Teal = completed step · Amber = currently at step
              </p>
            </div>
          )}

          {/* Per-step table */}
          {actionSteps.length > 0 && (
            <div className="rounded-lg border border-border bg-background overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Per-step breakdown</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground">
                      Step Name
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">
                      Type
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">
                      Day Offset
                    </th>
                    <th className="text-right px-3 py-2.5 text-xs font-medium text-muted-foreground">
                      At Step
                    </th>
                    <th className="text-right px-5 py-2.5 text-xs font-medium text-muted-foreground">
                      Completed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {actionSteps.map((step, idx) => {
                    const { atStep, completedStep } = stepCounts(enrollments, step.id);
                    return (
                      <tr
                        key={step.id}
                        className={[
                          "border-b border-border last:border-0",
                          idx % 2 === 0 ? "bg-background" : "bg-muted/20",
                        ].join(" ")}
                      >
                        <td className="px-5 py-3 font-medium text-foreground">{step.name}</td>
                        <td className="px-3 py-3">
                          <Badge
                            variant={getActionTypeBadgeVariant(step.actionType)}
                            className="text-[11px]"
                          >
                            {actionTypeLabel(step.actionType)}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">Day {step.dayOffset}</td>
                        <td className="px-3 py-3 text-right tabular-nums">{atStep}</td>
                        <td className="px-5 py-3 text-right tabular-nums text-teal-700 font-medium">
                          {completedStep}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
