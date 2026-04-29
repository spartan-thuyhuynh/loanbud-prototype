import { useState, useMemo, Fragment } from "react";
import { Plus, Save, ChevronDown } from "lucide-react";
import { getAvatarColor, getInitials } from "./campaign-data";
import type { Contact } from "@/app/types";
import type { FilterGroup, FilterRule, SavedSegment } from "./types";
import { FilterGroupCard } from "./segment-builder/FilterGroupCard";
import { SegmentPreviewPanel } from "./segment-builder/SegmentPreviewPanel";
import { SaveSegmentModal } from "./segment-builder/SaveSegmentModal";
import { SpecificContactPicker } from "./segment-builder/SpecificContactPicker";

export type { SavedSegment };

interface SegmentBuilderProps {
  contacts: Contact[];
  savedSegments: SavedSegment[];
  onSaveSegment: (segment: SavedSegment) => void;
  onDeleteSegment: (id: string) => void;
  onBack?: () => void;
  initialName?: string;
  initialDescription?: string;
  /** Pre-populate the builder for editing an existing segment */
  initialSegment?: SavedSegment;
  /** Hide the outer shell header; show Save inside the panel */
  embeddedMode?: boolean;
}

type PinnedContact = { contactId: string; mode: "include" | "exclude" };
type ActiveTab = "include" | "exclude";

function makeGroup(): FilterGroup {
  return { id: `group-${Date.now()}-${Math.random()}`, filters: [], connectorAfter: "or" };
}

function evalFilter(f: FilterRule, contact: Contact): boolean {
  const val = (contact as unknown as Record<string, string>)[f.field];
  return f.operator === "=" ? val === f.value : val !== f.value;
}

function evalGroup(group: FilterGroup, contact: Contact): boolean {
  let result = evalFilter(group.filters[0], contact);
  for (let i = 1; i < group.filters.length; i++) {
    const next = evalFilter(group.filters[i], contact);
    result = group.filters[i - 1].logic === "and" ? result && next : result || next;
  }
  return result;
}

function matchGroups(groups: FilterGroup[], contacts: Contact[]): Contact[] {
  const nonEmpty = groups.filter((g) => g.filters.length > 0);
  if (nonEmpty.length === 0) return [];
  return contacts.filter((contact) => {
    let result = evalGroup(nonEmpty[0], contact);
    for (let i = 1; i < nonEmpty.length; i++) {
      const next = evalGroup(nonEmpty[i], contact);
      result = nonEmpty[i - 1].connectorAfter === "and" ? result && next : result || next;
    }
    return result;
  });
}

function useGroupState(initial: FilterGroup[]) {
  const [groups, setGroups] = useState<FilterGroup[]>(initial);

  const addGroup = () => setGroups((prev) => [...prev, makeGroup()]);

  const toggleGroupConnector = (groupId: string) =>
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, connectorAfter: g.connectorAfter === "and" ? "or" : "and" }
          : g,
      ),
    );

  const toggleFilterLogic = (groupId: string, filterIdx: number) =>
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              filters: g.filters.map((f, i) =>
                i === filterIdx ? { ...f, logic: f.logic === "and" ? "or" : "and" } : f,
              ),
            }
          : g,
      ),
    );

  const removeGroup = (groupId: string) =>
    setGroups((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((g) => g.id !== groupId);
    });

  const duplicateGroup = (groupId: string) =>
    setGroups((prev) => {
      const idx = prev.findIndex((g) => g.id === groupId);
      if (idx === -1) return prev;
      const copy: FilterGroup = {
        id: `group-${Date.now()}`,
        filters: prev[idx].filters.map((f) => ({ ...f })),
        connectorAfter: prev[idx].connectorAfter,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });

  const addFilter = (groupId: string) =>
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              filters: [
                ...g.filters,
                { field: "listingStatus", operator: "=", value: "New", logic: "and" },
              ],
            }
          : g,
      ),
    );

  const updateFilter = (groupId: string, index: number, updates: Partial<FilterRule>) =>
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, filters: g.filters.map((f, i) => (i === index ? { ...f, ...updates } : f)) }
          : g,
      ),
    );

  const removeFilter = (groupId: string, index: number) =>
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, filters: g.filters.filter((_, i) => i !== index) } : g,
      ),
    );

  const reset = () => setGroups([makeGroup()]);

  return {
    groups,
    addGroup,
    toggleGroupConnector,
    toggleFilterLogic,
    removeGroup,
    duplicateGroup,
    addFilter,
    updateFilter,
    removeFilter,
    reset,
  };
}

// ── readable labels ──────────────────────────────────────────────────────────
const FIELD_LABEL: Record<string, string> = {
  listingStatus: "Listing Status",
  userType: "User Type",
};
const OP_LABEL: Record<string, string> = { "=": "is", "!=": "is not" };

function FilterChip({ filter, variant }: { filter: FilterRule; variant: "include" | "exclude" }) {
  const base =
    variant === "include"
      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800"
      : "bg-destructive/10 text-destructive border-destructive/20";
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-full border ${base}`}>
      {FIELD_LABEL[filter.field] ?? filter.field} {OP_LABEL[filter.operator] ?? filter.operator}{" "}
      <strong className="ml-0.5">{filter.value}</strong>
    </span>
  );
}

function LogicBadge({ label }: { label: string }) {
  return (
    <span className="text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase tracking-wide">
      {label}
    </span>
  );
}

function GroupChips({
  groups,
  variant,
}: {
  groups: FilterGroup[];
  variant: "include" | "exclude";
}) {
  const nonEmpty = groups.filter((g) => g.filters.length > 0);
  if (nonEmpty.length === 0) return null;
  return (
    <div className="space-y-1">
      {nonEmpty.map((group, gi) => (
        <Fragment key={group.id}>
          <div className="flex flex-wrap gap-1.5 items-center">
            {group.filters.map((f, fi) => (
              <Fragment key={fi}>
                <FilterChip filter={f} variant={variant} />
                {fi < group.filters.length - 1 && <LogicBadge label={f.logic} />}
              </Fragment>
            ))}
          </div>
          {gi < nonEmpty.length - 1 && (
            <div className="pl-1">
              <LogicBadge label={group.connectorAfter} />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}

function RulesSummary({
  includeGroups,
  excludeGroups,
  specificContacts,
  contacts,
}: {
  includeGroups: FilterGroup[];
  excludeGroups: FilterGroup[];
  specificContacts: PinnedContact[];
  contacts: Contact[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [expandedPinned, setExpandedPinned] = useState<"include" | "exclude" | null>(null);

  const hasIncludeFilters = includeGroups.some((g) => g.filters.length > 0);
  const hasExcludeFilters = excludeGroups.some((g) => g.filters.length > 0);
  const pinnedIn = specificContacts.filter((p) => p.mode === "include");
  const pinnedOut = specificContacts.filter((p) => p.mode === "exclude");
  const includeCount = includeGroups.flatMap((g) => g.filters).length;
  const excludeCount = excludeGroups.flatMap((g) => g.filters).length;
  const hasRules =
    hasIncludeFilters || hasExcludeFilters || pinnedIn.length > 0 || pinnedOut.length > 0;

  const togglePinned = (mode: "include" | "exclude") =>
    setExpandedPinned((prev) => (prev === mode ? null : mode));

  const resolvePinnedContacts = (ids: PinnedContact[]) =>
    ids
      .map((p) => contacts.find((c) => c.id === p.contactId))
      .filter((c): c is Contact => c !== undefined);

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Header — always visible, acts as the toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Rules applied
          </span>
          {/* Compact count pills — visible even when collapsed */}
          {hasRules ? (
            <div className="flex items-center gap-1">
              {includeCount > 0 && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400">
                  {includeCount} inc
                </span>
              )}
              {excludeCount > 0 && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive">
                  {excludeCount} exc
                </span>
              )}
              {pinnedIn.length > 0 && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400">
                  +{pinnedIn.length}
                </span>
              )}
              {pinnedOut.length > 0 && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                  −{pinnedOut.length}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground/60">None</span>
          )}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform flex-shrink-0 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border px-4 pb-3 pt-2.5 max-h-48 overflow-y-auto space-y-2.5">
          {!hasRules ? (
            <p className="text-xs text-muted-foreground">No rules defined yet.</p>
          ) : (
            <>
              {hasIncludeFilters && (
                <div className="flex gap-2">
                  <span className="text-[11px] text-muted-foreground w-14 flex-shrink-0 pt-1">
                    Include
                  </span>
                  <GroupChips groups={includeGroups} variant="include" />
                </div>
              )}

              {hasExcludeFilters && (
                <div className="flex gap-2">
                  <span className="text-[11px] text-muted-foreground w-14 flex-shrink-0 pt-1">
                    Exclude
                  </span>
                  <GroupChips groups={excludeGroups} variant="exclude" />
                </div>
              )}

              {(pinnedIn.length > 0 || pinnedOut.length > 0) && (
                <div className="space-y-1.5">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[11px] text-muted-foreground w-14 flex-shrink-0">
                      Pinned
                    </span>
                    {pinnedIn.length > 0 && (
                      <button
                        onClick={() => togglePinned("include")}
                        className={`inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors ${
                          expandedPinned === "include"
                            ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300"
                            : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800"
                        }`}
                      >
                        +{pinnedIn.length} always in
                      </button>
                    )}
                    {pinnedOut.length > 0 && (
                      <button
                        onClick={() => togglePinned("exclude")}
                        className={`inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors ${
                          expandedPinned === "exclude"
                            ? "bg-destructive/20 text-destructive border-destructive/40"
                            : "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
                        }`}
                      >
                        −{pinnedOut.length} always out
                      </button>
                    )}
                  </div>

                  {expandedPinned && (
                    <div className="ml-16 space-y-1.5 pt-0.5">
                      {resolvePinnedContacts(
                        expandedPinned === "include" ? pinnedIn : pinnedOut,
                      ).map((contact) => (
                        <div key={contact.id} className="flex items-center gap-2">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-semibold flex-shrink-0 ${getAvatarColor(contact.firstName, contact.lastName)}`}
                          >
                            {getInitials(contact.firstName, contact.lastName)}
                          </div>
                          <span className="text-xs text-foreground">
                            {contact.firstName} {contact.lastName}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate">
                            {contact.email}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
function filtersToGroup(filters: FilterRule[] | undefined): FilterGroup[] {
  if (!filters?.length) return [makeGroup()];
  return [{ id: `group-init`, filters, connectorAfter: "or" }];
}

export function SegmentBuilder({
  contacts,
  onSaveSegment,
  onBack,
  initialName,
  initialDescription,
  initialSegment,
  embeddedMode = false,
}: SegmentBuilderProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("include");
  const [specificContacts, setSpecificContacts] = useState<PinnedContact[]>(() => {
    const inc = (initialSegment?.includedContactIds ?? []).map((id) => ({
      contactId: id,
      mode: "include" as const,
    }));
    const exc = (initialSegment?.excludedContactIds ?? []).map((id) => ({
      contactId: id,
      mode: "exclude" as const,
    }));
    return [...inc, ...exc];
  });

  const include = useGroupState(filtersToGroup(initialSegment?.filters));
  const exclude = useGroupState(filtersToGroup(initialSegment?.excludeFilters));

  const matchingContacts = useMemo(() => {
    const includeNonEmpty = include.groups.filter((g) => g.filters.length > 0);
    let base = includeNonEmpty.length === 0 ? contacts : matchGroups(include.groups, contacts);

    const excludeNonEmpty = exclude.groups.filter((g) => g.filters.length > 0);
    if (excludeNonEmpty.length > 0) {
      const excludeSet = new Set(matchGroups(exclude.groups, contacts).map((c) => c.id));
      base = base.filter((c) => !excludeSet.has(c.id));
    }

    const pinnedIncludeIds = new Set(
      specificContacts.filter((p) => p.mode === "include").map((p) => p.contactId),
    );
    const pinnedExcludeIds = new Set(
      specificContacts.filter((p) => p.mode === "exclude").map((p) => p.contactId),
    );

    const baseIds = new Set(base.map((c) => c.id));
    for (const id of pinnedIncludeIds) {
      if (!baseIds.has(id)) {
        const c = contacts.find((x) => x.id === id);
        if (c) base = [...base, c];
      }
    }

    base = base.filter((c) => !pinnedExcludeIds.has(c.id));
    return base;
  }, [contacts, include.groups, exclude.groups, specificContacts]);

  const hasNoFilters =
    include.groups.every((g) => g.filters.length === 0) && specificContacts.length === 0;

  const pinnedIncludeIds = specificContacts
    .filter((p) => p.mode === "include")
    .map((p) => p.contactId);

  const buildSegmentPayload = (name: string, description: string, id: string): SavedSegment => ({
    id,
    name,
    description,
    filters: include.groups.flatMap((g) => g.filters),
    createdAt: initialSegment?.createdAt ?? new Date(),
    excludeFilters: exclude.groups.flatMap((g) => g.filters),
    includedContactIds: specificContacts
      .filter((p) => p.mode === "include")
      .map((p) => p.contactId),
    excludedContactIds: specificContacts
      .filter((p) => p.mode === "exclude")
      .map((p) => p.contactId),
  });

  const handleSave = (name: string, description: string) => {
    onSaveSegment(buildSegmentPayload(name, description, `segment-${Date.now()}`));
    include.reset();
    exclude.reset();
    setSpecificContacts([]);
    setShowSaveModal(false);
  };

  const handleEmbeddedSave = () => {
    if (!initialSegment) return;
    onSaveSegment(
      buildSegmentPayload(initialSegment.name, initialSegment.description, initialSegment.id),
    );
  };

  const handleAddPinned = (contactId: string, mode: "include" | "exclude") =>
    setSpecificContacts((prev) => [...prev, { contactId, mode }]);

  const handleTogglePinnedMode = (contactId: string) =>
    setSpecificContacts((prev) =>
      prev.map((p) =>
        p.contactId === contactId
          ? { ...p, mode: p.mode === "include" ? "exclude" : "include" }
          : p,
      ),
    );

  const handleRemovePinned = (contactId: string) =>
    setSpecificContacts((prev) => prev.filter((p) => p.contactId !== contactId));

  const activeGroups = activeTab === "include" ? include : exclude;

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto w-full">
      {/* Header — hidden in embedded mode */}
      {!embeddedMode && (
        <div className="px-8 py-4 border-b border-border bg-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg hover:bg-muted/80 transition-all text-sm"
              >
                ← Back
              </button>
            )}
            <span className="text-muted-foreground text-sm">Segment Builder</span>
          </div>
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all text-sm"
          >
            <Save className="w-4 h-4" />
            Save segment
          </button>
        </div>
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: builder */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Rules overview */}
          <RulesSummary
            includeGroups={include.groups}
            excludeGroups={exclude.groups}
            specificContacts={specificContacts}
            contacts={contacts}
          />

          {/* Tabs */}
          <div className="border border-border rounded-lg bg-card">
            {/* Tab bar */}
            <div className="flex border-b border-border rounded-t-lg overflow-hidden">
              {(["include", "exclude"] as const).map((tab) => {
                const isActive = activeTab === tab;
                const filterCount =
                  tab === "include"
                    ? include.groups.flatMap((g) => g.filters).length +
                      specificContacts.filter((p) => p.mode === "include").length
                    : exclude.groups.flatMap((g) => g.filters).length +
                      specificContacts.filter((p) => p.mode === "exclude").length;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm transition-colors relative ${
                      isActive
                        ? "font-semibold text-foreground"
                        : "font-normal text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    }`}
                  >
                    {tab === "include" ? "Include" : "Exclude"}
                    {filterCount > 0 && (
                      <span
                        className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full ${
                          tab === "include"
                            ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                            : "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                        }`}
                      >
                        {filterCount}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="px-5 py-4 space-y-3">
              {activeTab === "include" && (
                <p className="text-xs text-muted-foreground">
                  Contacts matching these filters will be added to the segment.
                </p>
              )}
              {activeTab === "exclude" && (
                <p className="text-xs text-muted-foreground">
                  Contacts matching these filters will be removed from the segment.
                </p>
              )}

              {/* Filter groups */}
              {activeGroups.groups.map((group, groupIdx) => (
                <FilterGroupCard
                  key={group.id}
                  group={group}
                  groupIdx={groupIdx}
                  isOnly={activeGroups.groups.length === 1}
                  isLast={groupIdx === activeGroups.groups.length - 1}
                  onAddFilter={activeGroups.addFilter}
                  onRemoveFilter={activeGroups.removeFilter}
                  onUpdateFilter={activeGroups.updateFilter}
                  onToggleFilterLogic={activeGroups.toggleFilterLogic}
                  onDuplicateGroup={activeGroups.duplicateGroup}
                  onRemoveGroup={activeGroups.removeGroup}
                  onToggleGroupConnector={activeGroups.toggleGroupConnector}
                />
              ))}

              <button
                onClick={activeGroups.addGroup}
                className="flex items-center gap-1.5 text-sm border border-dashed border-border rounded-md px-3 py-1.5 hover:bg-muted transition-colors text-muted-foreground"
              >
                <Plus className="w-3.5 h-3.5" />
                Add filter group
              </button>

              {/* Pinned contacts section */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground whitespace-nowrap">
                  {activeTab === "include" ? "Always include" : "Always exclude"}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <SpecificContactPicker
                contacts={contacts}
                pinned={specificContacts}
                filterMode={activeTab}
                onAdd={handleAddPinned}
                onToggleMode={handleTogglePinnedMode}
                onRemove={handleRemovePinned}
              />
            </div>
          </div>

          {/* Embedded save button */}
          {embeddedMode && (
            <div className="px-6 pt-2 pb-5">
              <button
                onClick={handleEmbeddedSave}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all text-sm"
              >
                <Save className="w-4 h-4" />
                Save changes
              </button>
            </div>
          )}
        </div>

        {/* Right: preview panel */}
        <SegmentPreviewPanel
          matchingContacts={matchingContacts}
          totalContacts={contacts.length}
          hasNoFilters={hasNoFilters}
          pinnedIncludeIds={pinnedIncludeIds}
        />
      </div>

      {!embeddedMode && (
        <SaveSegmentModal
          isOpen={showSaveModal}
          onSave={handleSave}
          onClose={() => setShowSaveModal(false)}
          initialName={initialName}
          initialDescription={initialDescription}
        />
      )}
    </div>
  );
}
