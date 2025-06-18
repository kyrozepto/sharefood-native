import React from "react";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { RootNavigationProp } from "../navigation/types";
import { globalStyles, theme } from "../utils/theme";
import Button from "../components/Button";
import { useAuth } from "../context/auth";
import { getDonations } from "../services/donation";
import { getUserById } from "../services/user";
import { getRequests, updateRequest } from "../services/request";
import type { DonationWithRequests } from "../interfaces/donationInterface";
import type { RequestItem } from "../interfaces/requestInterface";
import type { RequestItemWithUser } from "../interfaces/requestInterface";

type TabType = "requests" | "pickups" | "history";

const DonationActivityScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("requests");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [userDonations, setUserDonations] = useState<DonationWithRequests[]>(
    []
  );
  const [allRequests, setAllRequests] = useState<RequestItem[]>([]);

  const loadData = async () => {
    if (!user || !token) return;

    try {
      const [donations, requests] = await Promise.all([
        getDonations(),
        getRequests(),
      ]);

      const filteredDonations = donations.filter(
        (donation) => donation.user_id === user.user_id
      ) as DonationWithRequests[];

      for (const donation of filteredDonations) {
        donation.requests = requests.filter(
          (req: RequestItem) => req.donation_id === donation.donation_id
        );

        const matched = donation.requests.find(
          (req) =>
            req.request_status === "approved" ||
            req.request_status === "confirmed"
        );

        if (matched) {
          donation.matchedRequest = matched;

          // ✅ Get actual user data for the requester - Fixed: Added token parameter
          try {
            const userData = await getUserById(matched.user_id, token);
            matched.user = userData;
          } catch (err) {
            console.error(
              "Failed to get user for request",
              matched.user_id,
              err
            );
          }
        }
      }

      setUserDonations(filteredDonations);
      setAllRequests(requests);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load donation activity");
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [user, token])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRequest = async (
    requestId: number,
    action: "approved" | "rejected"
  ) => {
    if (!token) return;

    setIsLoading(true);
    try {
      await updateRequest(requestId, { request_status: action }, token);
      await loadData(); // Refresh data
      Alert.alert("Success", `Request ${action} successfully`);
    } catch (error) {
      console.error("Error updating request:", error);
      Alert.alert("Error", `Failed to ${action.toLowerCase()} request`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return theme.colors.accent;
      case "confirmed":
        return "#FFA500"; // Orange color for confirmed
      case "completed":
        return "#4CAF50"; // Green color for completed
      case "cancelled":
        return theme.colors.error;
      case "waiting":
        return "#9E9E9E"; // Gray color for waiting
      default:
        return theme.colors.textSecondary;
    }
  };

  const getDisplayStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const calculateTimeLeft = (pickupTime: string) => {
    const now = new Date();

    // Combine today's date with the pickup time
    const [hours, minutes, seconds] = pickupTime.split(":").map(Number);
    const pickup = new Date(now);
    pickup.setHours(hours, minutes, seconds || 0, 0);

    const diffInMs = pickup.getTime() - now.getTime();
    const diffInMinutes = Math.ceil(diffInMs / (1000 * 60));

    if (diffInMinutes < 0) return "Overdue";
    if (diffInMinutes < 60) return `${diffInMinutes} min left`;
    const hoursLeft = Math.floor(diffInMinutes / 60);
    return `${hoursLeft} hour${hoursLeft > 1 ? "s" : ""} left`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "requests":
        const myAvailableDonations = userDonations.filter(
          (donation) =>
            donation.donation_status === "available" &&
            donation.user_id === user?.user_id
        );

        return (
          <View style={styles.content}>
            {myAvailableDonations.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  You have no available donations
                </Text>
              </View>
            ) : (
              myAvailableDonations.map((donation) => {
                const hasRequest = donation.requests.some(
                  (req) =>
                    req.request_status === "waiting" ||
                    req.request_status === "pending"
                );

                const CardContent = (
                  <>
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
                            {
                              backgroundColor: getStatusColor(
                                donation.donation_status
                              ),
                            },
                          ]}
                        >
                          <Text style={styles.statusText}>
                            {getDisplayStatus(donation.donation_status)}
                          </Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Ionicons
                            name="people"
                            size={16}
                            color={theme.colors.textSecondary}
                          />
                          <Text style={styles.metaText}>
                            {
                              donation.requests.filter(
                                (req) =>
                                  req.request_status === "waiting" ||
                                  req.request_status === "pending"
                              ).length
                            }{" "}
                            requests
                          </Text>
                        </View>
                      </View>
                    </View>
                  </>
                );

                return hasRequest ? (
                  <TouchableOpacity
                    key={donation.donation_id}
                    style={styles.donationCard}
                    onPress={() =>
                      navigation.navigate("DonationRequests", {
                        donationId: donation.donation_id.toString(),
                      })
                    }
                  >
                    {CardContent}
                  </TouchableOpacity>
                ) : (
                  <View
                    key={donation.donation_id}
                    style={[styles.donationCard, { opacity: 0.6 }]}
                  >
                    {CardContent}
                  </View>
                );
              })
            )}
          </View>
        );

      case "pickups":
        const confirmedDonations = userDonations.filter(
          (donation) =>
            donation.donation_status === "confirmed" && donation.matchedRequest
        );

        return (
          <View style={styles.content}>
            {confirmedDonations.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No scheduled pickups</Text>
              </View>
            ) : (
              confirmedDonations.map((donation) => {
                const matchedRequest =
                  donation.matchedRequest as RequestItemWithUser;

                // Fixed: Added null check for user
                const requesterUser = matchedRequest?.user;

                return (
                  <TouchableOpacity
                    key={donation.donation_id}
                    style={styles.donationCard}
                    onPress={() =>
                      navigation.navigate("PickupDetail", {
                        requestId: matchedRequest.request_id.toString(),
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

                      <View style={styles.pickupInfo}>
                        <View style={styles.metaItem}>
                          <Ionicons
                            name="person"
                            size={16}
                            color={theme.colors.textSecondary}
                          />
                          <Text style={styles.metaText}>
                            {requesterUser?.user_name || "Unknown User"}
                          </Text>
                        </View>

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

                        <View style={styles.metaItem}>
                          <Ionicons
                            name="location"
                            size={16}
                            color={theme.colors.textSecondary}
                          />
                          <Text style={styles.metaText}>
                            {donation.location}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.donationMeta}>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: getStatusColor(
                                donation.donation_status
                              ),
                            },
                          ]}
                        >
                          <Text style={styles.statusText}>
                            {getDisplayStatus(donation.donation_status)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        );

      case "history":
        const completedDonations = userDonations.filter(
          (donation) => donation.donation_status === "completed"
        );

        return (
          <View style={styles.content}>
            {completedDonations.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No completed donations</Text>
              </View>
            ) : (
              completedDonations.map((donation) => {
                const completedRequest = donation.requests.find(
                  (req) => req.request_status === "completed"
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

                      {/* Fixed: Use the user data that was already fetched and stored in matched request */}
                      {completedRequest?.user && (
                        <View style={styles.metaItem}>
                          <Ionicons
                            name="person"
                            size={16}
                            color={theme.colors.textSecondary}
                          />
                          <Text style={styles.metaText}>
                            Received by {completedRequest.user.user_name}
                          </Text>
                        </View>
                      )}

                      <View style={styles.donationMeta}>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: getStatusColor(
                                donation.donation_status
                              ),
                            },
                          ]}
                        >
                          <Text style={styles.statusText}>
                            {getDisplayStatus(donation.donation_status)}
                          </Text>
                        </View>

                        <View style={styles.metaItem}>
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color="#4CAF50"
                          />
                          <Text style={styles.metaText}>Completed</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Donation Activity</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "requests" && styles.activeTab]}
          onPress={() => setActiveTab("requests")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "requests" && styles.activeTabText,
            ]}
          >
            Requests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "pickups" && styles.activeTab]}
          onPress={() => setActiveTab("pickups")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "pickups" && styles.activeTabText,
            ]}
          >
            Pickups
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.activeTab]}
          onPress={() => setActiveTab("history")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "history" && styles.activeTabText,
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderTabContent()}
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
    paddingVertical: theme.spacing.md,
    paddingTop: theme.spacing.xxxl,
    backgroundColor: theme.colors.background,
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xl,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.backgroundSecondary,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.accent,
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
  },
  activeTabText: {
    color: theme.colors.accent,
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
  },
  donationCard: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: "row",
  },
  donationImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: theme.spacing.md,
  },
  donationInfo: {
    flex: 1,
    justifyContent: "space-between",
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
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.xs,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  metaText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.xs,
  },
  pickupInfo: {
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
});

export default DonationActivityScreen;
