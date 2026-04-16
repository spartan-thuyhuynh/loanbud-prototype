import { useState, useMemo } from "react";
import { Plus, Save } from "lucide-react";
import type { Contact } from "@/app/types";
import type { FilterGroup, FilterRule, SavedSegment } from "./types";
import { FilterGroupCard } from "./segment-builder/FilterGroupCard";
import { InlineToggle } from "./segment-builder/InlineToggle";
import { SegmentPreviewPanel } from "./segment-builder/SegmentPreviewPanel";
import { SaveSegmentModal } from "./segment-builder/SaveSegmentModal";

export type { SavedSegment };

interface SegmentBuilderProps {
  contacts: Contact[];
  savedSegments: SavedSegment[];
  onSaveSegment: (segment: SavedSegment) => void;
  onDeleteSegment: (id: string) => void;
  onBack?: () => void;
}

export function SegmentBuilder({
  contacts,
  onSaveSegment,
  onBack,
}: SegmentBuilderProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);
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

  const handleSave = (name: string, description: string) => {
    const newSegment: SavedSegment = {
      id: `segment-${Date.now()}`,
      name,
      description,
      filters: groups.flatMap((g) => g.filters),
      createdAt: new Date(),
    };
    onSaveSegment(newSegment);
    setGroups([{ id: "group-1", filters: [], connectorAfter: "or" }]);
    setShowSaveModal(false);
  };

  const hasNoFilters = groups.every((g) => g.filters.length === 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
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

        </div>

        {/* Right: preview panel */}
        <SegmentPreviewPanel
          matchingContacts={matchingContacts}
          totalContacts={contacts.length}
          hasNoFilters={hasNoFilters}
        />
      </div>

      <SaveSegmentModal
        isOpen={showSaveModal}
        onSave={handleSave}
        onClose={() => setShowSaveModal(false)}
      />
    </div>
  );
}
