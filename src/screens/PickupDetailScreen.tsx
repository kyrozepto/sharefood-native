"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import type { RootNavigationProp, RootRouteProp } from "../navigation/types"
import { globalStyles, theme } from "../utils/theme"
import Button from "../components/Button"

// Mock data
const mockPickup = {
  id: "1",
  donation: {
    title: "Fresh Vegetables",
    quantity: "5kg",
    image: "https://picsum.photos/200",
  },
  recipient: {
    name: "Alice Smith",
    phone: "+1 234 567 8900",
    image: "https://picsum.photos/201",
  },
  status: "scheduled",
  scheduledTime: "Today, 2:00 PM",
  location: "123 Main St, City",
  notes: "Please bring your own container",
}

const PickupDetailScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>()
  const route = useRoute<RootRouteProp<"PickupDetail">>()
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusUpdate = async (newStatus: "completed" | "cancelled") => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      if (newStatus === "completed") {
        navigation.navigate("ReviewRating", { transactionId: "1" })
      } else {
        navigation.goBack()
      }
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      {/* 1. The header is now outside the ScrollView to make it sticky */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Pickup Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 2. The ScrollView now only contains the scrollable content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Donation</Text>
          <View style={styles.donationCard}>
            <Image source={{ uri: mockPickup.donation.image }} style={styles.donationImage} />
            <View style={styles.donationInfo}>
              <Text style={styles.donationTitle}>{mockPickup.donation.title}</Text>
              <Text style={styles.donationQuantity}>{mockPickup.donation.quantity}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recipient</Text>
          <View style={styles.recipientCard}>
            <Image source={{ uri: mockPickup.recipient.image }} style={styles.recipientImage} />
            <View style={styles.recipientInfo}>
              <Text style={styles.recipientName}>{mockPickup.recipient.name}</Text>
              <View style={styles.contactInfo}>
                <Ionicons name="call" size={20} color={theme.colors.textSecondary} />
                <Text style={styles.contactText}>{mockPickup.recipient.phone}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name="time" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>{mockPickup.scheduledTime}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="location" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>{mockPickup.location}</Text>
            </View>
            {mockPickup.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesText}>{mockPickup.notes}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {mockPickup.status === "scheduled" && (
        <View style={styles.footer}>
          <View style={styles.actionButtons}>
            <Button 
              title={isLoading ? "Completing..." : "Mark as Completed"} 
              onPress={() => handleStatusUpdate("completed")}
              disabled={isLoading}
              variant="secondary"
            />
            <Button 
              title="Cancel Pickup" 
              onPress={() => handleStatusUpdate("cancelled")}
              disabled={isLoading}
            />
          </View>
        </View>
      )}
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
    paddingTop: theme.spacing.xxl,
    backgroundColor: theme.colors.background,
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
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.lg,
    marginBottom: theme.spacing.md,
  },
  donationCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    overflow: "hidden",
  },
  donationImage: {
    width: 100,
    height: 100,
  },
  donationInfo: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'center',
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
  recipientCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    padding: theme.spacing.md,
    alignItems: "center",
  },
  recipientImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: theme.spacing.md,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.md,
    marginBottom: theme.spacing.xs,
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
  detailsCard: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    padding: theme.spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  detailText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    marginLeft: theme.spacing.sm,
  },
  notesContainer: {
    marginTop: theme.spacing.sm,
  },
  notesLabel: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
    marginBottom: theme.spacing.xs,
  },
  notesText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    fontStyle: "italic",
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.backgroundSecondary,
    backgroundColor: theme.colors.background,
  },
  actionButtons: {
    flexDirection: "column",
  },
})

export default PickupDetailScreen