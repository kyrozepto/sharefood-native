"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import type { RootNavigationProp } from "../navigation/types"
import { globalStyles, theme } from "../utils/theme"
import Button from "../components/Button"

// Mock data - replace with actual data from your backend
const mockStats = {
  donations: 12,
  requests: 8,
  impact: "45kg",
  rating: 4.8,
}

const mockRecentDonations = [
  {
    id: "1",
    title: "Fresh Vegetables",
    quantity: "5kg",
    location: "2.5km away",
    timeLeft: "2 hours",
    image: "https://picsum.photos/200",
  },
  {
    id: "2",
    title: "Bread and Pastries",
    quantity: "10 pieces",
    location: "1.8km away",
    timeLeft: "4 hours",
    image: "https://picsum.photos/201",
  },
]

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>()
  const [userRole] = useState<"donor" | "recipient">("donor") // Replace with actual user role from auth context

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={globalStyles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, John!</Text>
            <Text style={styles.subtitle}>
              {userRole === "donor" ? "Ready to share some food?" : "Looking for food donations?"}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate("Notifications")}
          >
            <Ionicons name="notifications" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="restaurant" size={24} color={theme.colors.accent} />
            <Text style={styles.statValue}>{mockStats.donations}</Text>
            <Text style={styles.statLabel}>Donations</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color={theme.colors.accent} />
            <Text style={styles.statValue}>{mockStats.requests}</Text>
            <Text style={styles.statLabel}>Requests</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="leaf" size={24} color={theme.colors.accent} />
            <Text style={styles.statValue}>{mockStats.impact}</Text>
            <Text style={styles.statLabel}>Impact</Text>
          </View>
        </View>

        {userRole === "donor" ? (
          // for user role donor
          <View style={styles.actionContainer}>
            <Button 
              title="Add New Donation" 
              onPress={() => navigation.navigate("AddDonation")}
            />
          </View>
        ) : (
          // for user role recipient
          <View style={styles.actionContainer}>
            <Button 
              title="Search Donations" 
              onPress={() => navigation.navigate("Search")}
            />
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {userRole === "donor" ? "Your Recent Donations" : "Available Donations"}
            </Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {mockRecentDonations.map((donation) => (
            <TouchableOpacity
              key={donation.id}
              style={styles.donationCard}
              onPress={() => navigation.navigate("DonationDetail", { donationId: donation.id })}
            >
              <Image source={{ uri: donation.image }} style={styles.donationImage} />
              <View style={styles.donationInfo}>
                <Text style={styles.donationTitle}>{donation.title}</Text>
                <Text style={styles.donationQuantity}>{donation.quantity}</Text>
                <View style={styles.donationMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="location" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.metaText}>{donation.location}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.metaText}>{donation.timeLeft}</Text>
                  </View>
                </View>
              </View>
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
  greeting: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xl,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    alignItems: "center",
  },
  statValue: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xl,
    marginVertical: theme.spacing.xs,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.sm-1,
  },
  actionContainer: {
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.lg,
  },
  seeAllText: {
    color: theme.colors.accent,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
  },
  donationCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    marginBottom: theme.spacing.md,
    overflow: "hidden",
  },
  donationImage: {
    width: 100,
    height: 100,
  },
  donationInfo: {
    flex: 1,
    padding: theme.spacing.md,
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
    marginBottom: theme.spacing.sm,
  },
  donationMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.sm,
    marginLeft: theme.spacing.xs,
  },
})

export default HomeScreen
