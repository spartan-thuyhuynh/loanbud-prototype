import type { Workflow, WorkflowEnrollment, WorkflowStep } from "../types";
import { mergeSteps } from "./workflowUtils";

/**
 * Workflow-step context helpers — RFC-008 (Tasks Module Enhancements).
 *
 * Surfaces "where is this contact in the workflow" for the task drawer's Contact
 * Context panel and the contact-detail Workflows card. The "Action required" badge
 * is shown ONLY when the upcoming step is a manual task (call / voicemail reminder),
 * mirroring the RFC's `MANUAL_TASK`-only rule — never for automated email/sms steps.
 */

/** Workflow action types that require a human to act (the RFC's `MANUAL_TASK`). */
const MANUAL_TASK_ACTION_TYPES = new Set<WorkflowStep["actionType"]>([
  "call-reminder",
  "voicemail-reminder",
]);

export function isManualTaskStep(step: WorkflowStep | null | undefined): boolean {
  return !!step && MANUAL_TASK_ACTION_TYPES.has(step.actionType);
}

export interface EnrollmentStepContext {
  enrollment: WorkflowEnrollment;
  workflow?: Workflow;
  workflowName: string;
  /** First not-yet-done non-delay step, or null when the flow is finished. */
  nextStep: WorkflowStep | null;
  /** Whether `nextStep` needs the LO to act (MANUAL_TASK). */
  isNextStepManual: boolean;
  /** Most recently completed non-delay step, for a "you are here" read. */
  lastCompletedStep: WorkflowStep | null;
  actionStepsTotal: number;
  actionStepsDone: number;
  progressPct: number;
  status: WorkflowEnrollment["status"];
}

/** Build the step context for a single enrollment. */
export function getEnrollmentStepContext(
  enrollment: WorkflowEnrollment,
  workflows: Workflow[],
): EnrollmentStepContext {
  const workflow = workflows.find((w) => w.id === enrollment.workflowId);
  const steps = workflow ? mergeSteps(workflow.steps, enrollment.customSteps ?? []) : [];
  const statusByStepId = new Map(enrollment.stepProgress.map((p) => [p.stepId, p.status]));

  const actionSteps = steps.filter((s) => s.actionType !== "delay");
  const actionStepsDone = actionSteps.filter(
    (s) => statusByStepId.get(s.id) === "done" || statusByStepId.get(s.id) === "skipped",
  ).length;

  const nextStep = actionSteps.find((s) => (statusByStepId.get(s.id) ?? "pending") === "pending") ?? null;

  const completedSteps = actionSteps.filter(
    (s) => statusByStepId.get(s.id) === "done" || statusByStepId.get(s.id) === "skipped",
  );
  const lastCompletedStep = completedSteps.length > 0 ? completedSteps[completedSteps.length - 1] : null;

  const actionStepsTotal = actionSteps.length;

  return {
    enrollment,
    workflow,
    workflowName: workflow?.name ?? enrollment.workflowId,
    nextStep,
    isNextStepManual: isManualTaskStep(nextStep),
    lastCompletedStep,
    actionStepsTotal,
    actionStepsDone,
    progressPct: actionStepsTotal > 0 ? Math.round((actionStepsDone / actionStepsTotal) * 100) : 0,
    status: enrollment.status,
  };
}

/** Step contexts for every non-completed enrollment a contact is in. */
export function getContactWorkflowContexts(
  contactId: string,
  enrollments: WorkflowEnrollment[],
  workflows: Workflow[],
  opts: { includeCompleted?: boolean } = {},
): EnrollmentStepContext[] {
  return enrollments
    .filter((e) => e.contactId === contactId && (opts.includeCompleted || e.status !== "completed"))
    .map((e) => getEnrollmentStepContext(e, workflows));
}
