import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Users,
  Workflow,
  Calendar,
  User as UserIcon,
  Clock,
  Ban,
  RotateCcw,
  Edit,
} from "lucide-react";
import { useAppData } from "@/app/contexts/AppDataContext";
import type { FilterRule } from "@/app/types";
import { InlineToggle } from "@/app/components/email-workflows/segment-builder/InlineToggle";

const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

const FIELD_LABEL: Record<FilterRule["field"], string> = {
  listingStatus: "Listing Status",
  userType: "User Type",
};

function FilterRuleChip({
  rule,
  variant = "include",
}: {
  rule: FilterRule;
  variant?: "include" | "exclude";
}) {
  const opLabel = rule.operator === "=" ? "is" : "is not";
  const chipCls =
    variant === "include"
      ? "bg-green-50 border-green-200 text-green-900 dark:bg-green-950/40 dark:border-green-800 dark:text-green-200"
      : "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200";
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs border ${chipCls}`}>
      <span className="opacity-70">{FIELD_LABEL[rule.field]}</span>
      <span className="font-medium">{opLabel}</span>
      <span className="font-semibold">{rule.value}</span>
    </span>
  );
}

function LogicBadge({ label }: { label: string }) {
  return (
    <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
      {label}
    </span>
  );
}

export function SegmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { segments, contacts, workflows, handleUpdateSegment } = useAppData();

  const segment = segments.find((s) => s.id === id);

  const [confirmContactId, setConfirmContactId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<"contacts" | "settings">("contacts");

  const disabledIds = new Set(segment?.excludedContactIds ?? []);

  const commitToggle = (contactId: string) => {
    if (!segment) return;
    const current = segment.excludedContactIds ?? [];
    const next = disabledIds.has(contactId)
      ? current.filter((cid) => cid !== contactId)
      : [...current, contactId];
    handleUpdateSegment(segment.id, { excludedContactIds: next });
  };

  const handleActionClick = (e: React.MouseEvent, contactId: string) => {
    e.stopPropagation();
    if (disabledIds.has(contactId)) {
      commitToggle(contactId); // re-enable: no confirm needed
    } else {
      setConfirmContactId(contactId);
    }
  };

  const confirmContact = confirmContactId
    ? contacts.find((c) => c.id === confirmContactId)
    : null;


  if (!segment) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Segment not found.</p>
          <button
            onClick={() => navigate("/email-workflows/user-segments")}
            className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
          >
            Back to Segments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 sticky top-0 z-10">
        <div className="py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/email-workflows/user-segments")}
            className="p-1.5 rounded hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-foreground">{segment.name}</h2>
              <span
                className={`px-3 py-0.5 rounded-full text-xs ${
                  segment.status === "Active"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200"
                }`}
              >
                {segment.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {segment.description ?? "No description"}
            </p>
          </div>

          <div className="ml-auto">
            <button
              onClick={() => navigate("/email-workflows/flows/new", { state: { segmentId: segment.id } })}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all"
            >
              <Workflow className="w-4 h-4" />
              Create Workflow
            </button>
          </div>
        </div>
        <div className="-mx-8 border-t border-border" />

        {/* Rules summary */}
        {(segment.filters.length > 0 ||
          (segment.excludeFilters?.length ?? 0) > 0 ||
          (segment.includedContactIds?.length ?? 0) > 0 ||
          (segment.excludedContactIds?.length ?? 0) > 0) && (
          <div className="mt-3 space-y-2">
            {/* Include filters */}
            {segment.filters.length > 0 && (
              <div className="flex items-start gap-3 flex-wrap">
                <span className="text-xs font-semibold text-muted-foreground w-14 flex-shrink-0 pt-1">
                  Include
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {segment.filters.map((rule, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <FilterRuleChip rule={rule} variant="include" />
                      {i < segment.filters.length - 1 && (
                        <LogicBadge label={rule.logic} />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Exclude filters */}
            {(segment.excludeFilters?.length ?? 0) > 0 && (
              <div className="flex items-start gap-3 flex-wrap">
                <span className="text-xs font-semibold text-muted-foreground w-14 flex-shrink-0 pt-1">
                  Exclude
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {segment.excludeFilters!.map((rule, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <FilterRuleChip rule={rule} variant="exclude" />
                      {i < segment.excludeFilters!.length - 1 && (
                        <LogicBadge label={rule.logic} />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pinned contacts */}
            {((segment.includedContactIds?.length ?? 0) > 0 ||
              (segment.excludedContactIds?.length ?? 0) > 0) && (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-semibold text-muted-foreground w-14 flex-shrink-0">
                  Pinned
                </span>
                {(segment.includedContactIds?.length ?? 0) > 0 && (
                  <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800">
                    +{segment.includedContactIds!.length} always in
                  </span>
                )}
                {(segment.excludedContactIds?.length ?? 0) > 0 && (
                  <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800">
                    −{segment.excludedContactIds!.length} always out
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Stats row */}
        {(() => {
          const activeWorkflows = workflows.filter((w) => w.segmentId === segment.id && w.status === "active").length;
          const totalWorkflows = workflows.filter((w) => w.segmentId === segment.id).length;
          const excludedCount = segment.excludedContactIds?.length ?? 0;
          const stats = [
            { icon: <Users className="w-4.5 h-4.5 text-blue-600" />, label: "Contacts", value: segment.contactCount.toLocaleString() },
            { icon: <UserIcon className="w-4.5 h-4.5 text-muted-foreground" />, label: "Created By", value: segment.createdBy },
            { icon: <Calendar className="w-4.5 h-4.5 text-violet-600" />, label: "Created", value: formatDateTime(segment.createdAt) },
            { icon: <Clock className="w-4.5 h-4.5 text-amber-500" />, label: "Last Updated", value: formatDateTime(segment.lastUpdatedAt) },
            { icon: <Workflow className="w-4.5 h-4.5 text-emerald-600" />, label: "Workflows", value: `${totalWorkflows} total · ${activeWorkflows} active` },
            ...(excludedCount > 0 ? [{ icon: <Ban className="w-4.5 h-4.5 text-red-400" />, label: "Excluded", value: `${excludedCount} contact${excludedCount !== 1 ? "s" : ""}` }] : []),
          ];
          return (
            <div className="mt-3 pb-5 flex items-stretch gap-3">
              {stats.map((s) => (
                <div key={s.label} className="flex items-center gap-2 px-3 py-3 rounded-lg bg-white border border-gray-200 min-w-0 flex-1">
                  {s.icon}
                  <div className="min-w-0">
                    <div className="text-[10px] text-muted-foreground leading-none mb-0.5">{s.label}</div>
                    <div className="text-xs font-medium text-foreground truncate">{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Disable confirm modal */}
      {confirmContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-destructive/10 rounded-lg flex-shrink-0">
                <Ban className="w-5 h-5 text-destructive" />
              </div>
              <h2 className="text-base font-semibold">Disable contact in segment?</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              <span className="font-medium text-foreground">
                {confirmContact.firstName} {confirmContact.lastName}
              </span>{" "}
              will be excluded from this segment and won't receive any future sends. You can
              re-enable them at any time.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmContactId(null)}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  commitToggle(confirmContact.id);
                  setConfirmContactId(null);
                }}
                className="px-4 py-2 text-sm rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-all"
              >
                Disable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="border-b border-border bg-card px-8 flex gap-1">
        {(["contacts", "settings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setDetailTab(tab)}
            className={`relative px-4 py-3 text-sm transition-colors capitalize ${
              detailTab === tab
                ? "font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {detailTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Configuration tab */}
      {detailTab === "settings" && (
        <div className="flex-1 overflow-auto px-8 py-6">
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Status */}
            <div className="bg-card border border-border rounded-xl px-6 py-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                Status
              </p>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className={`text-sm font-semibold ${segment.status === "Active" ? "text-green-700" : "text-muted-foreground"}`}>
                    {segment.status}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {segment.status === "Active"
                      ? "This segment is live and contacts will be enrolled in workflows."
                      : "This segment is paused and will not enroll contacts in workflows."}
                  </p>
                </div>
                <InlineToggle
                  checked={segment.status === "Active"}
                  onChange={(v) =>
                    handleUpdateSegment(segment.id, { status: v ? "Active" : "Inactive" })
                  }
                />
              </div>
            </div>

            {/* Rules */}
            <div className="bg-card border border-border rounded-xl px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Segment Rules
                </p>
                <button
                  onClick={() =>
                    navigate("/email-workflows/user-segments/builder", {
                      state: { segmentId: segment.id },
                    })
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <Edit className="w-4.5 h-4.5" />
                  Edit Rules
                </button>
              </div>

              {segment.filters.length === 0 &&
              !segment.excludeFilters?.length &&
              !segment.includedContactIds?.length &&
              !segment.excludedContactIds?.length ? (
                <p className="text-sm text-muted-foreground">No rules defined.</p>
              ) : (
                <div className="space-y-3">
                  {segment.filters.length > 0 && (
                    <div className="flex items-start gap-3 flex-wrap">
                      <span className="text-xs font-semibold text-muted-foreground w-14 flex-shrink-0 pt-1">Include</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {segment.filters.map((rule, i) => (
                          <span key={i} className="flex items-center gap-1.5">
                            <FilterRuleChip rule={rule} variant="include" />
                            {i < segment.filters.length - 1 && <LogicBadge label={rule.logic} />}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(segment.excludeFilters?.length ?? 0) > 0 && (
                    <div className="flex items-start gap-3 flex-wrap">
                      <span className="text-xs font-semibold text-muted-foreground w-14 flex-shrink-0 pt-1">Exclude</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {segment.excludeFilters!.map((rule, i) => (
                          <span key={i} className="flex items-center gap-1.5">
                            <FilterRuleChip rule={rule} variant="exclude" />
                            {i < segment.excludeFilters!.length - 1 && <LogicBadge label={rule.logic} />}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {((segment.includedContactIds?.length ?? 0) > 0 ||
                    (segment.excludedContactIds?.length ?? 0) > 0) && (
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-semibold text-muted-foreground w-14 flex-shrink-0">Pinned</span>
                      {(segment.includedContactIds?.length ?? 0) > 0 && (
                        <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border bg-blue-50 text-blue-600 border-blue-200">
                          +{segment.includedContactIds!.length} always in
                        </span>
                      )}
                      {(segment.excludedContactIds?.length ?? 0) > 0 && (
                        <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border bg-red-50 text-red-600 border-red-200">
                          −{segment.excludedContactIds!.length} always out
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Contacts tab */}
      {detailTab === "contacts" && (
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="max-w-7xl mx-auto">
        <div className="bg-card border border-border rounded-lg w-fit min-w-full">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border sticky top-0">
              <tr>
                {["Action", "Name", "Email", "User Type", "Listing Status", "Listing Name"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-6 py-4 text-left text-sm text-muted-foreground"
                      style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {contacts.map((contact) => {
                const isDisabled = disabledIds.has(contact.id);
                return (
                  <tr
                    key={contact.id}
                    className={`transition-colors ${isDisabled ? "opacity-50 bg-muted/20" : "hover:bg-muted/20 cursor-pointer"}`}
                    onClick={() => !isDisabled && navigate(`/crm/contacts/${contact.id}`)}
                  >
                    {/* Action */}
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => handleActionClick(e, contact.id)}
                        title={isDisabled ? "Re-enable in segment" : "Disable in segment"}
                        className={`p-1.5 rounded-md transition-colors ${
                          isDisabled
                            ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                            : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        }`}
                      >
                        {isDisabled ? (
                          <RotateCcw className="w-4 h-4" />
                        ) : (
                          <Ban className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {contact.firstName} {contact.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {contact.email}
                    </td>
                    <td className="px-6 py-4 text-sm">{contact.userType}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-muted border border-border">
                        {contact.listingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {contact.listingName}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {contacts.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No contacts in this view</p>
            </div>
          )}
        </div>
        </div>
      </div>
      )}
    </div>
  );
}
