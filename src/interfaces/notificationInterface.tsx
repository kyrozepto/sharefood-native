export interface NotificationItem {
  notification_id: number;
  user_id: number;
  type: "request" | "request_update" | "rating";
  title: string;
  message: string;
  data?: string;
  is_read: boolean;
  is_deleted: boolean;
  created_at: string;
}

export interface CreateNotificationPayload {
  user_id: number;
  type: "request" | "request_update" | "rating";
  title: string;
  message: string;
  data?: string;
}
