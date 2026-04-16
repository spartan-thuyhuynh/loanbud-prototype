import { useState, useMemo } from "react";
import { Plus, Save } from "lucide-react";
import type { Contact } from "@/app/types";
import type { FilterGroup, FilterRule, SavedSegment } from "./types";
import { FilterGroupCard } from "./segment-builder/FilterGroupCard";
import { InlineToggle } from "./segment-builder/InlineToggle";
import { SegmentPreviewPanel } from "./segment-builder/SegmentPreviewPanel";

export type { SavedSegment };

interface SegmentBuilderProps {
  contacts: Contact[];
  savedSegments: SavedSegment[];
  onSaveSegment: (segment: SavedSegment) => void;
  onDeleteSegment: (id: string) => void;
}

export function SegmentBuilder({
  contacts,
  onSaveSegment,
}: SegmentBuilderProps) {
  const [segmentName, setSegmentName] = useState("");
  const [segmentDescription, setSegmentDescription] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [excludeContacts, setExcludeContacts] = useState(false);
  const [_testMatchesEnabled, _setTestMatchesEnabled] = useState(true);
  const [groups, setGroups] = useState<FilterGroup[]>([
    { id: "group-1", filters: [], connectorAfter: "or" },
  ]);

  const matchingContacts = useMemo(() => {
    const nonEmptyGroups = groups.filter((g) => g.filters.length > 0);
    if (nonEmptyGroups.length === 0) return contacts;

    const evalFilter = (f: FilterRule, contact: Contact) => {
      const val = (contact as unknown as Record<string, string>)[f.field];
      return f.operator === "=" ? val === f.value : val !== f.value;
    };

    const evalGroup = (group: FilterGroup, contact: Contact): boolean => {
      let result = evalFilter(group.filters[0], contact);
      for (let i = 1; i < group.filters.length; i++) {
        const next = evalFilter(group.filters[i], contact);
        result =
          group.filters[i - 1].logic === "and"
            ? result && next
            : result || next;
      }
      return result;
    };

    return contacts.filter((contact) => {
      let result = evalGroup(nonEmptyGroups[0], contact);
      for (let i = 1; i < nonEmptyGroups.length; i++) {
        const next = evalGroup(nonEmptyGroups[i], contact);
        result =
          nonEmptyGroups[i - 1].connectorAfter === "and"
            ? result && next
            : result || next;
      }
      return result;
    });
  }, [contacts, groups]);

  // Group helpers
  const addGroup = () => {
    setGroups((prev) => [
      ...prev,
      { id: `group-${Date.now()}`, filters: [], connectorAfter: "or" },
    ]);
  };

  const toggleGroupConnector = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, connectorAfter: g.connectorAfter === "and" ? "or" : "and" }
          : g,
      ),
    );
  };

  const toggleFilterLogic = (groupId: string, filterIdx: number) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              filters: g.filters.map((f, i) =>
                i === filterIdx
                  ? { ...f, logic: f.logic === "and" ? "or" : "and" }
                  : f,
              ),
            }
          : g,
      ),
    );
  };

  const removeGroup = (groupId: string) => {
    setGroups((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((g) => g.id !== groupId);
    });
  };

  const duplicateGroup = (groupId: string) => {
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
  };

  const addFilter = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              filters: [
                ...g.filters,
                {
                  field: "listingStatus",
                  operator: "=",
                  value: "New",
                  logic: "and",
                },
              ],
            }
          : g,
      ),
    );
  };

  const updateFilter = (
    groupId: string,
    index: number,
    updates: Partial<FilterRule>,
  ) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              filters: g.filters.map((f, i) =>
                i === index ? { ...f, ...updates } : f,
              ),
            }
          : g,
      ),
    );
  };

  const removeFilter = (groupId: string, index: number) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, filters: g.filters.filter((_, i) => i !== index) }
          : g,
      ),
    );
  };

  const handleSave = () => {
    if (!segmentName.trim()) return;
    const allFilters = groups.flatMap((g) => g.filters);
    const newSegment: SavedSegment = {
      id: `segment-${Date.now()}`,
      name: segmentName,
      description: segmentDescription,
      filters: allFilters,
      createdAt: new Date(),
    };
    onSaveSegment(newSegment);
    setSegmentName("");
    setSegmentDescription("");
    setGroups([{ id: "group-1", filters: [], connectorAfter: "or" }]);
    setShowSaveForm(false);
  };

  const hasNoFilters = groups.every((g) => g.filters.length === 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: builder */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-2">
          {groups.map((group, groupIdx) => (
            <FilterGroupCard
              key={group.id}
              group={group}
              groupIdx={groupIdx}
              isOnly={groups.length === 1}
              isLast={groupIdx === groups.length - 1}
              onAddFilter={addFilter}
              onRemoveFilter={removeFilter}
              onUpdateFilter={updateFilter}
              onToggleFilterLogic={toggleFilterLogic}
              onDuplicateGroup={duplicateGroup}
              onRemoveGroup={removeGroup}
              onToggleGroupConnector={toggleGroupConnector}
            />
          ))}

          {/* Add filter group button */}
          <button
            onClick={addGroup}
            className="flex items-center gap-1.5 text-sm border border-dashed border-border rounded-md px-3 py-1.5 hover:bg-muted transition-colors mt-1 text-muted-foreground"
          >
            <Plus className="w-3.5 h-3.5" />
            Add filter group
          </button>

          {/* Exclude contacts */}
          <div className="mt-4 border border-border rounded-lg px-5 py-4 flex items-center justify-between bg-card">
            <span className="font-medium text-sm">Exclude contacts</span>
            <InlineToggle
              checked={excludeContacts}
              onChange={setExcludeContacts}
            />
          </div>

          {/* Save segment */}
          <div className="mt-4 border-t border-border pt-4">
            {!showSaveForm ? (
              <button
                onClick={() => setShowSaveForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all text-sm"
              >
                <Save className="w-4 h-4" />
                Save segment
              </button>
            ) : (
              <div className="space-y-3 bg-muted/30 border border-border rounded-lg p-4">
                <div>
                  <label className="block text-sm mb-1.5 text-muted-foreground">
                    Segment Name
                  </label>
                  <input
                    type="text"
                    value={segmentName}
                    onChange={(e) => setSegmentName(e.target.value)}
                    placeholder="e.g., New Broker Listings"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1.5 text-muted-foreground">
                    Description (Optional)
                  </label>
                  <textarea
                    value={segmentDescription}
                    onChange={(e) => setSegmentDescription(e.target.value)}
                    placeholder="Describe this segment..."
                    rows={2}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={!segmentName.trim()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Segment
                  </button>
                  <button
                    onClick={() => setShowSaveForm(false)}
                    className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-all text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: preview panel */}
        <SegmentPreviewPanel
          matchingContacts={matchingContacts}
          totalContacts={contacts.length}
          hasNoFilters={hasNoFilters}
        />
      </div>
    </div>
  );
}
