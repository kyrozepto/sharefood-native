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
import { getDonationById } from "../services/donation";
import { getRequests } from "../services/request";
import type { Donation } from "../interfaces/donationInterface";
import type { RequestItem } from "../interfaces/requestInterface";

const DonationDetailScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<RootRouteProp<"DonationDetail">>();
  const { donationId } = route.params;

  const [donation, setDonation] = useState<Donation | null>(null);
  const [confirmedRequest, setConfirmedRequest] = useState<RequestItem | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDonationAndRequest = async () => {
      try {
        const data = await getDonationById(Number(donationId));
        setDonation(data);

        const allRequests = await getRequests();
        const confirmed = allRequests.find(
          (req) =>
            req.donation_id === Number(donationId) &&
            req.request_status === "confirmed"
        );
        setConfirmedRequest(confirmed || null);
      } catch (err) {
        console.error(err);
        setError("Failed to load donation or request data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDonationAndRequest();
  }, [donationId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTimeLeftRoundedHours = (pickupTime: string) => {
    const now = new Date();
    const pickup = new Date(pickupTime);
    const diff = pickup.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const hoursLeft = Math.ceil(diff / (1000 * 60 * 60)); // Round up to nearest hour
    return `${hoursLeft} hour${hoursLeft > 1 ? "s" : ""} left`;
  };

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </SafeAreaView>
    );
  }

  if (!donation) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <Text style={{ color: theme.colors.textSecondary }}>{error}</Text>
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
        <Text style={styles.title}>Donation Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <Image
          source={{
            uri: donation.donation_picture || "https://via.placeholder.com/300",
          }}
          style={styles.image}
        />

        <Text style={styles.donationTitle}>{donation.title}</Text>

        <View style={styles.metaGrid}>
          <View style={styles.metaBox}>
            <Ionicons name="restaurant" size={20} color={theme.colors.accent} />
            <Text style={styles.metaText}>
              {donation.quantity_value} {donation.quantity_unit}
            </Text>
          </View>

          {donation.expiry_date && (
            <View style={styles.metaBox}>
              <Ionicons name="time" size={20} color={theme.colors.accent} />
              <Text style={styles.metaText}>
                {formatDate(donation.expiry_date)}
              </Text>
            </View>
          )}

          <View style={styles.metaBox}>
            <Ionicons name="location" size={20} color={theme.colors.accent} />
            <Text style={styles.metaText}>{donation.location}</Text>
          </View>

          {confirmedRequest && (
            <View style={styles.metaBox}>
              <Ionicons name="alarm" size={20} color={theme.colors.accent} />
              <Text style={styles.metaText}>
                {getTimeLeftRoundedHours(confirmedRequest.pickup_time)}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {donation.description || "No additional description provided."}
        </Text>

        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {donation.donation_status.charAt(0).toUpperCase() +
              donation.donation_status.slice(1)}
          </Text>
        </View>

        <Button
          title="Request Donation"
          onPress={() => navigation.navigate("RequestForm", { donation })}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 40,
  },
  scrollView: {
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
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
  image: {
    width: "100%",
    height: 250,
    borderRadius: 16,
    marginBottom: theme.spacing.xl,
  },
  donationTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xl,
    marginBottom: theme.spacing.md,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xl,
  },
  metaBox: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.sm,
    borderRadius: 12,
    marginBottom: theme.spacing.md,
  },
  metaText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    marginLeft: theme.spacing.xs,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.lg,
    marginBottom: theme.spacing.sm,
  },
  description: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 20,
    marginBottom: theme.spacing.xl,
  },
  statusText: {
    color: "#fff",
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.sm,
    textTransform: "capitalize",
  },
});

export default DonationDetailScreen;
