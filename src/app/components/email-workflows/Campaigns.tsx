import { useState } from "react";
import {
  Plus,
  Send,
  Calendar,
  Clock,
  Users,
  Mail,
  CheckSquare,
  Eye,
} from "lucide-react";
import type { Campaign } from "./campaign/types";
import {
  CAMPAIGN_STATUS_COLORS,
  CAMPAIGN_STATUS_LABELS,
} from "./campaign/campaign-data";
import { CampaignDetail } from "./CampaignDetail";
import { Button } from "../ui/button";

interface CampaignsProps {
  campaigns: Campaign[];
  onCompose: () => void;
}

export function Campaigns({ campaigns, onCompose }: CampaignsProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );

  if (selectedCampaign) {
    return <CampaignDetail onBack={() => setSelectedCampaign(null)} />;
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-3xl mb-2"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Campaigns
            </h2>
            <p className="text-muted-foreground">
              One-off or scheduled email campaigns to user segments
            </p>
          </div>
          <Button onClick={onCompose}>
            <Plus className="w-4 h-4" />
            New Campaign
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          {/* Campaign Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Total Campaigns
                </span>
              </div>
              <div
                className="text-3xl"
                style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
              >
                {campaigns.length}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Send className="w-5 h-5 text-green-600" />
                <span className="text-sm text-muted-foreground">Sent</span>
              </div>
              <div
                className="text-3xl"
                style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
              >
                {campaigns.filter((c) => c.status === "sent").length}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-muted-foreground">Scheduled</span>
              </div>
              <div
                className="text-3xl"
                style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
              >
                {campaigns.filter((c) => c.status === "scheduled").length}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Eye className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-muted-foreground">
                  Avg Open Rate
                </span>
              </div>
              <div
                className="text-3xl"
                style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
              >
                {campaigns.filter((c) => c.openRate).length > 0
                  ? (
                      campaigns.reduce((sum, c) => sum + (c.openRate || 0), 0) /
                      campaigns.filter((c) => c.openRate).length
                    ).toFixed(1)
                  : "0"}
                %
              </div>
            </div>
          </div>

          {/* Campaigns List */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-6 py-4 border-b border-border">
              <h3
                className="text-lg"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                All Campaigns
              </h3>
            </div>

            {campaigns.length === 0 ? (
              <div className="p-12 text-center">
                <Mail className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3
                  className="text-xl mb-2"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                >
                  No Campaigns Yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Create your first campaign to send emails to user segments
                </p>
                <button
                  onClick={onCompose}
                  className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create First Campaign
                </button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="p-6 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => setSelectedCampaign(campaign)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3
                            className="text-lg"
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontWeight: 600,
                            }}
                          >
                            {campaign.name}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-white text-xs ${CAMPAIGN_STATUS_COLORS[campaign.status]}`}
                          >
                            {CAMPAIGN_STATUS_LABELS[campaign.status]}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{campaign.segmentName}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{campaign.templateName}</span>
                          </div>
                          <span>•</span>
                          <span style={{ fontFamily: "var(--font-mono)" }}>
                            {campaign.recipientCount} recipients
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        {campaign.status === "sent" && campaign.sentAt && (
                          <div className="text-sm text-muted-foreground">
                            Sent {campaign.sentAt.toLocaleDateString()}
                          </div>
                        )}
                        {campaign.status === "scheduled" &&
                          campaign.scheduledFor && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <Clock className="w-4 h-4" />
                              <span>
                                {campaign.scheduledFor.toLocaleDateString()}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>

                    {campaign.status === "sent" && (
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-purple-600" />
                          <span className="text-sm">
                            {campaign.openRate}% open rate
                          </span>
                        </div>
                        {campaign.followUpTasks.length > 0 && (
                          <div className="flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-green-600" />
                            <span className="text-sm">
                              {campaign.followUpTasks.length} follow-up tasks
                              created
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {campaign.followUpTasks.length > 0 &&
                      campaign.status !== "sent" && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {campaign.followUpTasks.map((task, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                            >
                              Day {task.daysAfter}: {task.taskType}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
