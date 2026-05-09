import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

export type NotificationType =
  | "application_submitted"
  | "application_approved"
  | "application_rejected"
  | "listing_submitted"
  | "listing_approved"
  | "listing_rejected"
  | "new_booking"
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_completed"
  | "inspection_added"
  | "inspection_approved"
  | "review_received";

export interface NotificationData {
  application_id?: string;
  listing_id?: string;
  booking_id?: string;
  review_id?: string;
  actor_id?: string;
  actor_name?: string;
}

export type Notification = Tables<"notifications">;

export async function getAdminUserIds(supabase?: ReturnType<typeof createClient>) {
  const client = supabase || createClient();
  const { data } = await client
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  return data?.map((p) => p.id) || [];
}

export async function createNotificationFromClient(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
}) {
  const supabase = createClient();

  const { error } = await supabase.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    data: (params.data || {}) as any,
    is_read: false,
  });

  if (error) {
    console.error("Failed to create notification:", error);
  }
  return { error };
}

export async function notifyAdminsFromClient(params: {
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
}) {
  const supabase = createClient();
  const adminIds = await getAdminUserIds(supabase);

  if (adminIds.length === 0) return { error: null };

  const notifications = adminIds.map((adminId) => ({
    user_id: adminId,
    type: params.type,
    title: params.title,
    message: params.message,
    data: (params.data || {}) as any,
    is_read: false,
  }));

  const { error } = await supabase.from("notifications").insert(notifications);

  if (error) {
    console.error("Failed to notify admins:", error);
  }
  return { error };
}
