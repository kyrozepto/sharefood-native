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
import { getRequests } from "../services/request";
import type { Donation } from "../interfaces/donationInterface";
import type { RequestItem } from "../interfaces/requestInterface";

type TabType = "requests" | "pickups" | "history";

interface RequestWithDonation extends RequestItem {
  donation?: Donation;
  donationUser?: {
    user_name: string;
    email?: string;
  };
}

const RequestActivityScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("requests");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [userRequests, setUserRequests] = useState<RequestWithDonation[]>([]);
  const [allDonations, setAllDonations] = useState<Donation[]>([]);

  const loadData = async () => {
    if (!user || !token) return;

    try {
      const [requests, donations] = await Promise.all([
        getRequests(),
        getDonations(),
      ]);

      // Filter requests by current user
      const filteredRequests = requests.filter(
        (request) => request.user_id === user.user_id
      ) as RequestWithDonation[];

      // Attach donation data to each request
      for (const request of filteredRequests) {
        const donation = donations.find(
          (d) => d.donation_id === request.donation_id
        );

        if (donation) {
          request.donation = donation;

          // Get donation owner's user data
          try {
            const donationOwner = await getUserById(donation.user_id, token);
            request.donationUser = {
              user_name: donationOwner.user_name,
              email: donationOwner.email,
            };
          } catch (err) {
            console.error(
              "Failed to get donation owner for donation",
              donation.donation_id,
              err
            );
          }
        }
      }

      setUserRequests(filteredRequests);
      setAllDonations(donations);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load request activity");
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "#FFA500"; // Orange color for waiting
      case "approved":
        return theme.colors.accent;
      case "confirmed":
        return "#4CAF50"; // Green color for confirmed
      case "completed":
        return "#2196F3"; // Blue color for completed
      case "rejected":
        return theme.colors.error;
      case "cancelled":
        return "#9E9E9E"; // Gray color for cancelled
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
        const waitingRequests = userRequests.filter(
          (request) => request.request_status === "waiting"
        );

        return (
          <View style={styles.content}>
            {waitingRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No pending requests</Text>
              </View>
            ) : (
              waitingRequests.map((request) => (
                <TouchableOpacity
                  key={request.request_id}
                  style={styles.requestCard}
                  onPress={() =>
                    navigation.navigate("PickupDetail", {
                      requestId: request.request_id.toString(),
                    })
                  }
                >
                  <Image
                    source={{
                      uri:
                        request.donation?.donation_picture ||
                        "https://via.placeholder.com/100",
                    }}
                    style={styles.donationImage}
                  />
                  <View style={styles.requestInfo}>
                    <Text style={styles.donationTitle}>
                      {request.donation?.title || "Untitled"}
                    </Text>
                    <Text style={styles.donationQuantity}>
                      Requested: {request.requested_quantity}
                    </Text>

                    <View style={styles.requestMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="person"
                          size={16}
                          color={theme.colors.textSecondary}
                        />
                        <Text style={styles.metaText}>
                          From: {request.donationUser?.user_name || "Unknown"}
                        </Text>
                      </View>

                      <View style={styles.metaItem}>
                        <Ionicons
                          name="time"
                          size={16}
                          color={theme.colors.textSecondary}
                        />
                        <Text style={styles.metaText}>
                          Pickup: {request.pickup_time}
                        </Text>
                      </View>

                      <View style={styles.metaItem}>
                        <Ionicons
                          name="location"
                          size={16}
                          color={theme.colors.textSecondary}
                        />
                        <Text style={styles.metaText}>
                          {request.donation?.location}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.requestBottomMeta}>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: getStatusColor(
                              request.request_status
                            ),
                          },
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {getDisplayStatus(request.request_status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        );

      case "pickups":
        const confirmedRequests = userRequests.filter(
          (request) => request.request_status === "approved"
        );

        return (
          <View style={styles.content}>
            {confirmedRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No confirmed pickups</Text>
              </View>
            ) : (
              confirmedRequests.map((request) => (
                <TouchableOpacity
                  key={request.request_id}
                  style={styles.requestCard}
                  onPress={() =>
                    navigation.navigate("PickupDetail", {
                      requestId: request.request_id.toString(),
                    })
                  }
                >
                  <Image
                    source={{
                      uri:
                        request.donation?.donation_picture ||
                        "https://via.placeholder.com/100",
                    }}
                    style={styles.donationImage}
                  />
                  <View style={styles.requestInfo}>
                    <Text style={styles.donationTitle}>
                      {request.donation?.title || "Untitled"}
                    </Text>
                    <Text style={styles.donationQuantity}>
                      Picking up: {request.requested_quantity}
                    </Text>

                    <View style={styles.pickupInfo}>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="person"
                          size={16}
                          color={theme.colors.textSecondary}
                        />
                        <Text style={styles.metaText}>
                          From: {request.donationUser?.user_name || "Unknown"}
                        </Text>
                      </View>

                      <View style={styles.metaItem}>
                        <Ionicons
                          name="time"
                          size={16}
                          color={theme.colors.accent}
                        />
                        <Text
                          style={[
                            styles.metaText,
                            { color: theme.colors.accent },
                          ]}
                        >
                          {calculateTimeLeft(request.pickup_time)}
                        </Text>
                      </View>

                      <View style={styles.metaItem}>
                        <Ionicons
                          name="location"
                          size={16}
                          color={theme.colors.textSecondary}
                        />
                        <Text style={styles.metaText}>
                          {request.donation?.location}
                        </Text>
                      </View>

                      {request.note && (
                        <View style={styles.metaItem}>
                          <Ionicons
                            name="document-text"
                            size={16}
                            color={theme.colors.textSecondary}
                          />
                          <Text style={styles.metaText}>
                            Note: {request.note}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.requestBottomMeta}>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: getStatusColor(
                              request.request_status
                            ),
                          },
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {getDisplayStatus(request.request_status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        );

      case "history":
        const historyRequests = userRequests
          .filter(
            (request) =>
              request.request_status === "completed" ||
              request.request_status === "rejected"
          )
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );

        return (
          <View style={styles.content}>
            {historyRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No request history</Text>
              </View>
            ) : (
              historyRequests.map((request) => (
                <TouchableOpacity
                  key={request.request_id}
                  style={styles.requestCard}
                  onPress={() =>
                    navigation.navigate("PickupDetail", {
                      requestId: request.request_id.toString(),
                    })
                  }
                >
                  <Image
                    source={{
                      uri:
                        request.donation?.donation_picture ||
                        "https://via.placeholder.com/100",
                    }}
                    style={styles.donationImage}
                  />
                  <View style={styles.requestInfo}>
                    <Text style={styles.donationTitle}>
                      {request.donation?.title || "Untitled"}
                    </Text>

                    <View style={styles.requestMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="person"
                          size={16}
                          color={theme.colors.textSecondary}
                        />
                        <Text style={styles.metaText}>
                          From: {request.donationUser?.user_name || "Unknown"}
                        </Text>
                      </View>

                      <View style={styles.metaItem}>
                        <Ionicons
                          name="calendar"
                          size={16}
                          color={theme.colors.textSecondary}
                        />
                        <Text style={styles.metaText}>
                          {new Date(request.created_at).toLocaleDateString()}
                        </Text>
                      </View>

                      {request.note && (
                        <View style={styles.metaItem}>
                          <Ionicons
                            name="document-text"
                            size={16}
                            color={theme.colors.textSecondary}
                          />
                          <Text style={styles.metaText}>
                            Note: {request.note}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.requestBottomMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name={
                            request.request_status === "completed"
                              ? "checkmark-circle"
                              : "close-circle"
                          }
                          size={16}
                          color={
                            request.request_status === "completed"
                              ? "#4CAF50"
                              : theme.colors.error
                          }
                        />
                        <Text
                          style={[
                            styles.metaText,
                            {
                              color:
                                request.request_status === "completed"
                                  ? "#4CAF50"
                                  : theme.colors.error,
                            },
                          ]}
                        >
                          {request.request_status === "completed"
                            ? "Completed"
                            : "Rejected"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Request Activity</Text>
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
  requestCard: {
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
  requestInfo: {
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
  requestMeta: {
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  requestBottomMeta: {
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

export default RequestActivityScreen;
