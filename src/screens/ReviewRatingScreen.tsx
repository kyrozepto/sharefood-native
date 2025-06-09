"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import type { RootNavigationProp, RootRouteProp } from "../navigation/types"
import { globalStyles, theme } from "../utils/theme"
import Button from "../components/Button"

// Mock data - replace with actual data from your backend
const mockTransaction = {
  id: "1",
  type: "donation", // or "request"
  otherParty: {
    name: "Alice Smith",
    role: "recipient", // or "donor"
  },
  item: "Fresh Vegetables",
  quantity: "5kg",
}

const ReviewRatingScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>()
  const route = useRoute<RootRouteProp<"ReviewRating">>()
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) return

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      navigation.navigate("Main")
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={globalStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Rate & Review</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.transactionInfo}>
            <Text style={styles.infoText}>
              {mockTransaction.type === "donation" ? "You donated" : "You received"}{" "}
              <Text style={styles.highlight}>{mockTransaction.quantity}</Text> of{" "}
              <Text style={styles.highlight}>{mockTransaction.item}</Text>
            </Text>
            <Text style={styles.infoText}>
              {mockTransaction.otherParty.role === "recipient" ? "to" : "from"}{" "}
              <Text style={styles.highlight}>{mockTransaction.otherParty.name}</Text>
            </Text>
          </View>

          <View style={styles.ratingContainer}>
            <Text style={styles.ratingTitle}>How was your experience?</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={32}
                    color={star <= rating ? theme.colors.accent : theme.colors.textSecondary}
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
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <Button 
            title={isLoading ? "Submitting..." : "Submit Review"} 
            onPress={handleSubmit}
            disabled={isLoading || rating === 0}
          />
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
  content: {
    paddingHorizontal: theme.spacing.md,
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
  starButton: {
    padding: theme.spacing.xs,
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
})

export default ReviewRatingScreen 