"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, Modal } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import type { RootNavigationProp, RootRouteProp } from "../navigation/types"
import { globalStyles, theme } from "../utils/theme"
import Button from "../components/Button"

// Mock data
const mockDonation = {
  id: "1",
  title: "Fresh Vegetables",
  description: "A variety of fresh vegetables including carrots, potatoes, and onions. All vegetables are in good condition and were purchased yesterday.",
  quantity: "5kg",
  expiryTime: "2 hours",
  location: "123 Main St, City",
  distance: "2.5km away",
  donor: {
    name: "John Doe",
    rating: 4.8,
    totalDonations: 15,
  },
  image: "https://images.pexels.com/photos/3872406/pexels-photo-3872406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  // ...
}

const DonationDetailScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>()
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false)
  const [requestQuantity, setRequestQuantity] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRequest = async () => {
    if (!requestQuantity.trim()) {
      setError("Please enter the quantity you want")
      return
    }
    setIsLoading(true)
    setError("")
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsRequestModalVisible(false)
      navigation.goBack()
    } catch (error) {
      setError("Failed to submit request. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      {/* The header is now OUTSIDE the ScrollView */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Donation Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <Image source={{ uri: mockDonation.image }} style={styles.image} />

        <View>
          <Text style={styles.donationTitle}>{mockDonation.title}</Text>
          
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="restaurant" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.metaText}>{mockDonation.quantity}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.metaText}>{mockDonation.expiryTime}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.metaText}>{mockDonation.distance}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{mockDonation.description}</Text>

          <Text style={styles.sectionTitle}>Donor Information</Text>
          <View style={styles.donorInfo}>
            <View style={styles.donorHeader}>
              <Text style={styles.donorName}>{mockDonation.donor.name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color={theme.colors.accent} />
                <Text style={styles.ratingText}>{mockDonation.donor.rating}</Text>
              </View>
            </View>
            <Text style={styles.donorStats}>
              {mockDonation.donor.totalDonations} donations made
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.location}>{mockDonation.location}</Text>

          <Button 
            title="Request Donation" 
            onPress={() => navigation.navigate("RequestForm", { donation: mockDonation })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 40, // Space for bottom navbar
  },
  scrollView: {
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
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
  image: {
    width: "100%",
    height: 250,
    borderRadius: 16,
    marginBottom: theme.spacing.xl,
  },
  donationTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xl,
    marginBottom: theme.spacing.md,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xl,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    marginLeft: theme.spacing.xs,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.lg,
    marginBottom: theme.spacing.sm,
  },
  description: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  donorInfo: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  donorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  donorName: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.md,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: theme.colors.accent,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
    marginLeft: theme.spacing.xs,
  },
  donorStats: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.sm,
  },
  location: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    marginBottom: theme.spacing.xl,
  },
})

export default DonationDetailScreen