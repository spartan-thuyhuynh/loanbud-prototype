import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Users,
  Edit,
  Workflow,
  Calendar,
  User as UserIcon,
  Clock,
} from "lucide-react";
import { useAppData } from "@/app/contexts/AppDataContext";
import type { FilterRule } from "@/app/types";

const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

function FilterRuleChip({ rule }: { rule: FilterRule }) {
  const fieldLabel: Record<FilterRule["field"], string> = {
    listingStatus: "Listing Status",
    userType: "User Type",
  };
  const opLabel = rule.operator === "=" ? "is" : "is not";
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs border bg-white border-border text-foreground">
      <span className="text-muted-foreground">{fieldLabel[rule.field]}</span>
      <span className="font-medium text-primary">{opLabel}</span>
      <span className="font-semibold">{rule.value}</span>
    </span>
  );
}

export function SegmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { segments, contacts } = useAppData();

  const segment = segments.find((s) => s.id === id);

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
      <div className="border-b border-border bg-card px-8 py-6">
        <button
          onClick={() => navigate("/email-workflows/user-segments")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Segments</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1
                className="text-2xl"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                {segment.name}
              </h1>
              <span
                className={`mt-1 inline-block px-3 py-0.5 rounded-full text-xs ${
                  segment.status === "Active"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200"
                }`}
              >
                {segment.status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                navigate("/email-workflows/user-segments/builder", {
                  state: { segmentId: segment.id },
                })
              }
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => navigate("/email-workflows/flows/new")}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all"
            >
              <Workflow className="w-4 h-4" />
              Create Workflow
            </button>
          </div>
        </div>

        {/* Filter rules */}
        {segment.filters.length > 0 && (
          <div className="mt-5 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">Filters:</span>
            {segment.filters.map((rule, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <FilterRuleChip rule={rule} />
                {i < segment.filters.length - 1 && (
                  <span className="text-[10px] font-bold uppercase text-muted-foreground px-1">
                    {rule.logic}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          <div className="bg-white rounded-xl px-5 py-4 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-blue-600/10 rounded-lg">
              <UserIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Created By</div>
              <div className="text-sm font-medium truncate max-w-[120px]">
                {segment.createdBy}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl px-5 py-4 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-violet-600/10 rounded-lg">
              <Calendar className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Created At</div>
              <div
                className="text-xs font-medium"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatDateTime(segment.createdAt)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl px-5 py-4 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Last Updated</div>
              <div
                className="text-xs font-medium"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatDateTime(segment.lastUpdatedAt)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="bg-card border border-border rounded-lg w-fit min-w-full">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border sticky top-0">
              <tr>
                {["Name", "Email", "User Type", "Listing Status", "Listing Name"].map(
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
              {contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => navigate(`/crm/contacts/${contact.id}`)}
                >
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
              ))}
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
  );
}
