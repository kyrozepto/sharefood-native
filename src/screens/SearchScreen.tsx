"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { RootNavigationProp } from "../navigation/types";
import { globalStyles, theme } from "../utils/theme";
import Button from "../components/Button";
import { getDonations } from "../services/donation";
import { useAuth } from "../context/auth";
import type { Donation } from "../interfaces/donationInterface";

type IconName = keyof typeof Ionicons.glyphMap;

// Fixed location coordinates
const FIXED_LOCATION = {
  latitude: -7.332593,
  longitude: 112.788228,
};

const categories = [
  { id: "all", name: "All", icon: "restaurant" as IconName },
  { id: "vegetables", name: "Vegetables", icon: "leaf" as IconName },
  { id: "fruits", name: "Fruits", icon: "nutrition" as IconName },
  { id: "bakery", name: "Bakery", icon: "cafe" as IconName },
  { id: "dairy", name: "Dairy", icon: "water" as IconName },
  { id: "meat", name: "Meat", icon: "pizza" as IconName },
  { id: "non-perishable", name: "Non-perishable", icon: "cube" as IconName },
  { id: "prepared-food", name: "Prepared-Food", icon: "fast-food" as IconName },
];

const sortOptions = [
  { id: "distance", label: "Terdekat", icon: "location" as IconName },
  { id: "newest", label: "Terbaru", icon: "time" as IconName },
  {
    id: "quantity",
    label: "Jumlah Terbanyak",
    icon: "stats-chart" as IconName,
  },
  { id: "expiry", label: "Kadaluarsa Terlama", icon: "hourglass" as IconName },
];

// Function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

// Function to parse location string and return coordinates
const parseLocation = (
  locationString: string
): { lat: number; lng: number } | null => {
  if (!locationString || typeof locationString !== "string") {
    return null;
  }

  const parts = locationString.split(",");
  if (parts.length !== 2) {
    return null;
  }

  const lat = parseFloat(parts[0].trim());
  const lng = parseFloat(parts[1].trim());

  if (isNaN(lat) || isNaN(lng)) {
    return null;
  }

  return { lat, lng };
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "available":
      return "#4caf50";
    case "confirmed":
      return "#2196f3";
    case "completed":
      return "#9e9e9e";
    case "cancelled":
      return "#f44336";
    default:
      return theme.colors.textSecondary;
  }
};

interface DonationWithDistance extends Donation {
  distance?: number;
}

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const [donations, setDonations] = useState<DonationWithDistance[]>([]);
  const [filteredItems, setFilteredItems] = useState<DonationWithDistance[]>(
    []
  );
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("distance");
  const [maxDistance, setMaxDistance] = useState("10");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const capitalize = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDonations();
        // Calculate distance for each donation
        const donationsWithDistance: DonationWithDistance[] = data.map(
          (donation: Donation) => {
            let distance = 0;

            // Parse the location string to get coordinates
            const coordinates = parseLocation(donation.location);

            if (coordinates) {
              distance = calculateDistance(
                FIXED_LOCATION.latitude,
                FIXED_LOCATION.longitude,
                coordinates.lat,
                coordinates.lng
              );
            } else {
              // If no valid coordinates, assign a high distance or handle as needed
              distance = 999; // High distance to push it to the end when sorting by distance
            }

            return {
              ...donation,
              distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
            };
          }
        );

        setDonations(donationsWithDistance);
      } catch (error) {
        console.error("Error fetching donations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...donations];

    if (searchQuery.trim()) {
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (user?.user_id) {
      filtered = filtered.filter((item) => item.user_id !== user.user_id);
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (item) => item.category?.toLowerCase() === selectedCategory
      );
    }

    filtered = filtered.filter(
      (item) => item.donation_status?.toLowerCase() === "available"
    );

    // Filter by distance
    const maxDistanceNum = parseFloat(maxDistance);
    if (!isNaN(maxDistanceNum)) {
      filtered = filtered.filter(
        (item) => (item.distance || 0) <= maxDistanceNum
      );
    }

    // Sorting logic
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case "distance":
          return (a.distance || 0) - (b.distance || 0);
        case "quantity":
          return b.quantity_value - a.quantity_value;
        case "expiry":
          return (
            new Date(b.expiry_date).getTime() -
            new Date(a.expiry_date).getTime()
          );
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        default:
          return 0;
      }
    });

    const finalItems = searchQuery.trim() ? filtered : filtered.slice(0, 10);
    setFilteredItems(finalItems);
  }, [
    searchQuery,
    selectedCategory,
    selectedSort,
    maxDistance,
    donations,
    user,
  ]);

  const handleFoodItemPress = (item: DonationWithDistance) => {
    navigation.navigate("DonationDetail", {
      donationId: item.donation_id.toString(),
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <View
          style={[
            globalStyles.container,
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </SafeAreaView>
    );
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
            <Ionicons
              name="filter"
              size={24}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
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
                  selectedCategory === category.id &&
                    styles.categoryChipSelected,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon}
                  size={20}
                  color={
                    selectedCategory === category.id
                      ? theme.colors.textPrimary
                      : theme.colors.textSecondary
                  }
                  style={styles.categoryIcon}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category.id &&
                      styles.categoryChipTextSelected,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filteredItems.map((item) => {
            const status = item.donation_status?.toLowerCase() || "unknown";
            const displayStatus = capitalize(status);

            return (
              <TouchableOpacity
                key={item.donation_id}
                style={styles.foodCard}
                onPress={() => handleFoodItemPress(item)}
              >
                <Image
                  source={{
                    uri:
                      item.donation_picture ||
                      "https://via.placeholder.com/100",
                  }}
                  style={styles.foodImage}
                />
                <View style={styles.foodInfo}>
                  <View style={styles.statusTitle}>
                    <Text
                      style={styles.foodTitle}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.title}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getStatusColor(status),
                          marginLeft: 8,
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>{displayStatus}</Text>
                    </View>
                  </View>

                  <Text style={styles.foodQuantity}>
                    {item.quantity_value} {item.quantity_unit}
                  </Text>
                  <View style={styles.foodMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="location"
                        size={16}
                        color={theme.colors.textSecondary}
                      />
                      <Text style={styles.metaText}>
                        {item.distance !== undefined && item.distance < 999
                          ? `${item.distance} km`
                          : "Location unavailable"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.metaItem,
                        { marginLeft: theme.spacing.md },
                      ]}
                    >
                      <Ionicons
                        name="time"
                        size={16}
                        color={theme.colors.textSecondary}
                      />
                      <Text style={styles.metaText}>
                        {new Date(item.expiry_date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {filteredItems.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Ionicons
                name="search"
                size={64}
                color={theme.colors.textTertiary}
                style={{ marginBottom: theme.spacing.md }}
              />
              <Text style={styles.emptyStateText}>
                No food items found within {maxDistance}km
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Try increasing the maximum distance or adjusting your filters
              </Text>
            </View>
          )}
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
                <TouchableOpacity
                  onPress={() => setIsFilterModalVisible(false)}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={theme.colors.textPrimary}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.filterSectionTitle}>Sort By</Text>
              <View style={styles.sortOptions}>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.sortOption,
                      selectedSort === option.id && styles.sortOptionSelected,
                    ]}
                    onPress={() => setSelectedSort(option.id)}
                  >
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={
                        selectedSort === option.id
                          ? theme.colors.textPrimary
                          : theme.colors.textSecondary
                      }
                      style={styles.sortOptionIcon}
                    />
                    <Text
                      style={[
                        styles.sortOptionText,
                        selectedSort === option.id &&
                          styles.sortOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterSectionTitle}>
                Maximum Distance (km)
              </Text>
              <View style={styles.distanceInputContainer}>
                <Ionicons
                  name="location"
                  size={20}
                  color={theme.colors.textSecondary}
                  style={styles.distanceInputIcon}
                />
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
  );
};

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
    flexShrink: 1,
    flexGrow: 1,
    minWidth: 0,
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.md,
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyStateText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.lg,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  emptyStateSubtext: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    textAlign: "center",
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  statusTitle: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
    maxWidth: "100%",
  },
});

export default SearchScreen;
