"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, X, Loader2, UserCheck, Ban, Building2, Calendar, ClipboardList, Star, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import type { Notification } from "@/lib/notifications";

interface NotificationBellProps {
  unreadCount: number;
  notifications: Notification[];
  loading: boolean;
  hasMore: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  loadMore: () => void;
}

const typeIcons: Record<string, typeof Bell> = {
  application_submitted: FileText,
  application_approved: UserCheck,
  application_rejected: Ban,
  listing_submitted: Building2,
  listing_approved: Building2,
  listing_rejected: Ban,
  new_booking: Calendar,
  booking_confirmed: Calendar,
  booking_cancelled: Ban,
  booking_completed: CheckCheck,
  inspection_added: ClipboardList,
  inspection_approved: ClipboardList,
  review_received: Star,
};

function getNotificationLink(n: { type: string; data: any }): string | null {
  if (n.type === "application_submitted") {
    return n.data?.application_id
      ? `/admin/applications/${n.data.application_id}`
      : null;
  }
  if (n.type === "application_approved" || n.type === "application_rejected") {
    return "/pending";
  }
  if (n.type === "listing_submitted") {
    return n.data?.listing_id
      ? `/admin/listings/${n.data.listing_id}`
      : null;
  }
  if (n.type === "listing_approved" || n.type === "listing_rejected") {
    return "/stasher/listings";
  }
  if (
    n.type === "new_booking" ||
    n.type === "booking_confirmed" ||
    n.type === "booking_cancelled"
  ) {
    return n.data?.booking_id
      ? `/stasher/bookings`
      : null;
  }
  if (n.type === "booking_completed") {
    return "/traveler/bookings";
  }
  if (n.type === "inspection_added") {
    return n.data?.booking_id
      ? `/traveler/bookings/${n.data.booking_id}/inspection`
      : null;
  }
  if (n.type === "inspection_approved") {
    return null;
  }
  if (n.type === "review_received") {
    return "/stasher";
  }
  return null;
}

export default function NotificationBell({
  unreadCount,
  notifications,
  loading,
  hasMore,
  markAsRead,
  markAllAsRead,
  loadMore,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-5 w-5 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-h-[70vh] flex flex-col bg-background border rounded-xl shadow-xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <>
                {notifications.map((n) => {
                  const Icon = typeIcons[n.type] || Bell;
                  const link = getNotificationLink(n as any);
                  const content = (
                    <div
                      className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50 cursor-pointer ${
                        !n.is_read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                      }`}
                      onClick={() => {
                        if (!n.is_read) markAsRead(n.id);
                        setOpen(false);
                      }}
                    >
                      <div
                        className={`mt-0.5 p-1.5 rounded-full shrink-0 ${
                          !n.is_read
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {n.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {n.message}
                        </p>
                        <p className="text-[11px] text-muted-foreground/60 mt-1">
                          {n.created_at
                            ? formatDistanceToNow(new Date(n.created_at), {
                                addSuffix: true,
                              })
                            : ""}
                        </p>
                      </div>
                      {!n.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(n.id);
                          }}
                          className="p-1 rounded-md hover:bg-muted transition-colors shrink-0"
                          aria-label="Mark as read"
                        >
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  );

                  if (link) {
                    return (
                      <Link key={n.id} href={link} className="block">
                        {content}
                      </Link>
                    );
                  }
                  return <div key={n.id}>{content}</div>;
                })}

                {hasMore && (
                  <button
                    onClick={loadMore}
                    className="w-full py-3 text-xs text-blue-600 hover:text-blue-700 hover:bg-muted/50 transition-colors border-t"
                  >
                    Load more
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
