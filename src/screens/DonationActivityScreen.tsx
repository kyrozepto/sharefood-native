import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import type { RootNavigationProp } from "../navigation/types"
import { globalStyles, theme } from "../utils/theme"
import Button from "../components/Button"

// Mock data - replace with actual data from your backend
const mockRequests = [
  {
    id: "1",
    recipient: {
      name: "Alice Smith",
      rating: 4.5,
      totalRequests: 8,
      image: "https://picsum.photos/201",
    },
    donation: {
      title: "Fresh Vegetables",
      quantity: "2kg",
      image: "https://images.pexels.com/photos/3872406/pexels-photo-3872406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    status: "pending",
    message: "I can pick up within the next hour",
    timeRequested: "10 minutes ago",
  },
  {
    id: "2",
    recipient: {
      name: "Bob Johnson",
      rating: 4.8,
      totalRequests: 12,
      image: "https://picsum.photos/202",
    },
    donation: {
      title: "Rice and Curry",
      quantity: "3 serving",
      image: "https://images.pexels.com/photos/6544376/pexels-photo-6544376.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    status: "approved",
    message: "I'll be there in 30 minutes",
    timeRequested: "5 minutes ago",
  },
]

const mockPickups = [
  {
    id: "1",
    donation: {
      title: "Fresh Vegetables",
      quantity: "5kg",
      image: "https://images.pexels.com/photos/3872406/pexels-photo-3872406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    recipient: {
      name: "Alice Smith",
      phone: "+1 234 567 8900",
      image: "https://picsum.photos/201",
    },
    status: "scheduled",
    scheduledTime: "Today, 2:00 PM",
    location: "123 Main St, City",
  },
  {
    id: "2",
    donation: {
      title: "Rice and Curry",
      quantity: "3 serving",
      image: "https://images.pexels.com/photos/6544376/pexels-photo-6544376.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    recipient: {
      name: "Bob Johnson",
      phone: "+1 234 567 8901",
      image: "https://picsum.photos/202",
    },
    status: "scheduled",
    scheduledTime: "Today, 4:00 PM",
    location: "456 Oak St, City",
  },
]

const mockHistory = [
  {
    id: "1",
    donation: {
      title: "Fresh Vegetables",
      quantity: "5kg",
      image: "https://images.pexels.com/photos/3872406/pexels-photo-3872406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    recipient: {
      name: "Alice Smith",
      image: "https://picsum.photos/201",
    },
    status: "completed",
    completedAt: "Yesterday, 2:00 PM",
    rating: 5,
  },
  {
    id: "2",
    donation: {
      title: "Rice and Curry",
      quantity: "3 serving",
      image: "https://images.pexels.com/photos/6544376/pexels-photo-6544376.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    recipient: {
      name: "Bob Johnson",
      image: "https://picsum.photos/202",
    },
    status: "cancelled",
    cancelledAt: "Yesterday, 4:00 PM",
  },
]

type TabType = "requests" | "pickups" | "history"

const DonationActivityScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>()
  const [activeTab, setActiveTab] = useState<TabType>("requests")
  const [isLoading, setIsLoading] = useState(false)

  const handleRequest = async (requestId: string, action: "approve" | "reject") => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // Handle the request action here
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "requests":
        return (
          <View style={styles.content}>
            {mockRequests.map((request) => (
              <View key={request.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Image source={{ uri: request.donation.image }} style={styles.donationImage} />
                  <View style={styles.donationInfo}>
                    <Text style={styles.donationTitle}>{request.donation.title}</Text>
                    <Text style={styles.donationQuantity}>{request.donation.quantity}</Text>
                  </View>
                </View>

                <View style={styles.recipientInfo}>
                  <Image source={{ uri: request.recipient.image }} style={styles.recipientImage} />
                  <View style={styles.recipientDetails}>
                    <Text style={styles.recipientName}>{request.recipient.name}</Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color={theme.colors.accent} />
                      <Text style={styles.ratingText}>{request.recipient.rating}</Text>
                      <Text style={styles.requestCount}>
                        ({request.recipient.totalRequests} requests)
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.requestDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={20} color={theme.colors.textSecondary} />
                    <Text style={styles.detailText}>{request.timeRequested}</Text>
                  </View>
                  <Text style={styles.message}>{request.message}</Text>
                </View>

                {request.status === "pending" ? (
                  <View style={styles.actionButtons}>
                    <Button 
                      title="Approve" 
                      onPress={() => handleRequest(request.id, "approve")}
                      variant="secondary"
                    />
                    <Button 
                      title="Reject" 
                      onPress={() => handleRequest(request.id, "reject")}
                    />
                  </View>
                ) : (
                  <View style={styles.statusContainer}>
                    <Text style={[
                      styles.statusText,
                      request.status === "approved" ? styles.approvedText : styles.rejectedText
                    ]}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )

      case "pickups":
        return (
          <View style={styles.content}>
            {mockPickups.map((pickup) => (
              <TouchableOpacity 
                key={pickup.id} 
                style={styles.card}
                onPress={() => navigation.navigate("PickupDetail", { donationId: pickup.id })}
              >
                <View style={styles.cardHeader}>
                  <Image source={{ uri: pickup.donation.image }} style={styles.donationImage} />
                  <View style={styles.donationInfo}>
                    <Text style={styles.donationTitle}>{pickup.donation.title}</Text>
                    <Text style={styles.donationQuantity}>{pickup.donation.quantity}</Text>
                  </View>
                </View>

                <View style={styles.recipientInfo}>
                  <Image source={{ uri: pickup.recipient.image }} style={styles.recipientImage} />
                  <View style={styles.recipientDetails}>
                    <Text style={styles.recipientName}>{pickup.recipient.name}</Text>
                    <View style={styles.contactInfo}>
                      <Ionicons name="call" size={20} color={theme.colors.textSecondary} />
                      <Text style={styles.contactText}>{pickup.recipient.phone}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.pickupDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={20} color={theme.colors.textSecondary} />
                    <Text style={styles.detailText}>{pickup.scheduledTime}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={20} color={theme.colors.textSecondary} />
                    <Text style={styles.detailText}>{pickup.location}</Text>
                  </View>
                </View>

                <View style={styles.statusContainer}>
                  <Text style={styles.statusText}>
                    {pickup.status.charAt(0).toUpperCase() + pickup.status.slice(1)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )

      case "history":
        return (
          <View style={styles.content}>
            {mockHistory.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Image source={{ uri: item.donation.image }} style={styles.donationImage} />
                  <View style={styles.donationInfo}>
                    <Text style={styles.donationTitle}>{item.donation.title}</Text>
                    <Text style={styles.donationQuantity}>{item.donation.quantity}</Text>
                  </View>
                </View>

                <View style={styles.recipientInfo}>
                  <Image source={{ uri: item.recipient.image }} style={styles.recipientImage} />
                  <View style={styles.recipientDetails}>
                    <Text style={styles.recipientName}>{item.recipient.name}</Text>
                    {item.status === "completed" && (
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={16} color={theme.colors.accent} />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.historyDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons 
                      name={item.status === "completed" ? "checkmark-circle" : "close-circle"} 
                      size={20} 
                      color={item.status === "completed" ? theme.colors.accent : theme.colors.error} 
                    />
                    <Text style={styles.detailText}>
                      {item.status === "completed" ? item.completedAt : item.cancelledAt}
                    </Text>
                  </View>
                </View>

                <View style={styles.statusContainer}>
                  <Text style={[
                    styles.statusText,
                    item.status === "completed" ? styles.approvedText : styles.rejectedText
                  ]}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )
    }
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Donation Activity</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "requests" && styles.activeTab]}
          onPress={() => setActiveTab("requests")}
        >
          <Text style={[styles.tabText, activeTab === "requests" && styles.activeTabText]}>
            Requests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "pickups" && styles.activeTab]}
          onPress={() => setActiveTab("pickups")}
        >
          <Text style={[styles.tabText, activeTab === "pickups" && styles.activeTabText]}>
            Pickups
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.activeTab]}
          onPress={() => setActiveTab("history")}
        >
          <Text style={[styles.tabText, activeTab === "history" && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingTop: theme.spacing.xxxl,
    backgroundColor: theme.colors.background,
  },
  // backButton: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 20,
  //   backgroundColor: theme.colors.backgroundSecondary,
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xl,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.backgroundSecondary,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.accent,
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
  },
  activeTabText: {
    color: theme.colors.accent,
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
  },
  donationImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: theme.spacing.md,
  },
  donationInfo: {
    flex: 1,
    justifyContent: "center",
  },
  donationTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.md,
    marginBottom: theme.spacing.xs,
  },
  donationQuantity: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.sm,
  },
  recipientInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  recipientImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.md,
  },
  recipientDetails: {
    flex: 1,
  },
  recipientName: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.md,
    marginBottom: theme.spacing.xs,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: theme.colors.accent,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.sm,
    marginLeft: theme.spacing.xs,
  },
  requestCount: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.sm,
    marginLeft: theme.spacing.xs,
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    marginLeft: theme.spacing.sm,
  },
  requestDetails: {
    marginBottom: theme.spacing.md,
  },
  pickupDetails: {
    marginBottom: theme.spacing.md,
  },
  historyDetails: {
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  detailText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    marginLeft: theme.spacing.sm,
  },
  message: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    marginTop: theme.spacing.sm,
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "column",
  },
  statusContainer: {
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.round,
  },
  statusText: {
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
    color: theme.colors.textPrimary,
  },
  approvedText: {
    color: theme.colors.accent,
  },
  rejectedText: {
    color: theme.colors.error,
  },
})

export default DonationActivityScreen 