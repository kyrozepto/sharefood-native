"use client";

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { RootNavigationProp } from "../navigation/types";
import { globalStyles, theme } from "../utils/theme";
import { useAuth } from "../context/auth";
import {
  getNotificationsByUserId,
  updateNotificationIsRead,
  deleteNotification,
} from "../services/notification";
import type { NotificationItem } from "../interfaces/notificationInterface";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<
    Set<number>
  >(new Set());

  const fetchNotifications = useCallback(async () => {
    if (!user?.user_id || !token) return;
    try {
      const result = await getNotificationsByUserId(user.user_id, token);
      setNotifications(result);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [user, token]);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const handleNotificationPress = async (notification: NotificationItem) => {
    if (isSelectionMode) {
      toggleNotificationSelection(notification.notification_id);
      return;
    }

    try {
      if (!notification.is_read) {
        const updated = await updateNotificationIsRead(
          notification.notification_id,
          true,
          token || ""
        );

        setNotifications((prev) =>
          prev.map((n) =>
            n.notification_id === updated.notification_id ? updated : n
          )
        );
      }

      const parsedData =
        typeof notification.data === "string"
          ? JSON.parse(notification.data)
          : notification.data ?? {};

      switch (notification.type) {
        case "request":
          if (parsedData.donation_id) {
            navigation.navigate("DonationRequests", {
              donationId: parsedData.donation_id,
            });
          }
          break;
        case "rating":
          break;
      }
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  const toggleNotificationSelection = (notificationId: number) => {
    setSelectedNotifications((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedNotifications(new Set());
  };

  const selectAllNotifications = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(
        new Set(notifications.map((n) => n.notification_id))
      );
    }
  };

  const handleDeleteSelected = () => {
    if (selectedNotifications.size === 0) return;

    Alert.alert(
      "Delete Notifications",
      `Are you sure you want to delete ${selectedNotifications.size} notification(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteNotification(
                Array.from(selectedNotifications),
                token || ""
              );
              setNotifications((prev) =>
                prev.filter(
                  (n) => !selectedNotifications.has(n.notification_id)
                )
              );
              setSelectedNotifications(new Set());
              setIsSelectionMode(false);
            } catch (error) {
              console.error("Error deleting notifications:", error);
              Alert.alert("Error", "Failed to delete notifications.");
            }
          },
        },
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "request":
        return "hand-left";
      case "pickup":
        return "time";
      case "rating":
        return "star";
      default:
        return "notifications";
    }
  };

  const formatTime = (timestamp: string) => {
    return dayjs(timestamp).fromNow();
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={globalStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (isSelectionMode) {
                setIsSelectionMode(false);
                setSelectedNotifications(new Set());
              } else {
                navigation.goBack();
              }
            }}
          >
            <Ionicons
              name={isSelectionMode ? "close" : "arrow-back"}
              size={24}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.title}>
            {isSelectionMode
              ? `${selectedNotifications.size} Selected`
              : "Notifications"}
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={toggleSelectionMode}
          >
            <Ionicons
              name={isSelectionMode ? "checkmark" : "ellipsis-vertical"}
              size={24}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {isSelectionMode && (
          <View style={styles.selectionBar}>
            <TouchableOpacity
              style={styles.selectAllButton}
              onPress={selectAllNotifications}
            >
              <Text style={styles.selectAllText}>
                {selectedNotifications.size === notifications.length
                  ? "Deselect All"
                  : "Select All"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.deleteButton,
                selectedNotifications.size === 0 && styles.deleteButtonDisabled,
              ]}
              onPress={handleDeleteSelected}
              disabled={selectedNotifications.size === 0}
            >
              <Ionicons name="trash" size={18} color="#fff" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.content}>
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.notification_id}
              style={[
                styles.notificationCard,
                !notification.is_read && !isSelectionMode && styles.unreadCard,
                selectedNotifications.has(notification.notification_id) &&
                  styles.selectedCard,
              ]}
              onPress={() => handleNotificationPress(notification)}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <View style={styles.leftSection}>
                  {isSelectionMode ? (
                    <View style={styles.checkboxContainer}>
                      <Ionicons
                        name={
                          selectedNotifications.has(
                            notification.notification_id
                          )
                            ? "checkbox"
                            : "square-outline"
                        }
                        size={24}
                        color={
                          selectedNotifications.has(
                            notification.notification_id
                          )
                            ? theme.colors.accent
                            : theme.colors.textSecondary
                        }
                      />
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.iconContainer,
                        !notification.is_read && styles.unreadIconContainer,
                      ]}
                    >
                      <Ionicons
                        name={getNotificationIcon(notification.type)}
                        size={20}
                        color={
                          !notification.is_read
                            ? theme.colors.accent
                            : theme.colors.textSecondary
                        }
                      />
                    </View>
                  )}
                </View>

                <View style={styles.centerSection}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[
                        styles.notificationTitle,
                        !notification.is_read &&
                          !isSelectionMode &&
                          styles.unreadTitle,
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {notification.title}
                    </Text>
                  </View>

                  <Text
                    style={styles.notificationMessage}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {notification.message}
                  </Text>

                  <Text style={styles.notificationTime}>
                    {formatTime(notification.created_at)}
                  </Text>
                </View>

                <View style={styles.rightSection}>
                  {!notification.is_read && !isSelectionMode && (
                    <View style={styles.unreadIndicator} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xl,
  },
  selectionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 8,
    marginBottom: theme.spacing.md,
  },
  selectAllButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  selectAllText: {
    color: theme.colors.accent,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.sm,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc3545",
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: 6,
    gap: theme.spacing.xs,
  },
  deleteButtonDisabled: {
    backgroundColor: "#666",
    opacity: 0.5,
  },
  deleteButtonText: {
    color: "#fff",
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.sm,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
  },
  notificationCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: "#333333",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: "#1e2a1e",
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
    borderColor: theme.colors.accent + "40",
  },
  selectedCard: {
    backgroundColor: theme.colors.accent + "20",
    borderColor: theme.colors.accent,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: theme.spacing.md,
  },
  leftSection: {
    marginRight: theme.spacing.sm,
  },
  centerSection: {
    flex: 1,
    minHeight: 50,
  },
  rightSection: {
    justifyContent: "flex-start",
    alignItems: "center",
    marginLeft: theme.spacing.xs,
    paddingTop: 2,
  },
  checkboxContainer: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#404040",
  },
  unreadIconContainer: {
    backgroundColor: theme.colors.accent + "20",
    borderColor: theme.colors.accent + "50",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  notificationTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.heavy,
    fontSize: theme.font.size.md,
    lineHeight: theme.font.size.md * 1.3,
    flex: 1,
  },
  unreadTitle: {
    fontFamily: theme.font.family.bold,
    color: theme.colors.textPrimary,
  },
  notificationMessage: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.sm,
    lineHeight: theme.font.size.sm * 1.4,
    marginBottom: theme.spacing.xs,
  },
  notificationTime: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.xs,
    opacity: 0.7,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
  },
});

export default NotificationsScreen;
