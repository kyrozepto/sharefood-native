"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { RootNavigationProp, RootRouteProp } from "../navigation/types";
import { globalStyles, theme } from "../utils/theme";
import Button from "../components/Button";
import { createRating } from "../services/rating";
import { useAuth } from "../context/auth";

const ReviewRatingScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<RootRouteProp<"ReviewRating">>();

  const { token } = useAuth();
  const { donation_id, item, quantity, donor_name } = route.params;

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating || !donation_id || !token) {
      Alert.alert("Error", "Rating and donation ID are required.");
      return;
    }

    setIsLoading(true);
    try {
      await createRating(
        {
          donation_id: Number(donation_id),
          rate: rating,
          review: review.trim(),
        },
        token
      );

      Alert.alert("Success", "Your rating has been submitted.");
      navigation.navigate("Main", {
        screen: "Home",
      });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to submit rating.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={globalStyles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Rate & Review</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.transactionInfo}>
          <Text style={styles.infoText}>
            You received <Text style={styles.highlight}>{quantity}</Text> of{" "}
            <Text style={styles.highlight}>{item}</Text>
          </Text>
          <Text style={styles.infoText}>
            from <Text style={styles.highlight}>{donor_name}</Text>
          </Text>
        </View>

        <View style={styles.ratingContainer}>
          <Text style={styles.ratingTitle}>How was your experience?</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={32}
                  color={
                    star <= rating
                      ? theme.colors.accent
                      : theme.colors.textSecondary
                  }
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.reviewContainer}>
          <Text style={styles.reviewTitle}>Write a review (optional)</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="Share your experience..."
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            value={review}
            onChangeText={setReview}
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <Button
          title={isLoading ? "Submitting..." : "Submit Review"}
          onPress={handleSubmit}
          disabled={isLoading || rating === 0}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
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
  transactionInfo: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  infoText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  highlight: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.medium,
  },
  ratingContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  ratingTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.lg,
    marginBottom: theme.spacing.md,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  reviewContainer: {
    marginBottom: theme.spacing.xl,
  },
  reviewTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.lg,
    marginBottom: theme.spacing.md,
  },
  reviewInput: {
    backgroundColor: theme.colors.backgroundSecondary,
    color: theme.colors.textPrimary,
    padding: theme.spacing.md,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    borderRadius: 16,
    height: 120,
  },
});

export default ReviewRatingScreen;
