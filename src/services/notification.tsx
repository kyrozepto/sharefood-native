import {
  NotificationItem,
  CreateNotificationPayload,
} from "../interfaces/notificationInterface";

const BASE_URL = "https://sharefood-api-b35u.onrender.com";

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

  try {
    const data = JSON.parse(text);

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
