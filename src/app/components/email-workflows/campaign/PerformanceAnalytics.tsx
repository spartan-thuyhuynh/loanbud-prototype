import { TrendingUp, Mail, Eye, MousePointerClick, BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { EmailRecord } from "@/app/types";

interface PerformanceAnalyticsProps {
  emailHistory: EmailRecord[];
}

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
}

function MetricCard({ icon: Icon, label, value, subtitle, color }: MetricCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-sm text-muted-foreground mb-1">{label}</div>
          <div
            className="text-3xl"
            style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
          >
            {value}
          </div>
          {subtitle && (
            <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PerformanceAnalytics({ emailHistory }: PerformanceAnalyticsProps) {
  const totalSent = emailHistory.length;
  const totalDelivered = emailHistory.filter((e) =>
    ["Delivered", "Opened"].includes(e.status)
  ).length;
  const totalOpened = emailHistory.filter((e) => e.status === "Opened").length;

  const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
  const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;

  const bySender = emailHistory.reduce(
    (acc, email) => {
      if (!acc[email.senderIdentity]) {
        acc[email.senderIdentity] = { sent: 0, delivered: 0, opened: 0 };
      }
      acc[email.senderIdentity].sent++;
      if (["Delivered", "Opened"].includes(email.status)) acc[email.senderIdentity].delivered++;
      if (email.status === "Opened") acc[email.senderIdentity].opened++;
      return acc;
    },
    {} as Record<string, { sent: number; delivered: number; opened: number }>,
  );

  const byCampaign = emailHistory.reduce(
    (acc, email) => {
      if (!acc[email.subject]) {
        acc[email.subject] = { sent: 0, delivered: 0, opened: 0 };
      }
      acc[email.subject].sent++;
      if (["Delivered", "Opened"].includes(email.status)) acc[email.subject].delivered++;
      if (email.status === "Opened") acc[email.subject].opened++;
      return acc;
    },
    {} as Record<string, { sent: number; delivered: number; opened: number }>,
  );

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Overview Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <MetricCard icon={Mail} label="Total Sent" value={totalSent} color="bg-blue-600" />
          <MetricCard
            icon={TrendingUp}
            label="Delivery Rate"
            value={`${deliveryRate.toFixed(1)}%`}
            subtitle={`${totalDelivered} delivered`}
            color="bg-green-600"
          />
          <MetricCard
            icon={Eye}
            label="Open Rate"
            value={`${openRate.toFixed(1)}%`}
            subtitle={`${totalOpened} opened`}
            color="bg-purple-600"
          />
          <MetricCard
            icon={MousePointerClick}
            label="Click Rate"
            value="Coming Soon"
            subtitle="Phase 2"
            color="bg-amber-600"
          />
        </div>

        {totalSent === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3
              className="text-xl mb-2"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              No Campaign Data Yet
            </h3>
            <p className="text-muted-foreground">
              Send your first campaign to see performance analytics
            </p>
          </div>
        ) : (
          <>
            {/* Performance by Sender Identity */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-6 py-4 border-b border-border">
                <h3
                  className="text-lg"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                >
                  Performance by Sender Identity
                </h3>
              </div>
              <div className="p-6">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="pb-3 text-left text-sm text-muted-foreground">Sender</th>
                      <th className="pb-3 text-right text-sm text-muted-foreground">Sent</th>
                      <th className="pb-3 text-right text-sm text-muted-foreground">Delivered</th>
                      <th className="pb-3 text-right text-sm text-muted-foreground">Opened</th>
                      <th className="pb-3 text-right text-sm text-muted-foreground">Open Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {Object.entries(bySender).map(([sender, stats]) => {
                      const senderOpenRate =
                        stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0;
                      return (
                        <tr key={sender} className="hover:bg-muted/20">
                          <td className="py-4 font-medium">{sender}</td>
                          <td className="py-4 text-right" style={{ fontFamily: "var(--font-mono)" }}>{stats.sent}</td>
                          <td className="py-4 text-right" style={{ fontFamily: "var(--font-mono)" }}>{stats.delivered}</td>
                          <td className="py-4 text-right" style={{ fontFamily: "var(--font-mono)" }}>{stats.opened}</td>
                          <td className="py-4 text-right">
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                              {senderOpenRate.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance by Campaign */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-6 py-4 border-b border-border">
                <h3
                  className="text-lg"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                >
                  Performance by Campaign
                </h3>
              </div>
              <div className="p-6">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="pb-3 text-left text-sm text-muted-foreground">Campaign Subject</th>
                      <th className="pb-3 text-right text-sm text-muted-foreground">Sent</th>
                      <th className="pb-3 text-right text-sm text-muted-foreground">Delivered</th>
                      <th className="pb-3 text-right text-sm text-muted-foreground">Opened</th>
                      <th className="pb-3 text-right text-sm text-muted-foreground">Open Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {Object.entries(byCampaign).map(([subject, stats]) => {
                      const campaignOpenRate =
                        stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0;
                      return (
                        <tr key={subject} className="hover:bg-muted/20">
                          <td className="py-4 font-medium max-w-md truncate">{subject}</td>
                          <td className="py-4 text-right" style={{ fontFamily: "var(--font-mono)" }}>{stats.sent}</td>
                          <td className="py-4 text-right" style={{ fontFamily: "var(--font-mono)" }}>{stats.delivered}</td>
                          <td className="py-4 text-right" style={{ fontFamily: "var(--font-mono)" }}>{stats.opened}</td>
                          <td className="py-4 text-right">
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                              {campaignOpenRate.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Phase 2 Features */}
            <div className="bg-muted/30 border-2 border-dashed border-border rounded-lg p-8">
              <h3
                className="text-lg mb-4"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                Coming in Phase 2
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-card border border-border rounded-lg text-center">
                  <div className="text-sm text-muted-foreground mb-1">Click Tracking</div>
                  <div className="text-xs text-muted-foreground">Track link clicks in emails</div>
                </div>
                <div className="p-4 bg-card border border-border rounded-lg text-center">
                  <div className="text-sm text-muted-foreground mb-1">Conversion Funnels</div>
                  <div className="text-xs text-muted-foreground">Email → Call → Close</div>
                </div>
                <div className="p-4 bg-card border border-border rounded-lg text-center">
                  <div className="text-sm text-muted-foreground mb-1">A/B Testing</div>
                  <div className="text-xs text-muted-foreground">Test subject lines & content</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
