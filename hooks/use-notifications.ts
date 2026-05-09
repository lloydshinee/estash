"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { Notification } from "@/lib/notifications";

const PAGE_SIZE = 20;

export function useNotifications(userId: string | undefined) {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(
    async (append = false) => {
      if (!userId) return;

      const from = append ? notifications.length : 0;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Failed to fetch notifications:", error);
        return;
      }

      if (append) {
        setNotifications((prev) => [...prev, ...(data || [])]);
      } else {
        setNotifications(data || []);
      }

      setHasMore((data?.length || 0) === PAGE_SIZE);
      setLoading(false);
    },
    [userId, notifications.length, supabase],
  );

  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;

    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    setUnreadCount(count || 0);
  }, [userId, supabase]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (!error) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    },
    [supabase],
  );

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true })),
      );
      setUnreadCount(0);
    }
  }, [userId, supabase]);

  const loadMore = useCallback(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchNotifications();
    fetchUnreadCount();

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Notification>) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          if (!newNotification.is_read) {
            setUnreadCount((prev) => prev + 1);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications, fetchUnreadCount, supabase]);

  return {
    notifications,
    unreadCount,
    loading,
    hasMore,
    markAsRead,
    markAllAsRead,
    loadMore,
    refetch: () => {
      setLoading(true);
      fetchNotifications();
      fetchUnreadCount();
    },
  };
}
