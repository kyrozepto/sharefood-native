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
import { getDonations } from "../services/donation"; // Update path
import type { Donation } from "../interfaces/donationInterface"; // Update path

type IconName = keyof typeof Ionicons.glyphMap;

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

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredItems, setFilteredItems] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("distance");
  const [maxDistance, setMaxDistance] = useState("10");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDonations();
        setDonations(data);
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

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (item) => item.category?.toLowerCase() === selectedCategory
      );
    }

    // Simulate distance filter (replace with real logic when you have coordinates)
    filtered = filtered.filter(
      () => Math.random() * 10 <= parseFloat(maxDistance)
    );

    // Sorting logic
    filtered.sort((a, b) => {
      switch (selectedSort) {
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

    setFilteredItems(filtered);
  }, [searchQuery, selectedCategory, selectedSort, maxDistance, donations]);

  const handleFoodItemPress = (item: Donation) => {
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

        {/* Food Items List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filteredItems.map((item) => (
            <TouchableOpacity
              key={item.donation_id}
              style={styles.foodCard}
              onPress={() => handleFoodItemPress(item)}
            >
              <Image
                source={{
                  uri:
                    item.donation_picture || "https://via.placeholder.com/100",
                }}
                style={styles.foodImage}
              />
              <View style={styles.foodInfo}>
                <Text style={styles.foodTitle}>{item.title}</Text>
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
                      ~{(Math.random() * 10) | 0}km
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
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
});

export default SearchScreen;
