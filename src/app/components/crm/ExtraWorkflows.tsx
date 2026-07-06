import { useState } from "react";
import { Link } from "react-router";
import {
  Workflow as WorkflowIcon,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useAppData } from "@/app/contexts/AppDataContext";
import { getContactWorkflowContexts } from "@/app/lib/workflowContextUtils";

interface ExtraWorkflowsProps {
  contactId: string;
}

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  paused: "Paused",
  completed: "Completed",
};

/**
 * RFC-008 (story -02): the "Workflows" card on contact detail — the one
 * contact-context surface missing today. Lists each enrollment with its current /
 * next step (name + status), a MANUAL_TASK "Action required" badge, progress, and a
 * deep link to the workflow board. Rendered under V2 only.
 */
export function ExtraWorkflows({ contactId }: ExtraWorkflowsProps) {
  const { workflowEnrollments, workflows } = useAppData();
  const [open, setOpen] = useState(true);

  const contexts = getContactWorkflowContexts(contactId, workflowEnrollments, workflows);

  return (
    <div className="px-5 py-5 border-b border-border">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center justify-between w-full mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Workflows</h3>
          <span className="text-[9px] font-bold text-primary/70 uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10">
            RFC-008
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {contexts.length > 0 && (
            <span className="text-xs font-semibold px-1.5 py-0.5 bg-muted text-muted-foreground rounded-full">
              {contexts.length}
            </span>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        contexts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <WorkflowIcon className="w-7 h-7 mb-2 opacity-20" />
            <p className="text-xs">Not enrolled in any workflow</p>
          </div>
        ) : (
          <div className="space-y-2">
            {contexts.map((ctx) => (
              <div key={ctx.enrollment.id} className="p-3 border border-border rounded-xl bg-background">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ctx.status === "paused" ? "bg-amber-400" : "bg-green-500"}`} />
                  <span className="text-sm font-medium text-foreground truncate flex-1">{ctx.workflowName}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded-full shrink-0">
                    {STATUS_LABEL[ctx.status] ?? ctx.status}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  {ctx.nextStep ? (
                    <>
                      <span className="text-xs text-muted-foreground">
                        Next: <span className="text-foreground font-medium">{ctx.nextStep.name}</span>
                      </span>
                      {ctx.isNextStepManual && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          <AlertCircle className="w-2.5 h-2.5" /> Action required
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">All steps complete</span>
                  )}
                </div>

                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60 rounded-full" style={{ width: `${ctx.progressPct}%` }} />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-muted-foreground">{ctx.actionStepsDone}/{ctx.actionStepsTotal} steps</span>
                  <Link
                    to={`/crm/workflows/${ctx.enrollment.workflowId}/board`}
                    state={{ openContactId: ctx.enrollment.contactId, openEnrollmentId: ctx.enrollment.id }}
                    className="flex items-center gap-0.5 text-[11px] text-primary hover:underline font-medium"
                  >
                    View workflow <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
