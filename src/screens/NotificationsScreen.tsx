"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import type { RootNavigationProp } from "../navigation/types"
import { globalStyles, theme } from "../utils/theme"

// Mock data - replace with actual data from your backend
const mockNotifications = [
  {
    id: "1",
    type: "request",
    title: "New Request",
    message: "Alice Smith requested 2kg of your  donation",
    time: "5 min ago",
    read: false,
    data: {
      donationId: "1",
      requestId: "1",
    },
  },
  {
    id: "2",
    type: "pickup",
    title: "Pickup \nScheduled",
    message: "Bob Johnson will pick up your Bread donation at 2:00 PM today",
    time: "1 hour ago",
    read: true,
    data: {
      donationId: "2",
      pickupId: "1",
    },
  },
  {
    id: "3",
    type: "rating",
    title: "New Rating",
    message: "You received a 5-star rating from Alice Smith",
    time: "2 hours ago",
    read: true,
    data: {
      transactionId: "1",
    },
  },
]

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>()
  const [notifications, setNotifications] = useState(mockNotifications)

  const handleNotificationPress = (notification: typeof mockNotifications[0]) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    )

    // Navigate based on notification type
    switch (notification.type) {
      case "request":
        if (notification.data.donationId) {
          navigation.navigate("DonationRequests", { donationId: notification.data.donationId })
        }
        break
      case "pickup":
        if (notification.data.donationId) {
          navigation.navigate("PickupDetail", { donationId: notification.data.donationId })
        }
        break
      case "rating":
        // Maybe show a modal or navigate to profile
        break
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "request":
        return "hand-left"
      case "pickup":
        return "time"
      case "rating":
        return "star"
      default:
        return "notifications"
    }
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={globalStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.read && styles.unreadCard,
              ]}
              onPress={() => handleNotificationPress(notification)}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={getNotificationIcon(notification.type)}
                  size={24}
                  color={theme.colors.accent}
                />
              </View>
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
              </View>
              {!notification.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

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
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xl,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: "center",
  },
  unreadCard: {
    backgroundColor: theme.colors.accent + "10",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  notificationTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.md,
  },
  notificationTime: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.sm,
    textAlign: "right",
  },
  notificationMessage: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
    marginLeft: theme.spacing.md,
  },
})

export default NotificationsScreen 