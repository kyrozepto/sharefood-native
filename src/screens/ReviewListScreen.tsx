"use client";

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/auth";
import { useNavigation } from "@react-navigation/native";
import { getRatingsByDonorId } from "../services/rating";
import { globalStyles, theme } from "../utils/theme";
import type { ReceivedRating } from "../interfaces/ratingInterface";
import type { RootNavigationProp } from "../navigation/types";

const { width } = Dimensions.get("window");

const ReviewListScreen: React.FC = () => {
  const { user, token } = useAuth();
  const navigation = useNavigation<RootNavigationProp>();
  const [reviews, setReviews] = useState<ReceivedRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReceivedRatings = async () => {
    if (!user?.user_id || !token) return;

    try {
      const donorRatings = await getRatingsByDonorId(user.user_id, token);
      setReviews(donorRatings);
    } catch (error) {
      console.error("Failed to fetch received ratings", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReceivedRatings();
  }, [user, token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReceivedRatings();
  };

  const renderStars = (rating: number | string) => {
    const numericRating =
      typeof rating === "string" ? parseFloat(rating) : rating;
    const stars = [];
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={18} color={theme.colors.accent} />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons
          key="half"
          name="star-half"
          size={18}
          color={theme.colors.accent}
        />
      );
    }

    const remainingStars = 5 - Math.ceil(numericRating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={18}
          color="#E0E0E0"
        />
      );
    }

    return stars;
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => {
      const rate =
        typeof review.rate === "string" ? parseFloat(review.rate) : review.rate;
      return sum + rate;
    }, 0);
    return (total / reviews.length).toFixed(1);
  };

  return (
    <SafeAreaView
      style={[
        globalStyles.safeArea,
        { paddingTop: Platform.OS === "android" ? 25 : 0 },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Reviews</Text>
          {reviews.length > 0 && (
            <Text style={styles.headerSubtitle}>
              {reviews.length} review{reviews.length !== 1 ? "s" : ""} •{" "}
              {getAverageRating()}★
            </Text>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="star-outline" size={64} color="#E0E0E0" />
          </View>
          <Text style={styles.emptyTitle}>No Reviews Yet</Text>
          <Text style={styles.emptyText}>
            Your received reviews will appear here when donors rate your
            donations.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.accent]}
              tintColor={theme.colors.accent}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{reviews.length}</Text>
                <Text style={styles.summaryLabel}>Total Reviews</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{getAverageRating()}</Text>
                <Text style={styles.summaryLabel}>Average Rating</Text>
              </View>
            </View>
          </View>

          {reviews.map((review, index) => (
            <View
              key={review.rating_id}
              style={[
                styles.reviewCard,
                { marginTop: index === 0 ? theme.spacing.md : 0 },
              ]}
            >
              <View style={styles.cardHeader}>
                <Image
                  source={{
                    uri:
                      review.donation_picture ||
                      "https://example.com/default-food.png",
                  }}
                  style={styles.donationImage}
                  resizeMode="cover"
                />

                <View style={styles.reviewContent}>
                  <Text style={styles.donationTitle} numberOfLines={2}>
                    {review.donation_title || "Untitled Donation"}
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.font.size.sm,
                      color: theme.colors.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    Rated by {review.rater_name}
                  </Text>
                  <View style={styles.ratingContainer}>
                    <View style={styles.starsContainer}>
                      {renderStars(review.rate)}
                    </View>
                    <Text style={styles.ratingNumber}>({review.rate})</Text>
                  </View>
                </View>
              </View>

              {review.review && review.review.trim() !== "" && (
                <View style={styles.reviewTextContainer}>
                  <Text style={styles.reviewText}>{review.review}</Text>
                </View>
              )}
            </View>
          ))}

          <View style={{ height: theme.spacing.xl }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: theme.font.size.xl,
    fontFamily: theme.font.family.bold,
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  summaryCard: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 24,
    fontFamily: theme.font.family.bold,
    color: theme.colors.accent,
  },
  summaryLabel: {
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E0E0E0",
    marginHorizontal: theme.spacing.md,
  },
  reviewCard: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  donationImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: theme.spacing.md,
    backgroundColor: "#F5F5F5",
  },
  reviewContent: {
    flex: 1,
  },
  donationTitle: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: theme.spacing.xs,
  },
  ratingNumber: {
    fontSize: theme.font.size.sm,
    color: theme.colors.accent,
    fontFamily: theme.font.family.medium,
  },
  reviewTextContainer: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  reviewText: {
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
    fontSize: theme.font.size.sm,
    lineHeight: 18,
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIconContainer: {
    marginBottom: theme.spacing.lg,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default ReviewListScreen;
