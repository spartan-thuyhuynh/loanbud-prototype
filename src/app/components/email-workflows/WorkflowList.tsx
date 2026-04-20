import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Pencil, Trash2, LayoutList, ChevronRight, PlayCircle, PauseCircle } from "lucide-react";
import { Button } from "../ui/button";
import { useAppData } from "../../contexts/AppDataContext";

const ACTION_TYPE_LABELS: Record<string, string> = {
  email: "Email",
  sms: "SMS",
  "call-reminder": "Call",
};

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
}

export function WorkflowList() {
  const navigate = useNavigate();
  const { workflows, handleDeleteWorkflow, handleUpdateWorkflow } = useAppData();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const totalFlows = workflows.length;
  const activeFlows = workflows.filter((w) => w.status === "active").length;
  const totalEnrolled = workflows.reduce((sum, w) => sum + w.enrolledCount, 0);

  const handleRowClick = (id: string) => {
    navigate(`/email-workflows/flows/${id}/board`);
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigate(`/email-workflows/flows/${id}/edit`);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDeleteId) {
      handleDeleteWorkflow(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  const handleToggleStatus = (e: React.MouseEvent, id: string, currentStatus: string) => {
    e.stopPropagation();
    if (currentStatus === "active") {
      handleUpdateWorkflow(id, { status: "paused" });
    } else {
      handleUpdateWorkflow(id, { status: "active", createdAt: new Date() });
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Flows</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and track contact workflows</p>
        </div>
        <Button onClick={() => navigate("/email-workflows/flows/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Flow
        </Button>
      </div>

      {/* Stats */}
      <div className="px-8 py-4 flex gap-4 border-b border-border bg-card">
        {[
          { label: "Total Flows", value: totalFlows },
          { label: "Active Flows", value: activeFlows },
          { label: "Total Enrolled", value: totalEnrolled },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-border bg-background px-5 py-3 min-w-[120px]">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold text-foreground mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <LayoutList className="h-12 w-12 opacity-30" />
            <p className="text-lg font-medium text-foreground">No Flows Yet</p>
            <p className="text-sm">Create your first workflow to start nurturing contacts.</p>
            <Button className="mt-2" onClick={() => navigate("/email-workflows/flows/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Flow
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  {["Name", "Segment", "Status", "Steps", "Activated", "Actions"].map((col) => (
                    <th key={col} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {workflows.map((wf) => (
                  <tr
                    key={wf.id}
                    className="hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(wf.id)}
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground">{wf.name}</div>
                      {wf.description && (
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{wf.description}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{wf.segmentName}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        wf.status === "active" ? "bg-green-100 text-green-700 border border-green-200"
                        : wf.status === "paused" ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                        : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}>
                        {wf.status.charAt(0).toUpperCase() + wf.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <div className="flex flex-wrap gap-1">
                        {wf.steps.slice(0, 3).map((s) => (
                          <span key={s.id} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                            Day {s.dayOffset} · {ACTION_TYPE_LABELS[s.actionType] ?? s.actionType}
                          </span>
                        ))}
                        {wf.steps.length > 3 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground font-medium">
                            +{wf.steps.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {wf.status === "active" ? formatDate(wf.createdAt) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {confirmDeleteId === wf.id ? (
                          <>
                            <button
                              className="px-2 py-1 text-xs rounded bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={confirmDelete}
                            >
                              Delete
                            </button>
                            <button
                              className="px-2 py-1 text-xs rounded border border-border hover:bg-muted"
                              onClick={cancelDelete}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="p-1.5 rounded hover:bg-muted transition-colors"
                              onClick={(e) => handleToggleStatus(e, wf.id, wf.status)}
                              title={wf.status === "active" ? "Pause" : "Activate"}
                            >
                              {wf.status === "active"
                                ? <PauseCircle className="h-3.5 w-3.5 text-yellow-500" />
                                : <PlayCircle className="h-3.5 w-3.5 text-green-600" />
                              }
                            </button>
                            <button
                              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              onClick={(e) => handleEdit(e, wf.id)}
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                              onClick={(e) => handleDeleteClick(e, wf.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              onClick={() => handleRowClick(wf.id)}
                              title="View Board"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
