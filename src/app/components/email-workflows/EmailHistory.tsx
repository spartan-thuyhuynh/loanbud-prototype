import { Mail, CheckCircle2, Eye, Send, Clock } from 'lucide-react';
import { useAppData } from '@/app/contexts/AppDataContext';

const statusConfig = {
  Sent: {
    icon: Send,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  Delivered: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  Opened: {
    icon: Eye,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
};

export function EmailHistory() {
  const { emailHistory: history } = useAppData();
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Simulate status progression for demo
  const getSimulatedStatus = (email: EmailRecord): EmailRecord['status'] => {
    const minutesSinceSent =
      (new Date().getTime() - email.sentAt.getTime()) / 1000 / 60;
    if (minutesSinceSent > 2) return 'Opened';
    if (minutesSinceSent > 1) return 'Delivered';
    return email.status;
  };

  // Group by campaign/sequence
  const groupedHistory = history.reduce((acc, email) => {
    const key = `${email.sequenceDay}-${email.subject}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(email);
    return acc;
  }, {} as Record<string, EmailRecord[]>);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              Email History & Audit Trail
            </h2>
            <p className="text-muted-foreground mt-1">
              Track email delivery and engagement
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Total Sent</div>
              <div
                className="text-3xl text-primary"
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
              >
                {history.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6">
        {history.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl mb-2" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                No Email History Yet
              </h3>
              <p className="text-muted-foreground">
                Send your first email campaign to see it here
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            {Object.entries(groupedHistory)
              .reverse()
              .map(([key, emails]) => {
                const firstEmail = emails[0];
                const sentCount = emails.filter(
                  (e) => getSimulatedStatus(e) === 'Sent'
                ).length;
                const deliveredCount = emails.filter(
                  (e) => getSimulatedStatus(e) === 'Delivered'
                ).length;
                const openedCount = emails.filter(
                  (e) => getSimulatedStatus(e) === 'Opened'
                ).length;

                return (
                  <div
                    key={key}
                    className="bg-card border border-border rounded-lg overflow-hidden"
                  >
                    {/* Campaign Header */}
                    <div className="bg-primary/5 border-b border-border px-6 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3
                              className="text-xl"
                              style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}
                            >
                              {firstEmail.subject}
                            </h3>
                            <span className="px-3 py-1 bg-accent/20 text-accent border border-accent/30 rounded-full text-xs">
                              Day {firstEmail.sequenceDay}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{formatDate(firstEmail.sentAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span>{firstEmail.senderIdentity}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div
                              className="text-2xl text-blue-600"
                              style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                            >
                              {sentCount}
                            </div>
                            <div className="text-xs text-muted-foreground">Sent</div>
                          </div>
                          <div className="text-center">
                            <div
                              className="text-2xl text-green-600"
                              style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                            >
                              {deliveredCount}
                            </div>
                            <div className="text-xs text-muted-foreground">Delivered</div>
                          </div>
                          <div className="text-center">
                            <div
                              className="text-2xl text-purple-600"
                              style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                            >
                              {openedCount}
                            </div>
                            <div className="text-xs text-muted-foreground">Opened</div>
                          </div>
                        </div>
                      </div>

                      {/* Engagement Bar */}
                      <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full flex">
                          <div
                            className="bg-purple-600"
                            style={{
                              width: `${(openedCount / emails.length) * 100}%`,
                            }}
                          />
                          <div
                            className="bg-green-600"
                            style={{
                              width: `${(deliveredCount / emails.length) * 100}%`,
                            }}
                          />
                          <div
                            className="bg-blue-600"
                            style={{
                              width: `${(sentCount / emails.length) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Individual Recipients */}
                    <div className="divide-y divide-border">
                      {emails.map((email) => {
                        const currentStatus = getSimulatedStatus(email);
                        const config = statusConfig[currentStatus];
                        const StatusIcon = config.icon;

                        return (
                          <div
                            key={email.id}
                            className="px-6 py-4 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div
                                  className={`p-2 rounded-lg ${config.bgColor} border ${config.borderColor}`}
                                >
                                  <StatusIcon className={`w-5 h-5 ${config.color}`} />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium">{email.contactName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {email.contactId}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <div
                                    className={`text-sm ${config.color}`}
                                    style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}
                                  >
                                    {currentStatus}
                                  </div>
                                  <div
                                    className="text-xs text-muted-foreground"
                                    style={{ fontFamily: 'var(--font-mono)' }}
                                  >
                                    {formatDate(email.sentAt)}
                                  </div>
                                </div>

                                {currentStatus === 'Opened' && (
                                  <div className="px-3 py-1 bg-purple-50 border border-purple-200 rounded-full">
                                    <span className="text-xs text-purple-700">
                                      Engaged
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

            {/* Phase 2 Placeholder */}
            <div className="bg-muted/30 border-2 border-dashed border-border rounded-lg p-8 text-center">
              <div className="text-muted-foreground">
                <h4 className="text-lg mb-2" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                  Coming in Phase 2
                </h4>
                <p className="text-sm mb-4">
                  Analytics Funnels • SMS Tracking • Response Management
                </p>
                <div className="inline-block px-4 py-2 bg-card border border-border rounded-lg text-xs">
                  Future Feature Placeholder
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
