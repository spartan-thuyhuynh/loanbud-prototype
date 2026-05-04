import type { CustomWorkflowStep, WorkflowStep } from "../types";

export function computeDayOffsets(steps: WorkflowStep[]): WorkflowStep[] {
  let acc = 0;
  return steps.map((step) => {
    const offset = acc;
    if (step.actionType === "delay") acc += step.delayDays ?? 0;
    return { ...step, dayOffset: offset };
  });
}

export function mergeSteps(
  baseSteps: WorkflowStep[],
  customSteps: CustomWorkflowStep[] = [],
): WorkflowStep[] {
  return computeDayOffsets(
    [...baseSteps, ...customSteps].sort((a, b) => a.order - b.order),
  );
}

export function nextFractionalOrder(afterOrder: number, existingOrders: number[]): number {
  const next = existingOrders.filter((o) => o > afterOrder).sort((a, b) => a - b)[0] ?? afterOrder + 1;
  let candidate = (afterOrder + next) / 2;
  while (existingOrders.includes(candidate) && candidate < next) {
    candidate = (candidate + next) / 2;
  }
  return candidate;
}
