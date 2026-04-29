import { useState } from "react";
import { Search, X } from "lucide-react";
import type { Contact } from "@/app/types";
import { getAvatarColor, getInitials } from "../campaign-data";

interface PinnedContact {
  contactId: string;
  mode: "include" | "exclude";
}

interface SpecificContactPickerProps {
  contacts: Contact[];
  pinned: PinnedContact[];
  /** Only show and add contacts with this mode */
  filterMode: "include" | "exclude";
  onAdd: (contactId: string, mode: "include" | "exclude") => void;
  onToggleMode: (contactId: string) => void;
  onRemove: (contactId: string) => void;
}

export function SpecificContactPicker({
  contacts,
  pinned,
  filterMode,
  onAdd,
  onToggleMode,
  onRemove,
}: SpecificContactPickerProps) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const allPinnedIds = new Set(pinned.map((p) => p.contactId));
  const visiblePinned = pinned.filter((p) => p.mode === filterMode);

  const filtered = query.trim()
    ? contacts
        .filter((c) => !allPinnedIds.has(c.id))
        .filter((c) => {
          const name = `${c.firstName} ${c.lastName}`.toLowerCase();
          const email = c.email.toLowerCase();
          const q = query.toLowerCase();
          return name.includes(q) || email.includes(q);
        })
        .slice(0, 8)
    : [];

  const pinnedContacts = visiblePinned
    .map(({ contactId, mode }) => ({
      contact: contacts.find((c) => c.id === contactId),
      mode,
    }))
    .filter((p): p is { contact: Contact; mode: "include" | "exclude" } =>
      p.contact !== undefined,
    );

  return (
    <div className="space-y-2">
      {/* Search input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search contacts to pin..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
        />

        {/* Dropdown */}
        {showDropdown && filtered.length > 0 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
            {filtered.map((contact) => (
              <button
                key={contact.id}
                onMouseDown={() => {
                  onAdd(contact.id, filterMode);
                  setQuery("");
                  setShowDropdown(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-muted/60 transition-colors text-left"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${getAvatarColor(contact.firstName, contact.lastName)}`}
                >
                  {getInitials(contact.firstName, contact.lastName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {contact.firstName} {contact.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex-shrink-0">
                  {contact.userType}
                </span>
              </button>
            ))}
          </div>
        )}
        {showDropdown && query.trim() && filtered.length === 0 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg px-4 py-3">
            <p className="text-sm text-muted-foreground">No contacts found</p>
          </div>
        )}
      </div>

      {/* Pinned contact cards */}
      {pinnedContacts.map(({ contact, mode }) => (
        <div
          key={contact.id}
          className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg"
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${getAvatarColor(contact.firstName, contact.lastName)}`}
          >
            {getInitials(contact.firstName, contact.lastName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {contact.firstName} {contact.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
          </div>
          {/* Mode toggle pill */}
          <button
            onClick={() => onToggleMode(contact.id)}
            className={`flex-shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full border transition-colors ${
              mode === "include"
                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800"
                : "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
            }`}
          >
            {mode === "include" ? "Include" : "Exclude"}
          </button>
          <button
            onClick={() => onRemove(contact.id)}
            className="flex-shrink-0 p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
