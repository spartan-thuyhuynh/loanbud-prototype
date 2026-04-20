import {
  Eye,
  MousePointerClick,
  AlertCircle,
  CheckCircle2,
  Phone,
  Edit,
  Users,
  UserMinus,
} from "lucide-react";
import type { CampaignDetailContact } from "../types";

interface CampaignContactTableProps {
  contacts: CampaignDetailContact[];
  selectedContacts: string[];
  onSelectAll: () => void;
  onSelectContact: (id: string) => void;
  onRemoveContact: (id: string) => void;
}

function getEngagementColor(engagement: string): string {
  switch (engagement) {
    case "clicked":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "opened":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "delivered":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function getEngagementIcon(engagement: string) {
  switch (engagement) {
    case "clicked":
      return <MousePointerClick className="w-4 h-4" />;
    case "opened":
      return <Eye className="w-4 h-4" />;
    case "delivered":
      return <CheckCircle2 className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
}

export function CampaignContactTable({
  contacts,
  selectedContacts,
  onSelectAll,
  onSelectContact,
  onRemoveContact,
}: CampaignContactTableProps) {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full">
        <thead className="bg-muted/50 border-b border-border sticky top-0">
          <tr>
            <th className="px-6 py-4 text-left">
              <input
                type="checkbox"
                checked={
                  selectedContacts.length === contacts.length &&
                  contacts.length > 0
                }
                onChange={onSelectAll}
                className="rounded border-border"
              />
            </th>
            <th
              className="px-6 py-4 text-left text-sm text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Contact
            </th>
            <th
              className="px-6 py-4 text-left text-sm text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Current Status
            </th>
            <th
              className="px-6 py-4 text-left text-sm text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Engagement
            </th>
            <th
              className="px-6 py-4 text-left text-sm text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Segment Match
            </th>
            <th
              className="px-6 py-4 text-left text-sm text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Last Updated
            </th>
            <th
              className="px-6 py-4 text-left text-sm text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {contacts.map((contact) => (
            <tr
              key={contact.id}
              className={`hover:bg-muted/20 transition-colors ${
                selectedContacts.includes(contact.id) ? "bg-muted/10" : ""
              }`}
            >
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedContacts.includes(contact.id)}
                  onChange={() => onSelectContact(contact.id)}
                  className="rounded border-border"
                />
              </td>
              <td className="px-6 py-4">
                <div>
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {contact.email}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium truncate">{contact.listingName}</div>
                <span className="mt-1 inline-block px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                  {contact.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border ${getEngagementColor(contact.engagement)}`}
                >
                  {getEngagementIcon(contact.engagement)}
                  <span className="capitalize">
                    {contact.engagement.replace("-", " ")}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                {contact.stillInSegment ? (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Still matches</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-amber-700 mb-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>No longer matches</span>
                    </div>
                    {contact.driftReason && (
                      <div className="text-xs text-amber-600 italic">
                        {contact.driftReason}
                      </div>
                    )}
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  {contact.lastUpdated.toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    className="p-2 hover:bg-muted rounded-lg transition-all"
                    title="Create task"
                  >
                    <Phone className="w-4 h-4 text-primary" />
                  </button>
                  <button
                    className="p-2 hover:bg-muted rounded-lg transition-all"
                    title="Update status"
                  >
                    <Edit className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => onRemoveContact(contact.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove from campaign"
                  >
                    <UserMinus className="w-4 h-4 text-muted-foreground hover:text-red-600" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {contacts.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No contacts match the current filters</p>
        </div>
      )}
    </div>
  );
}
