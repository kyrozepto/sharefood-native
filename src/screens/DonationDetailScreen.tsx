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
import { WebView } from "react-native-webview";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import type { RootNavigationProp, RootRouteProp } from "../navigation/types";
import { globalStyles, theme } from "../utils/theme";
import Button from "../components/Button";
import { getDonationById, updateDonation } from "../services/donation";
import { getRequests } from "../services/request";
import type { Donation } from "../interfaces/donationInterface";
import type { RequestItem } from "../interfaces/requestInterface";
import { useAuth } from "../context/auth";

// ✅ Location Map Component
interface LocationMapProps {
  location: string; // Location string in format "lat,lng"
}

const LocationMap: React.FC<LocationMapProps> = ({ location }) => {
  // Parse coordinates from location string
  const parseCoordinates = (locationStr: string) => {
    try {
      const coords = locationStr.split(",");
      if (coords.length === 2) {
        const lat = parseFloat(coords[0].trim());
        const lng = parseFloat(coords[1].trim());
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    } catch (error) {
      console.log("Error parsing coordinates:", error);
    }
    // Default to Jakarta coordinates if parsing fails
    return { lat: -6.2088, lng: 106.8456 };
  };

  const { lat, lng } = parseCoordinates(location);
  const zoom = 15;

  // Generate a readable location name (you might want to use reverse geocoding for real names)
  const locationName = `Lokasi Donasi (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

  // Create OpenStreetMap HTML for WebView
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 150px; width: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          boxZoom: true,
          keyboard: true,
          dragging: true,
          tap: true,
          touchZoom: true
        }).setView([${lat}, ${lng}], ${zoom});
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        L.marker([${lat}, ${lng}]).addTo(map)
          .bindPopup('Lokasi Donasi')
          .openPopup();
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.locationMapContainer}>
      <View style={styles.locationHeader}>
        <Ionicons
          name="location-outline"
          size={20}
          color={theme.colors.accent}
        />
        <Text style={styles.locationTitle}>Lokasi Donasi</Text>
      </View>

      <Text style={styles.locationName}>{locationName}</Text>

      {/* Interactive Map with OpenStreetMap */}
      <View style={styles.mapContainer}>
        <WebView
          source={{ html: mapHtml }}
          style={styles.webViewMap}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
        />
      </View>

      <View style={styles.mapInfo}>
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={theme.colors.textTertiary}
        />
        <Text style={styles.mapInfoText}>
          Hanya untuk Pengambilan Sendiri (Self-Pickup)
        </Text>
      </View>
    </View>
  );
};

const DonationDetailScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<RootRouteProp<"DonationDetail">>();
  const { donationId } = route.params;

  // Get current user info from auth context
  const { user, token } = useAuth();

  const [donation, setDonation] = useState<Donation | null>(null);
  const [confirmedRequest, setConfirmedRequest] = useState<RequestItem | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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

  const handleCancelDonation = async () => {
    if (!donation || !token) return;

    Alert.alert(
      "Cancel Donation",
      "Are you sure you want to cancel this donation?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            setUpdating(true);
            try {
              await updateDonation(
                donation.donation_id,
                { donation_status: "canceled" },
                token
              );

              // Update local state
              setDonation((prev) =>
                prev ? { ...prev, donation_status: "canceled" } : null
              );

              Alert.alert("Success", "Donation has been canceled.");
            } catch (err) {
              console.error(err);
              Alert.alert(
                "Error",
                "Failed to cancel donation. Please try again."
              );
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const isUserTheDonor = () => {
    return donation && user && donation.user_id === user.user_id;
  };

  const shouldShowButton = () => {
    if (!donation || !user) return false;

    if (isUserTheDonor()) {
      // Donor viewing their own donation — show cancel button if still available
      return donation.donation_status === "available";
    } else {
      // If current user is a donor, they should not request from others
      if (user.user_type === "donor") return false;

      // Only show request button to non-donor users
      return donation.donation_status === "available";
    }
  };

  const renderActionButton = () => {
    if (!shouldShowButton() || !donation) return null;

    if (isUserTheDonor()) {
      // User is the donor - show cancel button
      return (
        <Button
          title={updating ? "Canceling..." : "Cancel Donation"}
          onPress={handleCancelDonation}
          disabled={updating}
          style={styles.cancelButton}
        />
      );
    } else {
      // User is not the donor - show request button
      return (
        <Button
          title="Request Donation"
          onPress={() => navigation.navigate("RequestForm", { donation })}
        />
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!donation) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
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

          {confirmedRequest && (
            <View style={styles.metaBox}>
              <Ionicons name="alarm" size={20} color={theme.colors.accent} />
              <Text style={styles.metaText}>
                {getTimeLeftRoundedHours(confirmedRequest.pickup_time)}
              </Text>
            </View>
          )}
        </View>

        {/* ✅ Location Map Section */}
        <LocationMap location={donation.location} />

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {donation.description || "No additional description provided."}
        </Text>

        <Text style={styles.sectionTitle}>Status</Text>
        <View
          style={[
            styles.statusBadge,
            donation.donation_status === "canceled" &&
              styles.statusBadgeCanceled,
            donation.donation_status === "completed" &&
              styles.statusBadgeCompleted,
          ]}
        >
          <Text style={styles.statusText}>
            {donation.donation_status.charAt(0).toUpperCase() +
              donation.donation_status.slice(1)}
          </Text>
        </View>

        {isUserTheDonor() && (
          <View style={styles.donorNote}>
            <Ionicons
              name="information-circle"
              size={16}
              color={theme.colors.accent}
            />
            <Text style={styles.donorNoteText}>
              You are the donor of this item
            </Text>
          </View>
        )}

        {renderActionButton()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.textSecondary,
    textAlign: "center",
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
  locationMapContainer: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  locationTitle: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.md,
  },
  locationName: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  mapContainer: {
    height: 150,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  webViewMap: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
  },
  mapInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: theme.borderRadius.sm,
  },
  mapInfoText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.textTertiary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.xs,
    flex: 1,
    lineHeight: 16,
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
  statusBadgeCanceled: {
    backgroundColor: "#ff6b6b",
  },
  statusBadgeCompleted: {
    backgroundColor: "#51cf66",
  },
  statusText: {
    color: "#fff",
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.sm,
    textTransform: "capitalize",
  },
  donorNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.sm,
    borderRadius: 8,
    marginBottom: theme.spacing.lg,
  },
  donorNoteText: {
    color: theme.colors.accent,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.sm,
    marginLeft: theme.spacing.xs,
  },
  cancelButton: {
    backgroundColor: "#ff6b6b",
  },
});

export default DonationDetailScreen;
