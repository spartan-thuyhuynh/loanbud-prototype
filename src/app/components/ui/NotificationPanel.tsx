import { Bell, X, Check } from "lucide-react";
import { Badge } from "./badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import type { Notification } from "../../types";

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

const TYPE_DOT_CLASS: Record<Notification["type"], string> = {
  task_due: "bg-amber-400",
  task_overdue: "bg-red-500",
  workflow_update: "bg-blue-500",
  application_update: "bg-emerald-500",
};

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
}

export function NotificationPanel({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
}: NotificationPanelProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasUnread = unreadCount > 0;

  return (
    <DropdownMenu>
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

      <DropdownMenuContent align="end" sideOffset={8} className="w-96 p-0 overflow-hidden">
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
          {hasUnread && (
            <button
              onClick={(e) => { e.stopPropagation(); onMarkAllRead(); }}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Check className="w-3 h-3" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Notification list */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
              <Bell className="w-8 h-8 opacity-30" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <ul>
              {notifications.map((notif) => (
                <li
                  key={notif.id}
                  className={`group relative flex gap-3 px-4 py-3 border-b border-gray-50 transition-colors cursor-default ${notif.read ? "bg-white" : "bg-blue-50/40"}`}
                  onClick={(e) => { e.stopPropagation(); if (!notif.read) onMarkRead(notif.id); }}
                >
                  <div className="mt-1.5 shrink-0">
                    <span className={`block w-2 h-2 rounded-full ${TYPE_DOT_CLASS[notif.type]}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${notif.read ? "text-gray-600 font-normal" : "text-gray-900 font-medium"}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{formatRelativeTime(notif.createdAt)}</p>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); onDismiss(notif.id); }}
                    title="Dismiss"
                    className="shrink-0 self-start mt-0.5 p-0.5 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
