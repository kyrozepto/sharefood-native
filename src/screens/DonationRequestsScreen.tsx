"use client";

import type React from "react";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { RootNavigationProp, RootRouteProp } from "../navigation/types";
import { globalStyles, theme } from "../utils/theme";
import Button from "../components/Button";

// Mock data - replace with actual data from your backend
const mockRequests = [
  {
    id: "1",
    recipient: {
      name: "Alice Smith",
      rating: 4.5,
      totalRequests: 8,
      image: "https://picsum.photos/201",
    },
    quantity: "2kg",
    status: "pending",
    message: "I can pick up within the next hour",
    timeRequested: "10 minutes ago",
  },
  {
    id: "2",
    recipient: {
      name: "Bob Johnson",
      rating: 4.8,
      totalRequests: 12,
      image: "https://picsum.photos/202",
    },
    quantity: "3 serving",
    status: "approved",
    message: "I'll be there in 30 minutes",
    timeRequested: "5 minutes ago",
  },
];

const DonationRequestsScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<RootRouteProp<"DonationRequests">>();
  const [isLoading, setIsLoading] = useState(false);

  const handleRequest = async (
    requestId: string,
    action: "approve" | "reject"
  ) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Handle the request action here
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={globalStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Donation Requests</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          {mockRequests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.recipientInfo}>
                <Image
                  source={{ uri: request.recipient.image }}
                  style={styles.recipientImage}
                />
                <View style={styles.recipientDetails}>
                  <Text style={styles.recipientName}>
                    {request.recipient.name}
                  </Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons
                      name="star"
                      size={16}
                      color={theme.colors.accent}
                    />
                    <Text style={styles.ratingText}>
                      {request.recipient.rating}
                    </Text>
                    <Text style={styles.requestCount}>
                      ({request.recipient.totalRequests} requests)
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.requestDetails}>
                <View style={styles.detailRow}>
                  <Ionicons
                    name="restaurant"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={styles.detailText}>
                    Requesting {request.quantity}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons
                    name="time"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={styles.detailText}>{request.timeRequested}</Text>
                </View>
                <Text style={styles.message}>{request.message}</Text>
              </View>

              {request.status === "pending" ? (
                <View style={styles.actionButtons}>
                  <Button
                    title="Approve"
                    onPress={() => handleRequest(request.id, "approve")}
                    variant="secondary"
                  />
                  <Button
                    title="Reject"
                    onPress={() => handleRequest(request.id, "reject")}
                  />
                </View>
              ) : (
                <View style={styles.statusContainer}>
                  <Text
                    style={[
                      styles.statusText,
                      request.status === "approved"
                        ? styles.approvedText
                        : styles.rejectedText,
                    ]}
                  >
                    {request.status.charAt(0).toUpperCase() +
                      request.status.slice(1)}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
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
  content: {
    paddingHorizontal: theme.spacing.md,
  },
  requestCard: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  recipientInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  recipientImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: theme.spacing.md,
  },
  recipientDetails: {
    flex: 1,
  },
  recipientName: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.md,
    marginBottom: theme.spacing.xs,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: theme.colors.accent,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.sm,
    marginLeft: theme.spacing.xs,
  },
  requestCount: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.sm,
    marginLeft: theme.spacing.xs,
  },
  requestDetails: {
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  detailText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    marginLeft: theme.spacing.sm,
  },
  message: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    marginTop: theme.spacing.sm,
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "column",
    justifyContent: "space-between",
  },
  statusContainer: {
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.round,
  },
  statusText: {
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
  },
  approvedText: {
    color: theme.colors.accent,
  },
  rejectedText: {
    color: theme.colors.error,
  },
});

export default DonationRequestsScreen;
