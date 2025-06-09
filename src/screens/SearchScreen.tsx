"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, ScrollView, StyleSheet, TextInput, SafeAreaView, TouchableOpacity, Image, Modal } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import type { RootNavigationProp } from "../navigation/types"
import { globalStyles, theme } from "../utils/theme"
import Button from "../components/Button"

type IconName = keyof typeof Ionicons.glyphMap

// Mock data
const mockFoodItems = [
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

const sortOptions = [
  { id: "distance", label: "Terdekat", icon: "location" as IconName },
  { id: "newest", label: "Terbaru", icon: "time" as IconName },
  { id: "quantity", label: "Jumlah Terbanyak", icon: "stats-chart" as IconName },
  { id: "expiry", label: "Kadaluarsa Terlama", icon: "hourglass" as IconName },
]

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>()
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedSort, setSelectedSort] = useState("distance")
  const [maxDistance, setMaxDistance] = useState("10")
  const [filteredItems, setFilteredItems] = useState(mockFoodItems)

  useEffect(() => {
    // Apply filters and search
    let filtered = [...mockFoodItems]
    
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
    
    // Apply distance filter
    filtered = filtered.filter(item => {
      const distance = parseFloat(item.distance)
      return distance <= parseFloat(maxDistance)
    })
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case "distance":
          return parseFloat(a.distance) - parseFloat(b.distance)
        case "newest":
          return 0 // Implement based on actual timestamp
        case "quantity":
          return parseInt(b.quantity) - parseInt(a.quantity)
        case "expiry":
          // Sort by expiry time (assuming format like "2 hours", "4 hours", "1 week")
          const getExpiryInHours = (expiry: string) => {
            if (expiry.includes("week")) return parseInt(expiry) * 168 // 7 * 24 hours
            if (expiry.includes("day")) return parseInt(expiry) * 24
            return parseInt(expiry)
          }
          return getExpiryInHours(b.expiryTime) - getExpiryInHours(a.expiryTime)
        default:
          return 0
      }
    })
    
    setFilteredItems(filtered)
  }, [searchQuery, selectedCategory, selectedSort, maxDistance])

  const handleFoodItemPress = (item: typeof mockFoodItems[0]) => {
    navigation.navigate("DonationDetail", { donationId: item.id })
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={[globalStyles.container, styles.container]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Available Food</Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search food items..."
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

        {/* Food Items List */}
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          {filteredItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.foodCard}
              onPress={() => handleFoodItemPress(item)}
            >
              <Image source={{ uri: item.image }} style={styles.foodImage} />
              <View style={styles.foodInfo}>
                <Text style={styles.foodTitle}>{item.title}</Text>
                <Text style={styles.foodQuantity}>{item.quantity}</Text>
                <View style={styles.foodMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="location" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.metaText}>{item.distance}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.metaText}>{item.expiryTime}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filter Modal */}
        <Modal
          visible={isFilterModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIsFilterModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter & Sort</Text>
                <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.filterSectionTitle}>Sort By</Text>
              <View style={styles.sortOptions}>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.sortOption,
                      selectedSort === option.id && styles.sortOptionSelected
                    ]}
                    onPress={() => setSelectedSort(option.id)}
                  >
                    <Ionicons 
                      name={option.icon} 
                      size={20} 
                      color={selectedSort === option.id ? theme.colors.textPrimary : theme.colors.textSecondary} 
                      style={styles.sortOptionIcon}
                    />
                    <Text style={[
                      styles.sortOptionText,
                      selectedSort === option.id && styles.sortOptionTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterSectionTitle}>Maximum Distance (km)</Text>
              <View style={styles.distanceInputContainer}>
                <TextInput
                  style={styles.distanceInput}
                  value={maxDistance}
                  onChangeText={setMaxDistance}
                  keyboardType="numeric"
                  placeholder="Enter max distance"
                  placeholderTextColor={theme.colors.textTertiary}
                />
              </View>

              <Button
                title="Apply Filters"
                onPress={() => setIsFilterModalVisible(false)}
              />
            </View>
          </View>
        </Modal>
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
  headerTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xl,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
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
  foodCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: "hidden",
  },
  foodImage: {
    width: 100,
    height: 100,
  },
  foodInfo: {
    flex: 1,
    padding: theme.spacing.md,
  },
  foodTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.md,
    marginBottom: theme.spacing.xs,
  },
  foodQuantity: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.sm,
    marginBottom: theme.spacing.sm,
  },
  foodMeta: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xl,
  },
  filterSectionTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
    marginBottom: theme.spacing.sm,
  },
  sortOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: theme.spacing.lg,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.backgroundSecondary,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  sortOptionSelected: {
    backgroundColor: theme.colors.accent,
  },
  sortOptionIcon: {
    marginRight: theme.spacing.xs,
  },
  sortOptionText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.sm,
  },
  sortOptionTextSelected: {
    color: theme.colors.textPrimary,
  },
  distanceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  distanceInputIcon: {
    marginRight: theme.spacing.sm,
  },
  distanceInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    padding: theme.spacing.md,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
  },
})

export default SearchScreen
