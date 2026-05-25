import { useState } from "react";
import {
  Bell, Check, Settings, ArrowLeft, MoreHorizontal,
  Clock, AlertCircle, GitBranch, FileText,
  CheckCircle2, PauseCircle, Zap, Users,
  MailOpen, Circle,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "./badge";
import { Checkbox } from "./checkbox";
import { Switch } from "./switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import type { Notification, NotificationPreferences } from "../../types";

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

const TYPE_CONFIG: Record<
  Notification["type"],
  { icon: React.ElementType; colorClass: string; label: string }
> = {
  task_due:                   { icon: Clock,        colorClass: "text-amber-500",   label: "Task Due" },
  task_overdue:               { icon: AlertCircle,  colorClass: "text-red-500",     label: "Task Overdue" },
  workflow_update:            { icon: GitBranch,    colorClass: "text-blue-500",    label: "Workflow Update" },
  application_update:         { icon: FileText,     colorClass: "text-emerald-500", label: "Application Update" },
  enrollment_completed:       { icon: CheckCircle2, colorClass: "text-green-600",   label: "Enrollment Completed" },
  enrollment_paused:          { icon: PauseCircle,  colorClass: "text-orange-500",  label: "Enrollment Paused" },
  step_bounced:               { icon: Zap,          colorClass: "text-yellow-600",  label: "Step Bounced" },
  workflow_completed_all:     { icon: CheckCircle2, colorClass: "text-indigo-500",  label: "Workflow Finished" },
  inbound_reply:              { icon: MailOpen,     colorClass: "text-sky-500",     label: "Inbound Reply" },
  segment_membership_changed: { icon: Users,        colorClass: "text-violet-500",  label: "Segment Changed" },
};

type Category = "all" | "tasks" | "workflows" | "messages" | "system";

const CATEGORIES: { id: Category; label: string; types?: Notification["type"][] }[] = [
  { id: "all",       label: "All" },
  { id: "tasks",     label: "Tasks",     types: ["task_due", "task_overdue"] },
  { id: "workflows", label: "Workflows", types: ["workflow_update", "workflow_completed_all", "enrollment_completed", "enrollment_paused", "step_bounced"] },
  { id: "messages",  label: "Inbox",     types: ["inbound_reply"] },
  { id: "system",    label: "System",    types: ["application_update", "segment_membership_changed"] },
];

const PREF_ORDER: Notification["type"][] = [
  "task_due",
  "task_overdue",
  "inbound_reply",
  "enrollment_completed",
  "enrollment_paused",
  "workflow_update",
  "workflow_completed_all",
  "step_bounced",
  "application_update",
  "segment_membership_changed",
];

function getDeepLinks(notif: Notification): { label: string; path: string; state?: Record<string, string> }[] {
  const links: { label: string; path: string; state?: Record<string, string> }[] = [];
  if (notif.contactId) links.push({ label: "View Contact", path: `/crm/contacts/${notif.contactId}` });
  if (notif.workflowId) links.push({ label: "Open Workflow", path: `/crm/workflows/${notif.workflowId}/board` });
  if (notif.taskId || notif.type === "task_due" || notif.type === "task_overdue") {
    links.push({
      label: "View Task",
      path: `/crm/tasks`,
      ...(notif.taskId ? { state: { openTaskId: notif.taskId } } : {}),
    });
  }
  return links;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkUnread: (id: string) => void;
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
  notificationPrefs: NotificationPreferences;
  onUpdatePrefs: (updates: Partial<NotificationPreferences>) => void;
}

export function NotificationPanel({
  notifications,
  onMarkRead,
  onMarkUnread,
  onMarkAllRead,
  onDismiss: _onDismiss,
  notificationPrefs,
  onUpdatePrefs,
}: NotificationPanelProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Category>("all");
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [showKebab, setShowKebab] = useState(false);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) { setShowPrefs(false); setShowKebab(false); }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasUnread = unreadCount > 0;

  const categoryTypes = CATEGORIES.find((c) => c.id === category)?.types;
  const displayed = notifications
    .filter((n) => !onlyUnread || !n.read)
    .filter((n) => !categoryTypes || categoryTypes.includes(n.type));

  // Unread count per category tab
  const unreadInCategory = (cat: (typeof CATEGORIES)[number]) => {
    const types = cat.types;
    return notifications.filter(
      (n) => !n.read && (!types || types.includes(n.type)),
    ).length;
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          title="Notifications"
          className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
        >
          <Bell className="w-4.5 h-4.5" />
          {hasUnread && (
            <Badge
              variant="destructive"
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] leading-none flex items-center justify-center rounded-full border-2 border-white"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-[480px] p-0 overflow-hidden">
        {showPrefs ? (
          // ── Preferences view ──────────────────────────────────────────────────
          <div>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <button
                onClick={() => setShowPrefs(false)}
                className="p-0.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-gray-900">Notification Preferences</span>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
              {PREF_ORDER.map((type) => {
                const cfg = TYPE_CONFIG[type];
                const Icon = cfg.icon;
                return (
                  <div key={type} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 shrink-0 ${cfg.colorClass}`} />
                      <span className="text-sm text-gray-700">{cfg.label}</span>
                    </div>
                    <Switch
                      checked={notificationPrefs[type]}
                      onCheckedChange={(checked) => onUpdatePrefs({ [type]: checked })}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // ── Notifications view ────────────────────────────────────────────────
          <div>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">Notifications</span>
                {hasUnread && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <label
                  className="flex items-center gap-1.5 cursor-pointer mr-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={onlyUnread}
                    onCheckedChange={(v) => setOnlyUnread(v === true)}
                    className="w-3.5 h-3.5"
                  />
                  <span className="text-xs text-gray-500 whitespace-nowrap">Only unread</span>
                </label>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowPrefs(true); }}
                  title="Notification preferences"
                  className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
                {/* Kebab menu */}
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowKebab((v) => !v); }}
                    title="More options"
                    className={`p-1 rounded transition-colors ${showKebab ? "bg-gray-100 text-gray-700" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                  {showKebab && (
                    <div
                      className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        disabled={!hasUnread}
                        onClick={(e) => { e.stopPropagation(); onMarkAllRead(); setShowKebab(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <Check className="w-4 h-4 text-gray-400" />
                        Mark all as read
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex border-b border-gray-100 px-4">
              <div className="flex overflow-x-auto scrollbar-none">
                {CATEGORIES.map((cat) => {
                  const count = unreadInCategory(cat);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`shrink-0 py-2 pr-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                        category === cat.id
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {cat.label}
                      {count > 0 && (
                        <span className={`ml-1.5 inline-flex items-center justify-center rounded-full text-[10px] font-semibold min-w-[16px] h-4 px-1 ${
                          category === cat.id ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-[360px] overflow-y-auto">
              {displayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                  <Bell className="w-8 h-8 opacity-30" />
                  <p className="text-sm">
                    {onlyUnread ? "No unread notifications" : "No notifications"}
                  </p>
                </div>
              ) : (
                <ul>
                  {displayed.map((notif) => {
                    const cfg = TYPE_CONFIG[notif.type];
                    const Icon = cfg.icon;
                    const links = getDeepLinks(notif);
                    return (
                      <li
                        key={notif.id}
                        className={`group relative flex gap-3 px-4 py-3 border-b border-gray-50 transition-colors cursor-default ${notif.read ? "bg-white" : "bg-blue-50/40"}`}
                      >
                        <div className="mt-1 shrink-0">
                          <Icon className={`w-4 h-4 ${cfg.colorClass}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className={`text-xs leading-snug text-gray-900 ${notif.read ? "font-normal" : "font-medium"}`}>
                              {notif.title}
                            </p>
                            <span className="text-[10px] text-gray-400 shrink-0">{formatRelativeTime(notif.createdAt)}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>

                          {links.length > 0 && (
                            <div className="flex gap-3 mt-1.5 flex-wrap">
                              {links.map((link) => (
                                <button
                                  key={link.label}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onMarkRead(notif.id);
                                    navigate(link.path, link.state ? { state: link.state } : undefined);
                                    setOpen(false);
                                  }}
                                  className="text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                >
                                  {link.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (notif.read) { onMarkUnread(notif.id); } else { onMarkRead(notif.id); }
                          }}
                          title={notif.read ? "Mark as unread" : "Mark as read"}
                          className="group/btn shrink-0 self-start mt-1.5 p-0.5 rounded hover:bg-gray-100 transition-colors"
                        >
                          {notif.read ? (
                            /* Read: invisible until hovered */
                            <Circle className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            /* Unread: solid blue dot, swaps to checkmark on hover */
                            <span className="relative flex items-center justify-center w-3 h-3">
                              <span className="absolute inset-0 rounded-full bg-blue-500 group-hover/btn:opacity-0 transition-opacity" />
                              <CheckCircle2 className="w-3 h-3 text-blue-500 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
