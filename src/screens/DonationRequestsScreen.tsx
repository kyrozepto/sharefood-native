"use client";

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { RootNavigationProp, RootRouteProp } from "../navigation/types";
import { globalStyles, theme } from "../utils/theme";
import Button from "../components/Button";
import { getRequests } from "../services/request";
import { updateRequest } from "../services/request";
import { getUserById } from "../services/user";
import { useAuth } from "../context/auth";
import type { RequestItem } from "../interfaces/requestInterface";
import type { User } from "../interfaces/userInterface";

interface ExtendedRequest extends RequestItem {
  user: User | null;
}

const DonationRequestsScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<RootRouteProp<"DonationRequests">>();
  const { user, token } = useAuth();
  const donationId = route.params?.donationId;

  const [requests, setRequests] = useState<ExtendedRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!donationId || !token) return;
      try {
        const allRequests = await getRequests();
        const filtered = allRequests.filter(
          (r) => r.donation_id === Number(donationId)
        );

        const enriched = await Promise.all(
          filtered.map(async (r) => {
            try {
              const userData = await getUserById(r.user_id, token);
              return { ...r, user: userData };
            } catch {
              return { ...r, user: null };
            }
          })
        );

        setRequests(enriched);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [donationId, token]);

  const handleRequest = async (
    requestId: number,
    action: "approved" | "rejected"
  ) => {
    if (!token) return;
    setIsLoading(true);
    try {
      await updateRequest(requestId, { request_status: action }, token);
      setRequests((prev) =>
        prev.map((r) =>
          r.request_id === requestId ? { ...r, request_status: action } : r
        )
      );
    } catch (error) {
      console.error("Failed to update request:", error);
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
          {isLoading ? (
            <ActivityIndicator size="large" color={theme.colors.textPrimary} />
          ) : (
            requests.map((request) => (
              <View key={request.request_id} style={styles.requestCard}>
                <View style={styles.recipientInfo}>
                  <Image
                    source={{
                      uri:
                        request.user?.profile_picture ||
                        "https://via.placeholder.com/100",
                    }}
                    style={styles.recipientImage}
                  />
                  <View style={styles.recipientDetails}>
                    <Text style={styles.recipientName}>
                      {request.user?.user_name ?? `User ${request.user_id}`}
                    </Text>
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
                      Requesting {request.requested_quantity}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="time"
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.detailText}>{request.pickup_time}</Text>
                  </View>
                  <Text style={styles.message}>{request.note}</Text>
                </View>

                {request.request_status === "waiting" ? (
                  <View style={styles.actionButtons}>
                    <Button
                      title="Approve"
                      onPress={() =>
                        handleRequest(request.request_id, "approved")
                      }
                      variant="secondary"
                    />
                    <Button
                      title="Reject"
                      onPress={() =>
                        handleRequest(request.request_id, "rejected")
                      }
                    />
                  </View>
                ) : (
                  <View style={styles.statusContainer}>
                    <Text
                      style={[
                        styles.statusText,
                        request.request_status === "approved"
                          ? styles.approvedText
                          : styles.rejectedText,
                      ]}
                    >
                      {request.request_status.charAt(0).toUpperCase() +
                        request.request_status.slice(1)}
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
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
