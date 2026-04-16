import { TriangleAlert } from "lucide-react";
import type { Contact } from "@/app/types";
import { getAvatarColor, getInitials } from "../campaign-data";

interface SegmentPreviewPanelProps {
  matchingContacts: Contact[];
  totalContacts: number;
  hasNoFilters: boolean;
}

export function SegmentPreviewPanel({
  matchingContacts,
  totalContacts,
  hasNoFilters,
}: SegmentPreviewPanelProps) {
  const previewContacts = matchingContacts.slice(0, 25);
  const dbPercent =
    totalContacts > 0
      ? ((matchingContacts.length / totalContacts) * 100).toFixed(2)
      : "0.00";

  return (
    <div className="w-96 flex-shrink-0 border-l border-border bg-card flex flex-col overflow-hidden">
      {/* Panel header */}
      <div className="px-4 pt-4 pb-3 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">
            Matching contacts
          </h3>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/40 rounded-lg px-3 py-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Estimated Size
            </p>
            <p className="text-xl font-semibold text-foreground mt-0.5">
              {matchingContacts.length}
            </p>
            <p className="text-[11px] text-muted-foreground">Contacts</p>
          </div>
          <div className="bg-muted/40 rounded-lg px-3 py-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              % of Database
            </p>
            <p className="text-xl font-semibold text-foreground mt-0.5">
              {dbPercent}%
            </p>
            <p className="text-[11px] text-muted-foreground">Contacts</p>
          </div>
        </div>
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto">
        {hasNoFilters ? (
          <div className="flex items-center justify-center h-full px-6">
            <p className="text-sm text-muted-foreground text-center">
              Add filters to preview matching contacts
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-border">
              {previewContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors w-full"
                >
                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${getAvatarColor(contact.firstName, contact.lastName)}`}
                  >
                    {getInitials(contact.firstName, contact.lastName)}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {contact.firstName} {contact.lastName}
                      </span>
                      {contact.optedOut && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-destructive/10 text-destructive rounded-full border border-destructive/20 flex-shrink-0">
                          Opted out
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {contact.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {contact.listingName}
                    </p>
                  </div>
                  {/* Badges */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">
                      {contact.userType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {matchingContacts.length > 25 && (
              <div className="flex items-center gap-1.5 px-4 py-3 text-xs text-muted-foreground border-t border-border">
                <TriangleAlert className="w-3 h-3 flex-shrink-0" />
                Preview limited to first 25 results
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
