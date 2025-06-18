"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { RootNavigationProp } from "../navigation/types";
import { globalStyles, theme } from "../utils/theme";
import { getDonations } from "../services/donation";
import type { Donation } from "../interfaces/donationInterface";
import { useAuth } from "../context/auth"; // Make sure this is the right path

type IconName = keyof typeof Ionicons.glyphMap;

const categories = [
  { id: "all", name: "All", icon: "restaurant" as IconName },
  { id: "vegetables", name: "Vegetables", icon: "leaf" as IconName },
  { id: "fruits", name: "Fruits", icon: "nutrition" as IconName },
  { id: "bakery", name: "Bakery", icon: "cafe" as IconName },
  { id: "dairy", name: "Dairy", icon: "water" as IconName },
  { id: "meat", name: "Meat", icon: "pizza" as IconName },
  { id: "non-perishable", name: "Non-perishable", icon: "cube" as IconName },
  { id: "prepared", name: "Prepared Food", icon: "fast-food" as IconName },
];

const DonationListScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const { user } = useAuth(); // <-- Get current user
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const data = await getDonations();
        setDonations(data);
      } catch (error) {
        console.error("Failed to fetch donations", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const filteredDonations = donations.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();

    const isCurrentUser = user ? item.user_id === user.user_id : false;

    return matchesSearch && matchesCategory && isCurrentUser;
  });

  const handleDonationPress = (donationId: number) => {
    navigation.navigate("DonationDetail", {
      donationId: donationId.toString(),
    });
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={[globalStyles.container, styles.container]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Donations</Text>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search donations..."
            placeholderTextColor={theme.colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

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

        {loading ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.textPrimary}
            style={{ marginTop: 20 }}
          />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {filteredDonations.map((donation) => (
              <TouchableOpacity
                key={donation.donation_id}
                style={styles.donationCard}
                onPress={() => handleDonationPress(donation.donation_id)}
              >
                <View style={styles.donationContent}>
                  <Image
                    source={{ uri: donation.donation_picture }}
                    style={styles.donationImage}
                  />
                  <View style={styles.donationInfo}>
                    <Text style={styles.donationTitle} numberOfLines={1}>
                      {donation.title}
                    </Text>
                    <Text style={styles.donationStatus}>
                      {donation.donation_status.charAt(0).toUpperCase() +
                        donation.donation_status.slice(1)}
                    </Text>
                    <Text style={styles.donationQuantity}>
                      {donation.quantity_value} {donation.quantity_unit}
                    </Text>

                    <View style={styles.donationMetaRow}>
                      <View style={styles.metaItemLocation}>
                        <Ionicons
                          name="location"
                          size={16}
                          color={theme.colors.textSecondary}
                          style={styles.metaIcon}
                        />
                        <Text
                          style={styles.metaText}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {donation.location}
                        </Text>
                      </View>
                      <View style={styles.metaItemDate}>
                        <Ionicons
                          name="time"
                          size={16}
                          color={theme.colors.textSecondary}
                          style={styles.metaIcon}
                        />
                        <Text style={styles.metaText}>
                          {new Date(donation.expiry_date).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
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
    marginBottom: 2,
  },
  donationStatus: {
    color: theme.colors.accent,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.sm,
    marginBottom: 2,
    textTransform: "capitalize",
  },
  donationQuantity: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.sm,
    marginBottom: theme.spacing.sm,
  },
  donationMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.xs,
  },
  metaItemLocation: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: theme.spacing.sm,
  },
  metaItemDate: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.sm,
    flexShrink: 1,
  },
});

export default DonationListScreen;
