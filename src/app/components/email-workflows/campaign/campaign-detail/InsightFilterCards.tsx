import { UserMinus, AlertCircle, Eye } from "lucide-react";

interface InsightFilterCardsProps {
  driftedCount: number;
  noResponseCount: number;
  engagedNoActionCount: number;
  onFilterDrifted: () => void;
  onFilterNoResponse: () => void;
  onFilterEngaged: () => void;
}

export function InsightFilterCards({
  driftedCount,
  noResponseCount,
  engagedNoActionCount,
  onFilterDrifted,
  onFilterNoResponse,
  onFilterEngaged,
}: InsightFilterCardsProps) {
  return (
    <div className="border-b border-border bg-card px-8 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
        >
          Review & Take Action
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={onFilterDrifted}
          className="p-4 border-2 border-amber-200 bg-amber-50 rounded-lg hover:bg-amber-100 transition-all text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <UserMinus className="w-5 h-5 text-amber-700" />
            <span
              className="text-sm text-amber-700"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              No Longer in Segment
            </span>
          </div>
          <div className="text-xs text-amber-700">
            {driftedCount} contacts • Status changed or conditions not met
          </div>
        </button>

        <button
          onClick={onFilterNoResponse}
          className="p-4 border-2 border-gray-200 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-gray-700" />
            <span
              className="text-sm text-gray-700"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              No Response
            </span>
          </div>
          <div className="text-xs text-gray-700">
            {noResponseCount} contacts • Need follow-up
          </div>
        </button>

        <button
          onClick={onFilterEngaged}
          className="p-4 border-2 border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-blue-700" />
            <span
              className="text-sm text-blue-700"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Engaged, No Action
            </span>
          </div>
          <div className="text-xs text-blue-700">
            {engagedNoActionCount} contacts • Opened but still in segment
          </div>
        </button>
      </div>
    </div>
  );
}
