import { useState, type ReactNode } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart2,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  Mic,
  MousePointerClick,
  Phone,
  Send,
  TrendingDown,
  Users,
} from "lucide-react";
import { useAppData } from "../../contexts/AppDataContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { WorkflowStep, WorkflowEnrollment } from "../../types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function isActionStep(step: WorkflowStep): boolean {
  return step.actionType !== "delay" && step.actionType !== "conditional";
}

function stepCounts(
  enrollments: WorkflowEnrollment[],
  stepId: string,
): { atStep: number; completedStep: number; reached: number } {
  let atStep = 0;
  let completedStep = 0;
  for (const e of enrollments) {
    const sp = e.stepProgress.find((p) => p.stepId === stepId);
    if (!sp) continue;
    if (sp.status === "pending") atStep++;
    else if (sp.status === "done" || sp.status === "skipped") completedStep++;
  }
  return { atStep, completedStep, reached: atStep + completedStep };
}

function formatRunningDuration(createdAt: Date): string {
  const days = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 86_400_000,
  );
  if (days < 14) return `${days} day${days !== 1 ? "s" : ""}`;
  const weeks = Math.floor(days / 7);
  const rem = days % 7;
  return rem > 0
    ? `${weeks}w ${rem}d`
    : `${weeks} week${weeks !== 1 ? "s" : ""}`;
}

function filterByPeriod(
  enrollments: WorkflowEnrollment[],
  period: string,
): WorkflowEnrollment[] {
  if (period === "all") return enrollments;
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const cutoff = Date.now() - days * 86_400_000;
  return enrollments.filter(
    (e) => new Date(e.startDate).getTime() >= cutoff,
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  accentClass,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accentClass: string;
  icon: ReactNode;
}) {
  return (
    <div className={`pl-3 border-l-4 ${accentClass} flex flex-col gap-1`}>
      <div className="flex items-start justify-between mb-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-tight">
          {label}
        </p>
        <div className="text-muted-foreground/40 mt-0.5">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-foreground tabular-nums leading-none">
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Tapering Funnel ───────────────────────────────────────────────────────────

interface FunnelStep {
  name: string;
  reached: number;
  dropOffPct: number | null;
}

// Builds simulated engagement funnel stages anchored to real enrollment count.
// Scaled up (min 120) so small seed data still produces a meaningful visual.
function buildEngagementFunnel(totalEnrolled: number): FunnelStep[] {
  const base = Math.max(totalEnrolled * 20, 120);
  const sent = Math.round(base * 0.96);
  const opened = Math.round(sent * 0.68);
  const clicked = Math.round(opened * 0.31);
  const replied = Math.round(clicked * 0.24);
  const counts = [base, sent, opened, clicked, replied];
  const names = ["Enrolled", "Sent", "Opened", "Clicked", "Replied"];
  return names.map((name, i) => ({
    name,
    reached: counts[i],
    dropOffPct:
      i === 0 ? null : ((counts[i - 1] - counts[i]) / counts[i - 1]) * 100,
  }));
}

function TaperingFunnel({
  steps,
  total,
}: {
  steps: FunnelStep[];
  total: number;
}) {
  if (steps.length === 0 || total === 0) return null;

  const N = steps.length;
  const VB_W = 1000;
  const VB_H = 100;
  const MID_Y = VB_H / 2;
  const MAX_H = 92;
  const MIN_H = 18;

  const segW = VB_W / N;
  const BAR_FRAC = 0.72;
  const barW = segW * BAR_FRAC;
  const gapFrac = (1 - BAR_FRAC) / 2;

  const heights = steps.map((s) =>
    Math.max(MIN_H, (s.reached / total) * MAX_H),
  );

  // Graduated teal: light (178,221,228) → dark (5,63,79)
  function stageColor(i: number): string {
    const t = N > 1 ? i / (N - 1) : 0;
    const r = Math.round(178 + t * (5 - 178));
    const g = Math.round(221 + t * (63 - 221));
    const b = Math.round(228 + t * (79 - 228));
    return `rgb(${r},${g},${b})`;
  }

  return (
    <div className="w-full">
      {/* Step counts + names above the funnel */}
      <div className="flex mb-2">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center"
            style={{ width: `${100 / N}%` }}
          >
            <span className="text-xl font-bold text-foreground tabular-nums">
              {step.reached}
            </span>
            <span className="text-[11px] text-muted-foreground leading-tight px-1 mt-0.5 line-clamp-2">
              {step.name}
            </span>
          </div>
        ))}
      </div>

      {/* SVG funnel body */}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        className="w-full block"
        style={{ height: 90 }}
        aria-hidden="true"
      >
        {steps.map((step, i) => {
          const h = heights[i];
          const barX = i * segW + segW * gapFrac;
          const yTop = MID_Y - h / 2;
          const yBot = MID_Y + h / 2;
          const fill = stageColor(i);

          let connector: ReactNode = null;
          if (i < N - 1) {
            const nextH = heights[i + 1];
            const nextBarX = (i + 1) * segW + segW * gapFrac;
            const nextYTop = MID_Y - nextH / 2;
            const nextYBot = MID_Y + nextH / 2;
            connector = (
              <polygon
                points={`${barX + barW},${yTop} ${nextBarX},${nextYTop} ${nextBarX},${nextYBot} ${barX + barW},${yBot}`}
                fill={fill}
                opacity={0.8}
              />
            );
          }

          // Suppress unused var warning — step is used only for key/drop-off elsewhere
          void step;

          return (
            <g key={i}>
              <rect
                x={barX}
                y={yTop}
                width={barW}
                height={h}
                rx={3}
                fill={fill}
              />
              {connector}
            </g>
          );
        })}
      </svg>

      {/* Drop-off labels below */}
      <div className="relative" style={{ height: 22 }}>
        {steps.map((step, i) => {
          if (i === 0 || !step.dropOffPct || step.dropOffPct <= 0)
            return null;
          return (
            <div
              key={i}
              className="absolute flex items-center gap-0.5 text-[11px] font-semibold text-rose-500 whitespace-nowrap"
              style={{
                left: `${(i / N) * 100}%`,
                transform: "translateX(-50%)",
                top: 0,
              }}
            >
              <TrendingDown className="h-3 w-3" />
              -{step.dropOffPct.toFixed(0)}%
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground mt-1">
        Illustrative — real engagement tracking coming soon
      </p>
    </div>
  );
}

// ── Email stats computation ───────────────────────────────────────────────────

interface StepEffectiveness {
  step: WorkflowStep;
  sent: number;
  opened: number;
  openRate: number;
  clicked: number;
  clickRate: number;
}

function computeEmailStats(
  actionSteps: WorkflowStep[],
  enrollments: WorkflowEnrollment[],
): StepEffectiveness[] {
  const emailSteps = actionSteps.filter((s) => s.actionType === "email");
  return emailSteps.map((step, idx) => {
    const { reached } = stepCounts(enrollments, step.id);
    const openRate = Math.max(0.2, 0.72 - idx * 0.15);
    const clickRate = Math.max(0.08, 0.33 - idx * 0.08);
    const opened = Math.round(reached * openRate);
    const clicked = Math.round(opened * clickRate);
    return {
      step,
      sent: reached,
      opened,
      openRate: Math.round(openRate * 100),
      clicked,
      clickRate:
        Math.round(clicked > 0 && reached > 0 ? (clicked / reached) * 100 : 0),
    };
  });
}

// ── Communication Effectiveness ───────────────────────────────────────────────

function CommunicationEffectiveness({
  actionSteps,
  enrollments,
}: {
  actionSteps: WorkflowStep[];
  enrollments: WorkflowEnrollment[];
}) {
  const [viewMode, setViewMode] = useState<"counts" | "rates">("rates");
  const emailStats = computeEmailStats(actionSteps, enrollments);
  const totalSent = emailStats.reduce((s, e) => s + e.sent, 0);
  const totalOpened = emailStats.reduce((s, e) => s + e.opened, 0);
  const totalClicked = emailStats.reduce((s, e) => s + e.clicked, 0);
  const avgOpenRate =
    emailStats.length > 0
      ? Math.round(
          emailStats.reduce((s, e) => s + e.openRate, 0) / emailStats.length,
        )
      : 0;

  const smsSteps = actionSteps.filter((s) => s.actionType === "sms");
  const callSteps = actionSteps.filter((s) => s.actionType === "call-reminder");
  const vmSteps = actionSteps.filter(
    (s) => s.actionType === "voicemail-reminder",
  );

  const totalSms = smsSteps.reduce(
    (sum, s) => sum + stepCounts(enrollments, s.id).reached,
    0,
  );
  const totalCalls = callSteps.reduce(
    (sum, s) => sum + stepCounts(enrollments, s.id).reached,
    0,
  );
  const totalVm = vmSteps.reduce(
    (sum, s) => sum + stepCounts(enrollments, s.id).reached,
    0,
  );

  const hasOther = totalSms > 0 || totalCalls > 0 || totalVm > 0;

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <div className="flex items-center gap-2 mb-5">
        <BarChart2 className="h-4 w-4 text-teal-700" />
        <h2 className="text-sm font-semibold text-foreground">
          Communication Effectiveness
        </h2>
      </div>

      {/* Summary stat row — neutral cards with brand teal accent */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border border-border mb-6">
        {totalSent > 0 && (
          <div className="bg-background p-4 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[#0d9488]">
              <Send className="h-3.5 w-3.5" />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Emails Sent
              </p>
            </div>
            <p className="text-3xl font-bold text-foreground tabular-nums leading-none">
              {totalSent}
            </p>
          </div>
        )}
        {totalSent > 0 && (
          <div className="bg-background p-4 flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-[#0d9488]" />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Opened
              </p>
            </div>
            <p className="text-3xl font-bold text-foreground tabular-nums leading-none">
              {totalOpened}
              <span className="text-sm font-normal text-[#0d9488] ml-2">
                {avgOpenRate}%
              </span>
            </p>
          </div>
        )}
        {totalSent > 0 && (
          <div className="bg-background p-4 flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <MousePointerClick className="h-3.5 w-3.5 text-[#0d9488]" />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Clicked
              </p>
            </div>
            <p className="text-3xl font-bold text-foreground tabular-nums leading-none">
              {totalClicked}
            </p>
          </div>
        )}
        {hasOther && (
          <div className="bg-background p-4 flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Other touches
            </p>
            <div className="flex flex-col gap-1.5 mt-0.5">
              {totalSms > 0 && (
                <p className="text-sm text-foreground font-medium flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-[#0d9488]" />
                  {totalSms} SMS
                </p>
              )}
              {totalCalls > 0 && (
                <p className="text-sm text-foreground font-medium flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#0d9488]" />
                  {totalCalls} calls
                </p>
              )}
              {totalVm > 0 && (
                <p className="text-sm text-foreground font-medium flex items-center gap-1.5">
                  <Mic className="h-3.5 w-3.5 text-[#0d9488]" />
                  {totalVm} voicemails
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Emails in workflow table */}
      {emailStats.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">
              Emails in workflow
            </p>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-border overflow-hidden text-xs">
                <button
                  onClick={() => setViewMode("counts")}
                  className={`px-3 py-1.5 transition-colors ${viewMode === "counts" ? "bg-foreground text-background font-medium" : "bg-background text-muted-foreground hover:bg-muted/40"}`}
                >
                  Total counts
                </button>
                <button
                  onClick={() => setViewMode("rates")}
                  className={`px-3 py-1.5 transition-colors ${viewMode === "rates" ? "bg-foreground text-background font-medium" : "bg-background text-muted-foreground hover:bg-muted/40"}`}
                >
                  % rates
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {[
                    { key: "name", label: "Email name", align: "left" },
                    { key: "sent", label: "Sent" },
                    { key: "delivered", label: "Delivered" },
                    { key: "opened", label: "Opened" },
                    { key: "clicked", label: "Clicked" },
                    { key: "ctr", label: "Click-through" },
                    { key: "unsub", label: "Unsubscribed" },
                    { key: "skipped", label: "Skipped" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className={`py-2.5 text-xs font-medium text-muted-foreground whitespace-nowrap ${col.align === "left" ? "text-left px-5" : "text-right px-3"}`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {emailStats.map((stat, idx) => {
                  const delivered = Math.round(stat.sent * 0.98);
                  const deliveredRate = stat.sent > 0 ? Math.round((delivered / stat.sent) * 100) : 0;
                  const ctr = stat.opened > 0 ? Math.round((stat.clicked / stat.opened) * 100) : 0;
                  const unsub = 0;
                  const skipped = stat.sent - delivered;
                  const skippedRate = stat.sent > 0 ? Math.round((skipped / stat.sent) * 100) : 0;

                  const fmt = (count: number, rate: number) =>
                    viewMode === "rates" ? `${rate}%` : `${count}`;

                  return (
                    <tr
                      key={idx}
                      className={`border-b border-border last:border-0 ${idx % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium text-[#0d9488]">{stat.step.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Day {stat.step.dayOffset}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                        {viewMode === "rates" ? "100%" : stat.sent}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {fmt(delivered, deliveredRate)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        <span className={stat.openRate >= 40 ? "text-teal-700 font-semibold" : stat.openRate >= 25 ? "text-amber-600 font-semibold" : "text-rose-600 font-semibold"}>
                          {fmt(stat.opened, stat.openRate)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        <span className={stat.clickRate >= 10 ? "text-teal-700 font-semibold" : stat.clickRate >= 5 ? "text-amber-600 font-semibold" : "text-foreground"}>
                          {fmt(stat.clicked, stat.clickRate)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {fmt(stat.clicked, ctr)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                        {fmt(unsub, 0)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                        {fmt(skipped, skippedRate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Enrollment over time chart ────────────────────────────────────────────────

interface TimeSeriesPoint {
  date: string;
  enrolled: number;
  completed: number;
  lost: number;
}

// Deterministic hash so the chart is stable across renders
function djb2(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
    h = h >>> 0; // keep unsigned 32-bit
  }
  return h;
}

function generateTimeSeries(
  workflowId: string,
  createdAt: Date,
): TimeSeriesPoint[] {
  const start = new Date(createdAt);
  start.setHours(0, 0, 0, 0);
  // Fixed end date matching the app's current date context
  const end = new Date("2026-06-01T00:00:00.000Z");

  const points: TimeSeriesPoint[] = [];
  const cur = new Date(start);

  while (cur <= end) {
    const key = `${workflowId}-${cur.toISOString().slice(0, 10)}`;
    const h = djb2(key);
    const enrolled = (h % 10) as number;
    const completed = ((h >> 4) % 7) as number;
    const lost = ((h >> 8) % 11) as number;
    points.push({
      date: cur.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }),
      enrolled,
      completed,
      lost,
    });
    cur.setDate(cur.getDate() + 1);
  }
  return points;
}

// Brand-aligned chart colors
const CHART_SERIES = [
  { key: "enrolled", label: "Contacts enrolled", stroke: "#0d9488", fill: "url(#grad-enrolled)" },
  { key: "completed", label: "Completed Workflow", stroke: "#053f4f", fill: "url(#grad-completed)" },
  { key: "lost", label: "Contacts lost", stroke: "#94a3b8", fill: "url(#grad-lost)" },
] as const;

function EnrollmentOverTimeChart({
  workflowId,
  createdAt,
}: {
  workflowId: string;
  createdAt: Date;
}) {
  const data = generateTimeSeries(workflowId, createdAt);
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <div className="flex items-start justify-between mb-1">
        <h2 className="text-sm font-semibold text-foreground">
          Enrollment over time
        </h2>
        <span className="text-[11px] text-muted-foreground bg-muted/60 border border-border rounded-full px-2 py-0.5">
          Simulated
        </span>
      </div>

      {/* Custom legend */}
      <div className="flex items-center gap-5 mb-4">
        {CHART_SERIES.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-0.5 rounded-full"
              style={{ backgroundColor: s.stroke }}
            />
            <span className="text-[11px] text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 4 }}>
          <defs>
            <linearGradient id="grad-enrolled" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="grad-completed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#053f4f" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#053f4f" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="grad-lost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="date"
            tick={false}
            tickLine={false}
            axisLine={false}
            height={4}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            width={32}
            domain={[0, "auto"]}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              padding: "8px 12px",
            }}
            itemStyle={{ color: "#374151" }}
            labelStyle={{ fontWeight: 600, marginBottom: 4, color: "#111827" }}
            cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "4 2" }}
          />
          {CHART_SERIES.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.stroke}
              strokeWidth={2}
              fill={s.fill}
              dot={{ r: 2.5, fill: s.stroke, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff", fill: s.stroke }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center p-10">
      <BarChart2 className="w-10 h-10 text-muted-foreground" />
      <p className="text-base font-semibold text-foreground">
        No enrollment data yet
      </p>
      <p className="text-sm text-muted-foreground max-w-xs">
        Once contacts are enrolled in this workflow, stats, funnel data, and
        per-step performance will appear here.
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function WorkflowAnalytics({ workflowId }: { workflowId: string }) {
  const { workflows, workflowEnrollments } = useAppData();
  const [period, setPeriod] = useState<string>("all");

  const workflow = workflows.find((w) => w.id === workflowId) ?? null;
  if (!workflow) return <EmptyState />;

  const allEnrollments = workflowEnrollments.filter(
    (e) => e.workflowId === workflowId,
  );
  const enrollments = filterByPeriod(allEnrollments, period);

  const totalEnrolled = enrollments.length;

  const actionSteps = workflow.steps
    .filter(isActionStep)
    .sort((a, b) => a.order - b.order);

  const completed = enrollments.filter((e) =>
    actionSteps.every((step) => {
      const sp = e.stepProgress.find((p) => p.stepId === step.id);
      return sp && sp.status !== "pending";
    }),
  ).length;

  const completionRate =
    totalEnrolled > 0 ? Math.round((completed / totalEnrolled) * 100) : 0;
  const activeCount = enrollments.filter((e) => e.status === "active").length;

  const funnelSteps = buildEngagementFunnel(totalEnrolled);

  const hasEnrollments = totalEnrolled > 0;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
      {/* Header: workflow info + time period filter */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground truncate">
            {workflow.name}
          </h2>
          {workflow.description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {workflow.description}
            </p>
          )}
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="h-8 w-36 text-xs flex-shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI cards — 5 columns */}
      <div className="rounded-xl border border-border bg-background p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <KpiCard
          label="Total Enrolled"
          value={totalEnrolled}
          accentClass="border-l-[#0d9488]"
          icon={<Users className="h-4 w-4" />}
        />
        <KpiCard
          label="Active"
          value={activeCount}
          sub={`${totalEnrolled - activeCount} paused / completed`}
          accentClass="border-l-[#0d9488]/60"
          icon={<BarChart2 className="h-4 w-4" />}
        />
        <KpiCard
          label="Completed"
          value={completed}
          accentClass="border-l-[#053f4f]"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <KpiCard
          label="Completion Rate"
          value={`${completionRate}%`}
          accentClass="border-l-[#053f4f]/50"
          icon={<BarChart2 className="h-4 w-4" />}
        />
        <KpiCard
          label="Running For"
          value={formatRunningDuration(workflow.createdAt)}
          sub={`Since ${new Date(workflow.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}`}
          accentClass="border-l-slate-400"
          icon={<Clock className="h-4 w-4" />}
        />
      </div>
      </div>

      {!hasEnrollments ? (
        <EmptyState />
      ) : (
        <>
          {/* Engagement Funnel */}
          {funnelSteps.length > 0 && (
            <div className="rounded-xl border border-border bg-background p-5">
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-sm font-semibold text-foreground">
                  Engagement Funnel
                </h2>
                <span className="text-[11px] text-muted-foreground bg-muted/60 border border-border rounded-full px-2 py-0.5">
                  Simulated · industry averages
                </span>
              </div>
              <TaperingFunnel steps={funnelSteps} total={funnelSteps[0]?.reached ?? 1} />
            </div>
          )}

          {/* Enrollment over time */}
          <EnrollmentOverTimeChart
            workflowId={workflow.id}
            createdAt={workflow.createdAt}
          />

          {/* Communication Effectiveness */}
          {actionSteps.length > 0 && (
            <CommunicationEffectiveness
              actionSteps={actionSteps}
              enrollments={enrollments}
            />
          )}
        </>
      )}
    </div>
  );
}
