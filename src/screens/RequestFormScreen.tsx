"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  Modal,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { RootNavigationProp, RootRouteProp } from "../navigation/types";
import { globalStyles, theme } from "../utils/theme";
import Button from "../components/Button";
import { useAuth } from "../context/auth";
import { createRequest, getRequests } from "../services/request";

const timeSlots = [
  { id: "09:00:00", label: "09:00" },
  { id: "10:00:00", label: "10:00" },
  { id: "11:00:00", label: "11:00" },
  { id: "13:00:00", label: "13:00" },
  { id: "14:00:00", label: "14:00" },
  { id: "15:00:00", label: "15:00" },
  { id: "16:00:00", label: "16:00" },
  { id: "17:00:00", label: "17:00" },
];

interface FormErrors {
  timeSlot?: string;
  agreement?: string;
}

interface ExistingRequest {
  request_id: number;
  donation_id: number;
  user_id: number;
  request_status: "waiting" | "confirmed" | "canceled" | "completed";
  pickup_time: string;
  note?: string;
  created_at: string;
}

// ✅ Date formatting function
const formatDateIndo = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

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
  const locationName = `Lokasi Pengambilan (${lat.toFixed(4)}, ${lng.toFixed(
    4
  )})`;

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
        #map { height: 120px; width: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
          dragging: false,
          tap: false,
          touchZoom: false
        }).setView([${lat}, ${lng}], ${zoom});
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: ''
        }).addTo(map);
        
        L.marker([${lat}, ${lng}]).addTo(map);
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
        <Text style={styles.locationTitle}>Lokasi Pengambilan</Text>
      </View>

      <Text style={styles.locationName}>{locationName}</Text>

      {/* Mini Map with OpenStreetMap */}
      <View style={styles.miniMapContainer}>
        <WebView
          source={{ html: mapHtml }}
          style={styles.webViewMap}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>

      <View style={styles.mapInfo}>
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={theme.colors.textTertiary}
        />
        <Text style={styles.mapInfoText}>
          Pastikan Anda mengetahui lokasi ini sebelum mengambil donasi
        </Text>
      </View>
    </View>
  );
};

const RequestFormScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<RootRouteProp<"RequestForm">>();
  const { donation } = route.params;
  const { user, token } = useAuth();

  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [existingRequest, setExistingRequest] =
    useState<ExistingRequest | null>(null);
  const [checkingRequest, setCheckingRequest] = useState(true);

  // Check if user already has a request for this donation
  const checkExistingRequest = async () => {
    if (!user || !token) return;

    try {
      setCheckingRequest(true);
      // Get all requests and filter for current user and donation
      const allRequests = await getRequests();
      const foundRequest = allRequests.find(
        (req: any) =>
          req.user_id === user.user_id &&
          req.donation_id === donation.donation_id
      );
      setExistingRequest(foundRequest as ExistingRequest);
    } catch (error) {
      console.error("Error checking existing request:", error);
    } finally {
      setCheckingRequest(false);
    }
  };

  useEffect(() => {
    checkExistingRequest();
  }, [user, token, donation.donation_id]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!selectedTimeSlot) {
      newErrors.timeSlot = "Silakan pilih waktu pengambilan.";
    }
    if (!isAgreed) {
      newErrors.agreement =
        "Anda harus menyetujui persyaratan terlebih dahulu.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (!existingRequest) {
      validateForm();
    }
  }, [selectedTimeSlot, isAgreed, existingRequest]);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!user || !token) {
      Alert.alert("Error", "Anda harus login terlebih dahulu");
      return;
    }

    setIsLoading(true);

    try {
      const requestData = {
        donation_id: donation.donation_id,
        user_id: user.user_id,
        pickup_time: selectedTimeSlot,
        note: notes || "",
      };

      await createRequest(requestData, token);
      setShowSuccessModal(true);
      // Refresh the request status after successful submission
      await checkExistingRequest();
    } catch (error) {
      console.error("Error creating request:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Gagal mengirim permintaan"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!existingRequest || !token) return;

    Alert.alert(
      "Batalkan Permintaan",
      "Apakah Anda yakin ingin membatalkan permintaan ini?",
      [
        {
          text: "Tidak",
          style: "cancel",
        },
        {
          text: "Ya, Batalkan",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              // Use updateRequest to change status to 'canceled'
              const { updateRequest } = await import("../services/request");
              await updateRequest(
                existingRequest.request_id,
                { request_status: "canceled" },
                token
              );
              Alert.alert("Berhasil", "Permintaan berhasil dibatalkan");
              await checkExistingRequest();
            } catch (error) {
              console.error("Error canceling request:", error);
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Gagal membatalkan permintaan"
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSuccess = () => {
    setShowSuccessModal(false);
    navigation.navigate("Main", { screen: "Home" });
  };

  const getRequestStatusInfo = () => {
    if (!existingRequest) return null;

    const statusConfig = {
      waiting: {
        title: "Menunggu Konfirmasi",
        message: "Permintaan Anda sedang menunggu konfirmasi dari pendonor",
        icon: "time-outline" as const,
        color: theme.colors.error || "#FF9500",
      },
      confirmed: {
        title: "Permintaan Dikonfirmasi",
        message:
          "Permintaan Anda telah dikonfirmasi. Silakan ambil donasi sesuai waktu yang dijadwalkan",
        icon: "checkmark-circle-outline" as const,
        color: theme.colors.accent || "#34C759",
      },
      canceled: {
        title: "Permintaan Dibatalkan",
        message: "Permintaan Anda telah dibatalkan",
        icon: "close-circle-outline" as const,
        color: theme.colors.error || "#FF3B30",
      },
      completed: {
        title: "Donasi Selesai",
        message: "Donasi telah berhasil diambil dan permintaan telah selesai.",
        icon: "checkmark-done-outline" as const,
        color: theme.colors.textPrimary || "#4CD964",
      },
    };

    return statusConfig[existingRequest.request_status] || null;
  };

  const renderActionButton = () => {
    if (checkingRequest) {
      return (
        <Button
          title="Memeriksa Status..."
          onPress={() => {}}
          disabled={true}
        />
      );
    }

    if (!existingRequest) {
      const isSubmitDisabled = Object.keys(errors).length > 0 || isLoading;
      return (
        <Button
          title={isLoading ? "Mengirim..." : "Kirim Permintaan"}
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
        />
      );
    }

    const statusInfo = getRequestStatusInfo();
    if (!statusInfo) return null;

    return (
      <View style={styles.statusButtonContainer}>
        {existingRequest.request_status === "waiting" && (
          <>
            <View
              style={[
                styles.statusButton,
                { backgroundColor: statusInfo.color + "20" },
              ]}
            >
              <Ionicons
                name={statusInfo.icon}
                size={20}
                color={statusInfo.color}
              />
              <Text
                style={[styles.statusButtonText, { color: statusInfo.color }]}
              >
                Menunggu Konfirmasi
              </Text>
            </View>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelRequest}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>
                {isLoading ? "Membatalkan..." : "Batalkan Permintaan"}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {existingRequest.request_status === "confirmed" && (
          <>
            <View
              style={[
                styles.statusButton,
                { backgroundColor: statusInfo.color + "20" },
              ]}
            >
              <Ionicons
                name={statusInfo.icon}
                size={20}
                color={statusInfo.color}
              />
              <Text
                style={[styles.statusButtonText, { color: statusInfo.color }]}
              >
                Dikonfirmasi
              </Text>
            </View>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelRequest}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>
                {isLoading ? "Membatalkan..." : "Batalkan Permintaan"}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {existingRequest.request_status === "canceled" && (
          <View
            style={[
              styles.statusButton,
              { backgroundColor: statusInfo.color + "20" },
            ]}
          >
            <Ionicons
              name={statusInfo.icon}
              size={20}
              color={statusInfo.color}
            />
            <Text
              style={[styles.statusButtonText, { color: statusInfo.color }]}
            >
              Dibatalkan
            </Text>
          </View>
        )}
      </View>
    );
  };

  const isFormDisabled = !!existingRequest;

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={[globalStyles.container, styles.container]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Formulir Permintaan</Text>
          <View style={{ alignContent: "center" }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Ringkasan Donasi</Text>
            <Image
              source={{ uri: donation.donation_picture }}
              style={styles.donationImage}
            />
            <Text style={styles.donationTitle}>{donation.title}</Text>
            <Text style={styles.donationDetail}>
              Jumlah: {donation.quantity_value} {donation.quantity_unit}
            </Text>
            <Text style={styles.donationDetail}>
              Kadaluarsa: {formatDateIndo(donation.expiry_date)}
            </Text>

            {/* Updated Location Section with Mini Map */}
            <LocationMap location={donation.location} />

            <View style={styles.pickupInfo}>
              <Ionicons
                name="walk-outline"
                size={20}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.pickupInfoText}>
                Hanya untuk Pengambilan Sendiri (Self-Pickup)
              </Text>
            </View>
          </View>

          {/* Show existing request status if exists */}
          {existingRequest && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Status Permintaan Anda</Text>
              {(() => {
                const statusInfo = getRequestStatusInfo();
                if (!statusInfo) return null;
                return (
                  <View style={styles.requestStatusContainer}>
                    <View style={styles.requestStatusHeader}>
                      <Ionicons
                        name={statusInfo.icon}
                        size={24}
                        color={statusInfo.color}
                      />
                      <Text
                        style={[
                          styles.requestStatusTitle,
                          { color: statusInfo.color },
                        ]}
                      >
                        {statusInfo.title}
                      </Text>
                    </View>
                    <Text style={styles.requestStatusMessage}>
                      {statusInfo.message}
                    </Text>
                    <View style={styles.requestDetails}>
                      <Text style={styles.requestDetailLabel}>
                        Waktu Pengambilan:
                      </Text>
                      <Text style={styles.requestDetailValue}>
                        {timeSlots.find(
                          (slot) => slot.id === existingRequest.pickup_time
                        )?.label || existingRequest.pickup_time}
                      </Text>
                      {existingRequest.note && (
                        <>
                          <Text style={styles.requestDetailLabel}>
                            Catatan:
                          </Text>
                          <Text style={styles.requestDetailValue}>
                            {existingRequest.note}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                );
              })()}
            </View>
          )}

          {/* Only show form if no existing request */}
          {!existingRequest && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Detail Permintaan Anda</Text>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Waktu Pengambilan</Text>
                <View style={styles.timeSlotsContainer}>
                  {timeSlots.map((slot) => (
                    <TouchableOpacity
                      key={slot.id}
                      style={[
                        styles.timeSlot,
                        selectedTimeSlot === slot.id && styles.timeSlotSelected,
                      ]}
                      onPress={() => setSelectedTimeSlot(slot.id)}
                      disabled={isLoading || isFormDisabled}
                    >
                      <Text
                        style={[
                          styles.timeSlotText,
                          selectedTimeSlot === slot.id &&
                            styles.timeSlotTextSelected,
                        ]}
                      >
                        {slot.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.timeSlot && (
                  <Text style={styles.errorText}>{errors.timeSlot}</Text>
                )}
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Catatan (Opsional)</Text>
                <TextInput
                  style={styles.notesInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Mis: Saya akan datang sedikit terlambat."
                  placeholderTextColor={theme.colors.textTertiary}
                  multiline
                  editable={!isLoading && !isFormDisabled}
                />
              </View>
            </View>
          )}

          {!existingRequest && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.agreementContainer}
                onPress={() => setIsAgreed(!isAgreed)}
                disabled={isLoading || isFormDisabled}
              >
                <View
                  style={[styles.checkbox, isAgreed && styles.checkboxChecked]}
                >
                  {isAgreed && (
                    <Ionicons name="checkmark" size={16} color={"#FFFFFF"} />
                  )}
                </View>
                <Text style={styles.agreementText}>
                  Saya mengerti dan setuju dengan syarat dan ketentuan
                  pengambilan donasi.
                </Text>
              </TouchableOpacity>
              {errors.agreement && (
                <Text style={styles.errorText}>{errors.agreement}</Text>
              )}
            </View>
          )}

          {renderActionButton()}
        </ScrollView>

        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
          onRequestClose={handleSuccess}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Ionicons
                name="checkmark-circle"
                size={64}
                color={theme.colors.accent}
                style={styles.successIcon}
              />
              <Text style={styles.modalTitle}>Permintaan Berhasil!</Text>
              <Text style={styles.modalText}>
                Permintaan donasi Anda telah berhasil dikirim. Silakan tunggu
                konfirmasi dari pendonor.
              </Text>
              <Button title="Kembali" onPress={handleSuccess} />
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: theme.spacing.md,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xl,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.lg,
    marginBottom: theme.spacing.md,
  },
  donationImage: {
    width: "100%",
    height: 180,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  donationTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.lg,
    marginBottom: theme.spacing.xs,
  },
  donationDetail: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    marginBottom: theme.spacing.xs,
    lineHeight: 22,
  },
  // ✅ New Location Map Styles
  locationMapContainer: {
    marginVertical: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
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
  miniMapContainer: {
    height: 120,
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
  pickupInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: theme.borderRadius.sm,
  },
  pickupInfoText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.sm,
  },
  // ✅ Request Status Styles
  requestStatusContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  requestStatusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  requestStatusTitle: {
    marginLeft: theme.spacing.sm,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.lg,
  },
  requestStatusMessage: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  requestDetails: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    paddingTop: theme.spacing.md,
  },
  requestDetailLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.sm,
    marginTop: theme.spacing.sm,
  },
  requestDetailValue: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    marginTop: theme.spacing.xs,
  },
  // ✅ Status Button Styles
  statusButtonContainer: {
    gap: theme.spacing.md,
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  statusButtonText: {
    marginLeft: theme.spacing.sm,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.md,
  },
  cancelButton: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.error || "#FF3B30",
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    alignItems: "center",
  },
  cancelButtonText: {
    color: theme.colors.error || "#FF3B30",
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
  },
  fieldContainer: {
    marginBottom: theme.spacing.lg,
  },
  fieldLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.sm,
    marginTop: theme.spacing.sm,
    paddingLeft: theme.spacing.xs,
  },
  timeSlotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  timeSlot: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    borderColor: theme.colors.textTertiary,
    minWidth: 80,
    alignItems: "center",
  },
  timeSlotSelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  timeSlotText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.medium,
  },
  timeSlotTextSelected: {
    color: "#FFFFFF",
  },
  notesInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    textAlignVertical: "top",
    minHeight: 100,
    borderWidth: 1,
    borderColor: theme.colors.textTertiary,
  },
  agreementContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.textSecondary,
    marginRight: theme.spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  agreementText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.sm,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: "90%",
    alignItems: "center",
  },
  successIcon: {
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xl,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  modalText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
});

export default RequestFormScreen;
