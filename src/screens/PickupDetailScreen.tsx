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
  Alert,
} from "react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { RootNavigationProp, RootRouteProp } from "../navigation/types";
import { globalStyles, theme } from "../utils/theme";
import Button from "../components/Button";
import { useAuth } from "../context/auth";
import { getRequestById, updateRequest } from "../services/request";
import { getUserById } from "../services/user";
import { getDonationById } from "../services/donation";
import { getRatings } from "../services/rating";
import type { RequestItem } from "../interfaces/requestInterface";
import type { User } from "../interfaces/userInterface";
import type { Donation } from "../interfaces/donationInterface";

const PickupDetailScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<RootRouteProp<"PickupDetail">>();
  const { user, token } = useAuth();
  const requestId = Number(route.params.requestId);

  const [request, setRequest] = useState<RequestItem | null>(null);
  const [receiver, setReceiver] = useState<User | null>(null);
  const [donation, setDonation] = useState<Donation | null>(null);
  const [donor, setDonor] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [hasRated, setHasRated] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchData = async () => {
        if (!token || !user) return;

        try {
          setIsFetching(true);

          const fetchedRequest = await getRequestById(requestId, token);
          if (!isActive) return;
          setRequest(fetchedRequest);

          const [fetchedUser, fetchedDonation] = await Promise.all([
            getUserById(fetchedRequest.user_id, token),
            getDonationById(fetchedRequest.donation_id),
          ]);
          if (!isActive) return;

          setReceiver(fetchedUser);
          setDonation(fetchedDonation);

          const fetchedDonor = await getUserById(
            fetchedDonation.user_id,
            token
          );
          setDonor(fetchedDonor);

          const fetchedRatings = await getRatings();
          const alreadyRated = fetchedRatings.some(
            (rating) =>
              rating.donation_id === fetchedRequest.donation_id &&
              rating.user_id === user.user_id
          );
          setHasRated(alreadyRated);
        } catch (error) {
          console.error("Failed to load pickup data:", error);
        } finally {
          if (isActive) setIsFetching(false);
        }
      };

      fetchData();

      return () => {
        isActive = false;
      };
    }, [requestId, token, user])
  );

  const confirmCancel = () => {
    const isDonor = user?.user_type === "donor";
    Alert.alert(
      "Confirm Cancellation",
      isDonor
        ? "Are you sure you want to reject this pickup request?"
        : "Are you sure you want to cancel this pickup?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => handleStatusUpdate("canceled", isDonor),
        },
      ]
    );
  };

  const handleStatusUpdate = async (
    newStatus: "completed" | "canceled" | "rejected",
    byDonor = false
  ) => {
    if (!token || !request) return;
    setIsLoading(true);

    try {
      const finalStatus =
        newStatus === "canceled" && byDonor ? "rejected" : newStatus;

      await updateRequest(
        request.request_id,
        { request_status: finalStatus },
        token
      );

      if (finalStatus === "completed" && donor && donation?.user_id) {
        Alert.alert("Done", "Pickup marked as completed", [
          {
            text: "OK",
            onPress: () => {
              navigation.navigate("ReviewRating", {
                donation_id: donation.donation_id,
                donor_id: donation.user_id,
                donor_name: donor.user_name,
                item: donation.title,
                quantity: `${donation.quantity_value} ${donation.quantity_unit}`,
              });
            },
          },
        ]);
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error("Status update failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching || !request || !receiver || !donation) {
    return (
      <SafeAreaView
        style={[
          globalStyles.safeArea,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.textPrimary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
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
        <Text style={styles.title}>Pickup Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Donation</Text>
          <View style={styles.donationCard}>
            <Image
              source={{
                uri:
                  donation.donation_picture ||
                  "https://images.pexels.com/photos/3872406/pexels-photo-3872406.jpeg",
              }}
              style={styles.donationImage}
            />
            <View style={styles.donationInfo}>
              <Text style={styles.donationTitle}>{donation.title}</Text>
              <Text style={styles.donationQuantity}>
                {donation.quantity_value} {donation.quantity_unit}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receiver</Text>
          <View style={styles.recipientCard}>
            <Image
              source={{
                uri: receiver.profile_picture || "https://picsum.photos/201",
              }}
              style={styles.recipientImage}
            />
            <View style={styles.recipientInfo}>
              <Text style={styles.recipientName}>{receiver.user_name}</Text>
              <View style={styles.contactInfo}>
                <Ionicons
                  name="call"
                  size={20}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.contactText}>
                  {receiver.phone || "N/A"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons
                name="time"
                size={20}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.detailText}>{request.pickup_time}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons
                name="location"
                size={20}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.detailText}>{donation.location}</Text>
            </View>
            {request.note && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesText}>{request.note}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {request.request_status === "approved" &&
        (user?.user_type === "receiver" || user?.user_type === "donor") && (
          <View style={styles.footer}>
            <View style={styles.actionButtons}>
              {user?.user_type === "receiver" && (
                <Button
                  title="Mark as Completed"
                  onPress={() => handleStatusUpdate("completed")}
                  disabled={isLoading}
                  style={{ backgroundColor: theme.colors.accent }}
                />
              )}

              <Button
                title="Cancel Pickup"
                onPress={confirmCancel}
                disabled={isLoading}
                style={{
                  marginTop:
                    user?.user_type === "receiver" ? theme.spacing.sm : 0,
                }}
              />
            </View>
          </View>
        )}

      {request.request_status === "completed" &&
        user?.user_type === "receiver" &&
        donor &&
        donation?.user_id && (
          <View style={styles.footer}>
            {hasRated ? (
              <Button title="Already Rated" disabled onPress={() => {}} />
            ) : (
              <Button
                title="Give Rating"
                onPress={() =>
                  navigation.navigate("ReviewRating", {
                    donation_id: request.donation_id,
                    donor_id: donation.user_id,
                    donor_name: donor.user_name,
                    item: donation.title,
                    quantity: `${donation.quantity_value} ${donation.quantity_unit}`,
                  })
                }
              />
            )}
          </View>
        )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingTop: theme.spacing.xxl,
    backgroundColor: theme.colors.background,
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
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.lg,
    marginBottom: theme.spacing.md,
  },
  donationCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    overflow: "hidden",
  },
  donationImage: {
    width: 100,
    height: 100,
  },
  donationInfo: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: "center",
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
  },
  recipientCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    padding: theme.spacing.md,
    alignItems: "center",
  },
  recipientImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: theme.spacing.md,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.md,
    marginBottom: theme.spacing.xs,
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    marginLeft: theme.spacing.sm,
  },
  detailsCard: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    padding: theme.spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  detailText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    marginLeft: theme.spacing.sm,
  },
  notesContainer: {
    marginTop: theme.spacing.sm,
  },
  notesLabel: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
    marginBottom: theme.spacing.xs,
  },
  notesText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    fontStyle: "italic",
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.backgroundSecondary,
    backgroundColor: theme.colors.background,
  },
  actionButtons: {
    flexDirection: "column",
  },
});

export default PickupDetailScreen;
