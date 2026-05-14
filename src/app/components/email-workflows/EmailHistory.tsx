import { Mail, CheckCircle2, Eye, Send, Clock, MessageSquare, XCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router';
import { useAppData } from '@/app/contexts/AppDataContext';
import type { EmailRecord } from '@/app/types';

const statusConfig: Record<
  EmailRecord['status'],
  { icon: React.ElementType; color: string; bgColor: string; borderColor: string; label: string }
> = {
  Sent: {
    icon: Send,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Sent',
  },
  Delivered: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Delivered',
  },
  Opened: {
    icon: Eye,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    label: 'Opened',
  },
  Failed: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Failed',
  },
  Bounced: {
    icon: XCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    label: 'Bounced',
  },
  Undelivered: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Undelivered',
  },
  Received: {
    icon: Mail,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    label: 'Received',
  },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function EmailHistory() {
  const { emailHistory: history } = useAppData();

  const totalSent = history.length;
  const totalDelivered = history.filter((e) => e.status === 'Delivered' || e.status === 'Opened').length;
  const totalOpened = history.filter((e) => e.status === 'Opened').length;

  const groupedHistory = history.reduce(
    (acc, email) => {
      const key = `${email.sequenceDay}-${email.subject}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(email);
      return acc;
    },
    {} as Record<string, EmailRecord[]>,
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Email History</h2>
            <p className="text-muted-foreground mt-1">Track email delivery and engagement</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-semibold font-mono text-blue-600">{totalSent}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Sent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold font-mono text-green-600">{totalDelivered}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold font-mono text-purple-600">{totalOpened}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Opened</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6">
        {history.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h3 className="text-xl font-semibold mb-2">No Email History Yet</h3>
              <p className="text-muted-foreground text-sm">No emails have been sent yet</p>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-4">
            {Object.entries(groupedHistory)
              .reverse()
              .map(([key, emails]) => {
                const firstEmail = emails[0];
                const sentCount = emails.filter((e) => e.status === 'Sent').length;
                const deliveredCount = emails.filter(
                  (e) => e.status === 'Delivered' || e.status === 'Opened',
                ).length;
                const openedCount = emails.filter((e) => e.status === 'Opened').length;
                const total = emails.length;

                const openedPct = total > 0 ? (openedCount / total) * 100 : 0;
                const deliveredPct = total > 0 ? ((deliveredCount - openedCount) / total) * 100 : 0;
                const sentPct = total > 0 ? (sentCount / total) * 100 : 0;

                return (
                  <div key={key} className="bg-card border border-border rounded-xl overflow-hidden">
                    {/* Group header */}
                    <div className="bg-primary/5 border-b border-border px-6 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <h3 className="text-base font-semibold truncate">{firstEmail.subject}</h3>
                            <span className="shrink-0 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-full uppercase tracking-wide">
                              Day {firstEmail.sequenceDay}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {formatDate(firstEmail.sentAt)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5" />
                              {firstEmail.senderIdentity}
                            </span>
                            <span>{total} recipient{total !== 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-5 shrink-0">
                          <div className="text-center">
                            <div className="text-xl font-semibold font-mono text-blue-600">{sentCount}</div>
                            <div className="text-[10px] text-muted-foreground">Sent</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-semibold font-mono text-green-600">{deliveredCount}</div>
                            <div className="text-[10px] text-muted-foreground">Delivered</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-semibold font-mono text-purple-600">{openedCount}</div>
                            <div className="text-[10px] text-muted-foreground">Opened</div>
                          </div>
                        </div>
                      </div>

                      {/* Engagement bar */}
                      <div className="mt-3">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden flex">
                          <div className="bg-purple-500 transition-all" style={{ width: `${openedPct}%` }} />
                          <div className="bg-green-500 transition-all" style={{ width: `${deliveredPct}%` }} />
                          <div className="bg-blue-400 transition-all" style={{ width: `${sentPct}%` }} />
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                            Opened
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                            Delivered
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                            Sent
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Recipient rows */}
                    <div className="divide-y divide-border">
                      {emails.map((email) => {
                        const config = statusConfig[email.status];
                        const StatusIcon = config.icon;
                        const isSms = email.channel === 'sms';

                        return (
                          <div
                            key={email.id}
                            className="px-6 py-3.5 flex items-center gap-4 hover:bg-muted/30 transition-colors"
                          >
                            <div className={`p-2 rounded-lg shrink-0 ${config.bgColor} border ${config.borderColor}`}>
                              <StatusIcon className={`w-4 h-4 ${config.color}`} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <Link
                                to={`/crm/contacts/${email.contactId}`}
                                className="text-sm font-medium text-primary hover:underline"
                              >
                                {email.contactName}
                              </Link>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {isSms && (
                                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                                  <MessageSquare className="w-3 h-3" />
                                  SMS
                                </span>
                              )}
                              {email.status === 'Opened' && (
                                <span className="text-[10px] px-2 py-0.5 bg-purple-50 border border-purple-200 text-purple-700 rounded-full">
                                  Engaged
                                </span>
                              )}
                              <div className="text-right min-w-[100px]">
                                <div className={`text-xs font-semibold ${config.color}`}>{config.label}</div>
                                <div className="text-[10px] text-muted-foreground font-mono">
                                  {formatDate(email.sentAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
