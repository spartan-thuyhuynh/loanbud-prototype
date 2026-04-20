import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Users,
  Edit,
  Mail,
  Calendar,
  User as UserIcon,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useAppData } from "@/app/contexts/AppDataContext";
import type { Contact, FilterRule } from "@/app/types";
import type { Campaign } from "./campaign/types";

type DetailTab = "contacts" | "campaigns";
type ContactFilter = "all" | "in-segment" | "drifted";

const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

function campaignDate(c: Campaign): Date {
  return c.sentAt ?? c.scheduledFor ?? new Date(0);
}

function matchesFilters(contact: Contact, filters: FilterRule[]): boolean {
  if (filters.length === 0) return true;
  const record = contact as unknown as Record<string, string>;
  let result = filters[0].operator === "=" ? record[filters[0].field] === filters[0].value : record[filters[0].field] !== filters[0].value;
  for (let i = 1; i < filters.length; i++) {
    const f = filters[i];
    const next = f.operator === "=" ? record[f.field] === f.value : record[f.field] !== f.value;
    result = filters[i - 1].logic === "and" ? result && next : result || next;
  }
  return result;
}

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
  const { segments, contacts, campaigns } = useAppData();

  const segment = segments.find((s) => s.id === id);
  const [activeTab, setActiveTab] = useState<DetailTab>("contacts");
  const [contactFilter, setContactFilter] = useState<ContactFilter>("all");

  const { inSegment, drifted } = useMemo(() => {
    if (!segment) return { inSegment: [] as Contact[], drifted: [] as Contact[] };
    const inn: Contact[] = [];
    const out: Contact[] = [];
    for (const c of contacts) {
      (matchesFilters(c, segment.filters) ? inn : out).push(c);
    }
    return { inSegment: inn, drifted: out };
  }, [contacts, segment]);

  const visibleContacts = useMemo(() => {
    if (contactFilter === "in-segment") return inSegment;
    if (contactFilter === "drifted") return drifted;
    return contacts;
  }, [contactFilter, contacts, inSegment, drifted]);

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

  const relatedCampaigns = campaigns.filter((c) => c.segmentName === segment.name);

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
              onClick={() =>
                navigate("/email-workflows/compose", {
                  state: { segmentId: segment.id },
                })
              }
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all"
            >
              <Mail className="w-4 h-4" />
              Create Campaign
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
        <div className="grid grid-cols-5 gap-4 mt-5">
          <div className="bg-white rounded-xl px-5 py-4 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">In Segment</div>
              <div
                className="text-xl"
                style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
              >
                {inSegment.length.toLocaleString()}
              </div>
            </div>
          </div>

          <div
            className={`bg-white rounded-xl px-5 py-4 shadow-sm flex items-center gap-3 ${drifted.length > 0 ? "border border-amber-300" : ""}`}
          >
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">No Longer in Segment</div>
              <div
                className={`text-xl ${drifted.length > 0 ? "text-amber-600" : ""}`}
                style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
              >
                {drifted.length.toLocaleString()}
              </div>
            </div>
          </div>

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

      {/* Tab bar */}
      <div className="flex gap-0 border-b border-border px-8 bg-card">
        <button
          onClick={() => setActiveTab("contacts")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "contacts"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="w-4 h-4" />
          Contacts
          <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-muted rounded-full">
            {contacts.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "campaigns"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mail className="w-4 h-4" />
          Campaigns
          <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-muted rounded-full">
            {relatedCampaigns.length}
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {activeTab === "contacts" && (
          <>
            {/* Contact sub-filter */}
            <div className="flex items-center gap-2 mb-4">
              {(
                [
                  { key: "all", label: "All", count: contacts.length },
                  { key: "in-segment", label: "Still in Segment", count: inSegment.length },
                  { key: "drifted", label: "No Longer in Segment", count: drifted.length },
                ] as { key: ContactFilter; label: string; count: number }[]
              ).map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setContactFilter(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    contactFilter === key
                      ? key === "drifted"
                        ? "bg-amber-100 text-amber-700 border border-amber-300"
                        : "bg-primary/10 text-primary border border-primary/30"
                      : "border border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {key === "drifted" && <AlertTriangle className="w-3.5 h-3.5" />}
                  {label}
                  <span className="px-1.5 py-0.5 text-[10px] bg-muted rounded-full">
                    {count}
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-card border border-border rounded-lg w-fit min-w-full">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border sticky top-0">
                  <tr>
                    {["Name", "Email", "User Type", "Listing Status", "Listing Name", "Segment Match"].map(
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
                  {visibleContacts.map((contact) => {
                    const inSeg = matchesFilters(contact, segment.filters);
                    return (
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
                        <td className="px-6 py-4">
                          {segment.filters.length === 0 ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : inSeg ? (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 border border-green-200">
                              In segment
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 border border-amber-200 w-fit">
                              <AlertTriangle className="w-3 h-3" />
                              No longer matches
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {visibleContacts.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No contacts in this view</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "campaigns" && (
          <>
            {relatedCampaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Mail className="w-12 h-12 mb-3 opacity-40" />
                <p className="mb-4">No campaigns use this segment yet.</p>
                <button
                  onClick={() =>
                    navigate("/email-workflows/compose", {
                      state: { segmentId: segment.id },
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all"
                >
                  <Mail className="w-4 h-4" />
                  Create Campaign
                </button>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg w-fit min-w-full">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border sticky top-0">
                    <tr>
                      {["Campaign Name", "Status", "Date", "Recipients"].map((col) => (
                        <th
                          key={col}
                          className="px-6 py-4 text-left text-sm text-muted-foreground"
                          style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {relatedCampaigns.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => navigate(`/email-workflows/campaigns/${c.id}`)}
                      >
                        <td className="px-6 py-4 font-medium">{c.name}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full border ${
                              c.status === "sent"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : c.status === "scheduled"
                                  ? "bg-blue-100 text-blue-700 border-blue-200"
                                  : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 text-sm text-muted-foreground"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {formatDateTime(campaignDate(c))}
                        </td>
                        <td
                          className="px-6 py-4 text-sm"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {c.recipientCount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
