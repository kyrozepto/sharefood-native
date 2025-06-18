"use client";

import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/auth";
import type { RootNavigationProp } from "../navigation/types";
import { globalStyles, theme } from "../utils/theme";
import Button from "../components/Button";
import { Donation } from "../interfaces/donationInterface";
import { RequestItem } from "../interfaces/requestInterface";
import { getDonations } from "../services/donation";
import { getRequests } from "../services/request";
import { getNotificationsByUserId } from "../services/notification";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "available":
      return "#4caf50";
    case "confirmed":
      return "#2196f3";
    case "completed":
      return "#9e9e9e";
    case "canceled":
      return "#f44336";
    default:
      return theme.colors.textSecondary;
  }
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const { user, token } = useAuth();
  const userRole = user?.user_type || "recipient";

  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [donationCount, setDonationCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [impactQuantity, setImpactQuantity] = useState(0);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const capitalize = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (!user || !token) {
          setLoading(false);
          return;
        }

        setLoading(true);
        try {
          const userId = user.user_id;

          const [donationList, requestList, notifications] = await Promise.all([
            getDonations(),
            getRequests(),
            getNotificationsByUserId(userId, token),
          ]);

          const unread = notifications.filter((n) => !n.is_read);
          setUnreadCount(unread.length);

          const userDonations = donationList.filter(
            (donation) => Number(donation.user_id) === Number(userId)
          );

          const otherUserDonations = donationList.filter(
            (donation) =>
              Number(donation.user_id) !== Number(userId) &&
              donation.donation_status.toLowerCase() === "available"
          );

          if (userRole === "donor") {
            const sorted = userDonations.sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );
            setRecentDonations(sorted.slice(0, 3));
          } else {
            const sorted = otherUserDonations.sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );
            setRecentDonations(sorted.slice(0, 3));
          }

          const userRequests = requestList.filter(
            (request) => Number(request.user_id) === Number(userId)
          );

          setDonationCount(userDonations.length);
          setRequestCount(userRequests.length);

          const completed = userDonations.filter(
            (donation) => donation.donation_status === "completed"
          );
          const totalImpact = completed.reduce((sum, d) => {
            const value =
              typeof d.quantity_value === "number"
                ? d.quantity_value
                : parseFloat(d.quantity_value ?? "0");
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          setImpactQuantity(totalImpact);

          setRequests(requestList);
        } catch (error) {
          console.error("Fetch error:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [user, token])
  );

  const calculateTimeLeft = (pickupTime: string): string => {
    const now = new Date();
    const pickup = new Date(pickupTime);
    const diffMs = pickup.getTime() - now.getTime();
    if (diffMs <= 0) return "Expired";
    const hours = Math.floor(diffMs / 1000 / 60 / 60);
    const minutes = Math.floor((diffMs / 1000 / 60) % 60);
    return `${hours}h ${minutes}m left`;
  };

  const renderDonorStats = () => (
    <View style={styles.section}>
      <Image
        source={require("../../assets/images/home-donation.jpg")}
        style={styles.donorImage}
      />
      <View style={styles.actionContainer}>
        <Text style={[styles.sectionTitle, { marginBottom: theme.spacing.lg }]}>
          Your Donation Stats
        </Text>
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate("DonationList")}
          >
            <Ionicons name="restaurant" size={24} color={theme.colors.accent} />
            <Text style={styles.statValue}>{donationCount}</Text>
            <Text style={styles.statLabel}>Donations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate("Main", { screen: "Donations" })}
          >
            <Ionicons name="people" size={24} color={theme.colors.accent} />
            <Text style={styles.statValue}>{requestCount}</Text>
            <Text style={styles.statLabel}>Requests</Text>
          </TouchableOpacity>

          <View style={styles.statCard}>
            <Ionicons name="leaf" size={24} color={theme.colors.accent} />
            <Text style={styles.statValue}>
              {(impactQuantity ?? 0).toFixed(1)} kg
            </Text>
            <Text style={styles.statLabel}>Impact</Text>
          </View>
        </View>

        <Button
          title="Add New Donation"
          onPress={() => navigation.navigate("AddDonation")}
        />
        <Button
          style={{ backgroundColor: theme.colors.accent, borderWidth: 2 }}
          title="Check Activity"
          onPress={() => navigation.navigate("Main", { screen: "Donations" })}
        />
      </View>
    </View>
  );

  const renderRecipientActions = () => (
    <View style={styles.section}>
      <Image
        source={require("../../assets/images/home-donation.jpg")}
        style={styles.donorImage}
      />
      <View style={styles.actionContainer}>
        <Text style={[styles.sectionTitle, { marginBottom: theme.spacing.lg }]}>
          Find Donations Near You
        </Text>
        <Button
          title="Search Donations"
          onPress={() => navigation.navigate("DonationList")}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.user_name}!</Text>
          <Text style={styles.subtitle}>
            {userRole === "donor"
              ? "Ready to share some food?"
              : "Looking for food donations?"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate("Notifications")}
        >
          <Ionicons
            name="notifications"
            size={24}
            color={theme.colors.textPrimary}
          />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={[globalStyles.container, styles.scrollContent]}>
        {userRole === "donor" ? renderDonorStats() : renderRecipientActions()}

        <View style={[styles.section, { paddingBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {userRole === "donor"
                ? "Your Recent Donations"
                : "Available Donations"}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("DonationList")}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <Text style={{ color: theme.colors.textSecondary }}>
              Loading...
            </Text>
          ) : recentDonations.length === 0 ? (
            <Text style={{ color: theme.colors.textSecondary }}>
              No recent donations.
            </Text>
          ) : (
            recentDonations.map((donation) => {
              const status = donation.donation_status.toLowerCase();
              const displayStatus = capitalize(status);
              const matchedRequest = requests.find(
                (r) =>
                  r.donation_id === donation.donation_id &&
                  r.request_status.toLowerCase() === "confirmed"
              );

              return (
                <TouchableOpacity
                  key={donation.donation_id}
                  style={styles.donationCard}
                  onPress={() =>
                    navigation.navigate("DonationDetail", {
                      donationId: donation.donation_id.toString(),
                    })
                  }
                >
                  <Image
                    source={{
                      uri:
                        donation.donation_picture ||
                        "https://via.placeholder.com/100",
                    }}
                    style={styles.donationImage}
                  />
                  <View style={styles.donationInfo}>
                    <Text style={styles.donationTitle}>
                      {donation.title || "Untitled"}
                    </Text>
                    <Text style={styles.donationQuantity}>
                      {donation.quantity_value || 0}{" "}
                      {donation.quantity_unit || ""}
                    </Text>
                    <View style={styles.donationMeta}>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(status) },
                        ]}
                      >
                        <Text style={styles.statusText}>{displayStatus}</Text>
                      </View>

                      {status === "confirmed" &&
                        matchedRequest?.pickup_time && (
                          <View style={styles.metaItem}>
                            <Ionicons
                              name="time"
                              size={16}
                              color={theme.colors.textSecondary}
                            />
                            <Text style={styles.metaText}>
                              {calculateTimeLeft(matchedRequest.pickup_time)}
                            </Text>
                          </View>
                        )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    paddingVertical: theme.spacing.md,
    backgroundColor: "#000000",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  scrollContent: {
    paddingTop: 100,
  },
  greeting: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xl,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xs,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    alignItems: "center",
  },
  statValue: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xl,
    marginVertical: theme.spacing.xs,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.sm - 1,
  },
  actionContainer: {
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.lg,
  },
  seeAllText: {
    color: theme.colors.accent,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
  },
  donationCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    marginBottom: theme.spacing.md,
    overflow: "hidden",
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
    marginBottom: theme.spacing.xs,
  },
  donationQuantity: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.sm,
    marginBottom: theme.spacing.sm,
  },
  donationMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  donorImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    marginBottom: theme.spacing.md,
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
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "red",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default HomeScreen;
