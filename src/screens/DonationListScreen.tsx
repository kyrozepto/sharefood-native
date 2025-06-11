"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, ScrollView, StyleSheet, TextInput, SafeAreaView, TouchableOpacity, Image, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import type { RootNavigationProp } from "../navigation/types"
import { globalStyles, theme } from "../utils/theme"

type IconName = keyof typeof Ionicons.glyphMap

// Mock data - replace with actual data from your backend
const mockDonations = [
  {
    id: "1",
    title: "Fresh Vegetables",
    quantity: "5kg",
    distance: "2.5km",
    expiryTime: "2 hours",
    image: "https://images.pexels.com/photos/3872406/pexels-photo-3872406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Vegetables",
  },
  {
    id: "2",
    title: "Bread and Pastries",
    quantity: "10 pieces",
    distance: "1.8km",
    expiryTime: "4 hours",
    image: "https://images.pexels.com/photos/30816577/pexels-photo-30816577/free-photo-of-rustic-artisan-bread-loaf-on-floured-surface.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Bakery",
  },
  {
    id: "3",
    title: "Canned Goods",
    quantity: "15 cans",
    distance: "3.2km",
    expiryTime: "1 week",
    image: "https://images.pexels.com/photos/6590914/pexels-photo-6590914.jpeg",
    category: "Non-perishable",
  },
]

const categories = [
  { id: "all", name: "All", icon: "restaurant" as IconName },
  { id: "vegetables", name: "Vegetables", icon: "leaf" as IconName },
  { id: "fruits", name: "Fruits", icon: "nutrition" as IconName },
  { id: "bakery", name: "Bakery", icon: "cafe" as IconName },
  { id: "dairy", name: "Dairy", icon: "water" as IconName },
  { id: "meat", name: "Meat", icon: "pizza" as IconName },
  { id: "non-perishable", name: "Non-perishable", icon: "cube" as IconName },
  { id: "prepared", name: "Prepared Food", icon: "fast-food" as IconName },
]

const DonationListScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [filteredDonations, setFilteredDonations] = useState(mockDonations)
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)

  useEffect(() => {
    // Apply filters and search
    let filtered = [...mockDonations]
    
    // Apply search
    if (searchQuery.trim()) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category.toLowerCase() === selectedCategory)
    }
    
    setFilteredDonations(filtered)
  }, [searchQuery, selectedCategory])

  const handleDonationPress = (donationId: string) => {
    navigation.navigate("DonationDetail", { donationId })
  }

  const handleEditPress = (donationId: string) => {
    navigation.navigate("EditDonation", { donationId })
  }

  const handleDeletePress = (donationId: string) => {
    Alert.alert(
      "Delete Donation",
      "Are you sure you want to delete this donation?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Here you would typically make an API call to delete the donation
            setShowDeleteSuccess(true)
            setTimeout(() => setShowDeleteSuccess(false), 2000)
          }
        }
      ]
    )
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={[globalStyles.container, styles.container]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Donations</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your donations..."
            placeholderTextColor={theme.colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {/* Categories */}
        <View style={styles.categoriesWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipSelected
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons 
                  name={category.icon} 
                  size={20} 
                  color={selectedCategory === category.id ? theme.colors.textPrimary : theme.colors.textSecondary} 
                  style={styles.categoryIcon}
                />
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === category.id && styles.categoryChipTextSelected
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Donations List */}
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          {filteredDonations.map((donation) => (
            <View key={donation.id} style={styles.donationCard}>
              <TouchableOpacity
                style={styles.donationContent}
                onPress={() => handleDonationPress(donation.id)}
              >
                <Image source={{ uri: donation.image }} style={styles.donationImage} />
                <View style={styles.donationInfo}>
                  <Text style={styles.donationTitle}>{donation.title}</Text>
                  <Text style={styles.donationQuantity}>{donation.quantity}</Text>
                  <View style={styles.donationMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="location" size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.metaText}>{donation.distance}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time" size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.metaText}>{donation.expiryTime}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton]}
                  onPress={() => handleEditPress(donation.id)}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton]}
                  onPress={() => handleDeletePress(donation.id)}
                >
                  <Text style={styles.actionButtonTextError}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Delete Success Toast */}
        {showDeleteSuccess && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>Donation successfully deleted</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xl,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    paddingVertical: theme.spacing.md,
  },
  categoriesWrapper: {
    marginBottom: theme.spacing.md,
  },
  categoriesContainer: {
    paddingBottom: theme.spacing.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.backgroundSecondary,
    marginRight: theme.spacing.sm,
  },
  categoryChipSelected: {
    backgroundColor: theme.colors.accent,
  },
  categoryIcon: {
    marginRight: theme.spacing.xs,
  },
  categoryChipText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.sm,
  },
  categoryChipTextSelected: {
    color: theme.colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxxl,
  },
  donationCard: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: "hidden",
  },
  donationContent: {
    flexDirection: "row",
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
  actionButtons: {
    flexDirection: "row",
    padding: theme.spacing.sm,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.xs,
  },
  actionButtonText: {
    color: "#1DB954",
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
  },
  actionButtonTextError: {
    color: "#FF0000",
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
  },
  editButton: {
    color: "theme.colors.background",
  },
  deleteButton: {
    color: "theme.colors.background",
  },
  toast: {
    position: "absolute",
    bottom: theme.spacing.xl,
    left: theme.spacing.xxl,
    right: theme.spacing.xxl,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.round,
    alignItems: "center",
  },
  toastText: {
    color: theme.colors.textTertiary,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
  },
})

export default DonationListScreen 