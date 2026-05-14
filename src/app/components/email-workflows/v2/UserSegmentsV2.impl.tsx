import { Plus, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "../../ui/button";
import { useNavigate } from "react-router";
import { useAppData } from "@/app/contexts/AppDataContext";

export function UserSegmentsV2() {
  const navigate = useNavigate();
  const { segments, contacts } = useAppData();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const filteredSegments = segments.filter((segment) =>
    segment.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSelectSegment = (id: string) => {
    setSelectedSegments((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedSegments.length === filteredSegments.length) {
      setSelectedSegments([]);
    } else {
      setSelectedSegments(filteredSegments.map((s) => s.id));
    }
  };

  // V2: Derive contact count for a segment
  function getSegmentCount(segmentId: string): number {
    const segment = segments.find((s) => s.id === segmentId);
    if (!segment) return 0;
    if (segment.segmentType === "static") {
      return segment.snapshotContactIds?.length ?? 0;
    }
    // For dynamic segments in demo, return total contacts (all match by default)
    return contacts.length;
  }

  // V2: Derive health for a segment
  function getSegmentHealth(segmentId: string): "green" | "yellow" {
    const count = getSegmentCount(segmentId);
    return count > 0 ? "green" : "yellow";
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            {/* V2: title with V2 badge */}
            <div className="flex items-center gap-2 mb-2">
              <h2
                className="text-3xl"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                User Segments
              </h2>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 border border-green-200 leading-none tracking-wide self-center">
                V2
              </span>
            </div>
            <p className="text-muted-foreground">
              Manage and organize your contact segments
            </p>
          </div>
        </div>

        {/* Search Bar and Create Button */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search segments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ height: "38px" }}
            />
          </div>
          <Button
            variant="default"
            className="px-3 py-1.5 text-sm"
            onClick={() => navigate("/email-workflows/user-segments/builder")}
          >
            <Plus className="w-4 h-4" />
            Create Segment
          </Button>
        </div>
      </div>

      {/* Segments Table */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-card border border-border rounded-lg w-fit min-w-full">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedSegments.length === filteredSegments.length &&
                        filteredSegments.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-border"
                    />
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm text-muted-foreground"
                    style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                  >
                    Segment Name
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm text-muted-foreground"
                    style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                  >
                    Status
                  </th>
                  {/* V2: Type column */}
                  <th
                    className="px-6 py-4 text-left text-sm text-muted-foreground"
                    style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                  >
                    Type
                  </th>
                  {/* V2: Health column */}
                  <th
                    className="px-6 py-4 text-left text-sm text-muted-foreground"
                    style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                  >
                    Health
                  </th>
                  {/* V2: Contacts count column */}
                  <th
                    className="px-6 py-4 text-left text-sm text-muted-foreground"
                    style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                  >
                    Contacts
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
                    Created By
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSegments.map((segment) => {
                  const health = getSegmentHealth(segment.id);
                  const count = getSegmentCount(segment.id);
                  const isStatic = segment.segmentType === "static";

                  return (
                    <tr
                      key={segment.id}
                      className={`hover:bg-muted/20 transition-colors ${
                        selectedSegments.includes(segment.id) ? "bg-muted/10" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedSegments.includes(segment.id)}
                          onChange={() => handleSelectSegment(segment.id)}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            navigate(`/email-workflows/user-segments/${segment.id}`)
                          }
                          className="flex items-center gap-2 hover:underline text-left"
                        >
                          <Users className="w-4 h-4 text-primary shrink-0" />
                          <span
                            className="font-medium max-w-[220px] truncate block"
                            title={segment.name}
                            style={{
                              display: "inline-block",
                              verticalAlign: "middle",
                            }}
                          >
                            {segment.name}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            segment.status === "Active"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {segment.status}
                        </span>
                      </td>
                      {/* V2: Type badge */}
                      <td className="px-6 py-4">
                        {isStatic ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            Snapshot
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                            Dynamic
                          </span>
                        )}
                      </td>
                      {/* V2: Health dot + label */}
                      <td className="px-6 py-4">
                        {health === "green" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block flex-shrink-0" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block flex-shrink-0" />
                            Empty
                          </span>
                        )}
                      </td>
                      {/* V2: Contact count */}
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{count}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.85rem",
                            }}
                          >
                            {formatDateTime(segment.lastUpdatedAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        <div className="flex flex-col">
                          <span>{segment.createdBy}</span>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.85rem",
                            }}
                          >
                            {formatDateTime(segment.createdAt)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredSegments.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No segments found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer with CTA */}
      {selectedSegments.length > 0 && (
        <div className="border-t border-border bg-card px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedSegments.length} segment
              {selectedSegments.length !== 1 ? "s" : ""} selected
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border-2 border-border text-foreground rounded-lg hover:bg-muted transition-all">
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
