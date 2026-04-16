import {
  ArrowLeft,
  Mail,
  Users,
  Eye,
  MousePointerClick,
  AlertCircle,
  Clock,
  UserMinus,
} from "lucide-react";
import type { CampaignMetrics } from "../types";

interface CampaignMetricsHeaderProps {
  campaign: CampaignMetrics;
  driftedCount: number;
  onBack: () => void;
}

export function CampaignMetricsHeader({
  campaign,
  driftedCount,
  onBack,
}: CampaignMetricsHeaderProps) {
  return (
    <div className="border-b border-border bg-card px-8 py-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Campaigns
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-3xl mb-2"
            style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
          >
            {campaign.name}
          </h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Segment: {campaign.segmentName}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                Sent: {campaign.sentAt.toLocaleDateString()} at{" "}
                {campaign.sentAt.toLocaleTimeString()}
              </span>
            </div>
            <span>•</span>
            <span>{campaign.recipientCount} recipients</span>
          </div>
        </div>
      </div>

      {/* Campaign Metrics */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Delivered</span>
          </div>
          <div
            className="text-2xl"
            style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
          >
            {campaign.deliveryRate}%
          </div>
        </div>

        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-muted-foreground">Opened</span>
          </div>
          <div
            className="text-2xl text-blue-600"
            style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
          >
            {campaign.openRate}%
          </div>
        </div>

        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MousePointerClick className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-muted-foreground">Clicked</span>
          </div>
          <div
            className="text-2xl text-purple-600"
            style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
          >
            {campaign.clickRate}%
          </div>
        </div>

        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-muted-foreground">No Response</span>
          </div>
          <div
            className="text-2xl text-gray-600"
            style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
          >
            {campaign.noResponseCount}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <UserMinus className="w-4 h-4 text-amber-700" />
            <span className="text-sm text-amber-700">Segment Drift</span>
          </div>
          <div
            className="text-2xl text-amber-900"
            style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
          >
            {driftedCount}
          </div>
        </div>
      </div>
    </div>
  );
}
