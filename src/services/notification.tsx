import {
  NotificationItem,
  CreateNotificationPayload,
} from "../interfaces/notificationInterface";

const BASE_URL = "http://10.0.2.2:5000";

// Get all notifications (admin or test)
export const getAllNotifications = async (
  token: string
): Promise<NotificationItem[]> => {
  const response = await fetch(`${BASE_URL}/api/notification`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch notifications");
  }

  return response.json();
};

// Get notifications by user ID
export const getNotificationsByUserId = async (
  userId: number | string,
  token: string
): Promise<NotificationItem[]> => {
  const response = await fetch(`${BASE_URL}/api/notification/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch user notifications");
  }

  return response.json();
};

// Mark notification as read/unread
export const updateNotificationIsRead = async (
  notificationId: number,
  isRead: boolean,
  token: string
): Promise<NotificationItem> => {
  const response = await fetch(
    `${BASE_URL}/api/notification/${notificationId}/read`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_read: isRead }),
    }
  );

  const contentType = response.headers.get("Content-Type");
  const text = await response.text();

  console.log("✅ Raw text response:", text); // Add this line

  try {
    const data = JSON.parse(text);
    console.log("✅ Parsed JSON response:", data); // Add this line

    if (!response.ok) {
      throw new Error(data.message || "Failed to update read status");
    }
    return data.notification ?? data;
  } catch (error) {
    console.error("❌ JSON parsing failed:", error);
    console.error("❌ Raw body was:", text);
    throw new Error("Invalid JSON response");
  }
};

// Create a manual notification (optional usage)
export const createNotification = async (
  data: CreateNotificationPayload,
  token: string
): Promise<NotificationItem> => {
  const response = await fetch(`${BASE_URL}/api/notification`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create notification");
  }

  return response.json();
};

// Soft delete a notification
export const deleteNotification = async (
  notificationIds: number[],
  token: string
): Promise<void> => {
  await Promise.all(
    notificationIds.map(async (id) => {
      const response = await fetch(`${BASE_URL}/api/notification/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || `Failed to delete notification ID ${id}`
        );
      }
    })
  );
};
