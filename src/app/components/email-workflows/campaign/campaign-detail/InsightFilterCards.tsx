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
      <div className="flex gap-2">
        <button
          onClick={onFilterDrifted}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-200 bg-amber-50 rounded-full hover:bg-amber-100 transition-all"
        >
          <UserMinus className="w-3.5 h-3.5 text-amber-700" />
          <span className="text-xs text-amber-700 font-semibold">No Longer in Segment</span>
          <span className="text-xs text-amber-600 font-medium">{driftedCount}</span>
        </button>

        <button
          onClick={onFilterNoResponse}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-gray-50 rounded-full hover:bg-gray-100 transition-all"
        >
          <AlertCircle className="w-3.5 h-3.5 text-gray-700" />
          <span className="text-xs text-gray-700 font-semibold">No Response</span>
          <span className="text-xs text-gray-600 font-medium">{noResponseCount}</span>
        </button>

        <button
          onClick={onFilterEngaged}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-200 bg-blue-50 rounded-full hover:bg-blue-100 transition-all"
        >
          <Eye className="w-3.5 h-3.5 text-blue-700" />
          <span className="text-xs text-blue-700 font-semibold">Engaged, No Action</span>
          <span className="text-xs text-blue-600 font-medium">{engagedNoActionCount}</span>
        </button>
      </div>
    </div>
  );
}
