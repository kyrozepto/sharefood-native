"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles, theme } from "../utils/theme";
import type { RootNavigationProp } from "../navigation/types";
import { getUserById } from "../services/user";
import { getDonations } from "../services/donation";
import { getRatingsByDonorId } from "../services/rating";
import { useAuth } from "../context/auth";

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const { user, token, logout } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    description: "",
  });
  const [donationStats, setDonationStats] = useState<{
    count: number;
    totalQuantity: number;
    impactKg: number;
  }>({ count: 0, totalQuantity: 0, impactKg: 0 });
  const [averageRating, setAverageRating] = useState<number | null>(null);

  // Check if user is a donor (modify this condition based on your user role logic)
  const isDonor = userData?.user_type === "donor";
  // Alternative approaches if you use different field names:
  // const isDonor = userData?.account_type === 'donor';
  // const isDonor = userData?.is_donor === true;
  // const isDonor = user?.user_type === 'donor';

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          if (user?.user_id && token) {
            const userInfo = await getUserById(user.user_id, token);
            setUserData(userInfo);

            // Only fetch donation stats if user is a donor
            if (userInfo?.user_type === "donor") {
              const allDonations = await getDonations();
              const userDonations = allDonations.filter(
                (donation) => donation.user_id === user.user_id
              );

              let totalQuantity = 0;
              let impactKg = 0;

              for (const donation of userDonations) {
                const qty = parseFloat(
                  donation.quantity_value?.toString() || "0"
                );
                if (!isNaN(qty)) {
                  totalQuantity += qty;
                  if (
                    donation.quantity_unit === "kg" &&
                    donation.donation_status === "completed"
                  ) {
                    impactKg += qty;
                  }
                }
              }

              const completedDonationsCount = userDonations.filter(
                (donation) => donation.donation_status === "completed"
              ).length;

              setDonationStats({
                count: completedDonationsCount,
                totalQuantity,
                impactKg,
              });

              const donorRatings = await getRatingsByDonorId(
                user.user_id,
                token
              );
              const validRatings = donorRatings.filter(
                (r) => !isNaN(parseFloat(r.rate as any))
              );

              const totalScore = validRatings.reduce(
                (sum, r) => sum + parseFloat(r.rate as any),
                0
              );

              const avg =
                validRatings.length > 0
                  ? totalScore / validRatings.length
                  : null;

              setAverageRating(avg);
            }
          }
        } catch (error) {
          console.error("Error loading profile data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [user?.user_id, token])
  );

  const handleLogout = () => {
    logout();
    navigation.reset({ index: 0, routes: [{ name: "Auth" }] });
  };

  const handleOpenModal = (title: string, description: string) => {
    setModalContent({ title, description });
    setModalVisible(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.centeredView}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{modalContent.title}</Text>
            <Text style={styles.modalText}>{modalContent.description}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Awesome!</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={globalStyles.container}>
        <Text style={globalStyles.sectionHeader}>Your Profile</Text>

        <View style={styles.profileImageContainer}>
          <Image
            source={
              userData?.profile_picture
                ? { uri: userData.profile_picture }
                : require("../../assets/images/profile_picture.jpg")
            }
            style={styles.profileImage}
          />
        </View>

        <Text style={styles.username}>{userData?.user_name}</Text>
        <Text style={styles.email}>{userData?.email}</Text>

        {/* Only show donation stats for donors */}
        {isDonor && (
          <View style={styles.followSection}>
            <TouchableOpacity
              style={styles.followBox}
              activeOpacity={0.7}
              onPress={() =>
                handleOpenModal(
                  "Donations",
                  `You've donated food ${donationStats.count} times!`
                )
              }
            >
              <Text style={styles.followCount}>{donationStats.count}</Text>
              <Text style={styles.followLabel}>Donations</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.followBox}
              activeOpacity={0.7}
              onPress={() =>
                handleOpenModal(
                  "Impact",
                  `You've helped prevent ${donationStats.impactKg}kg of food waste!`
                )
              }
            >
              <Text style={styles.followCount}>{donationStats.impactKg}kg</Text>
              <Text style={styles.followLabel}>Impact</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.followBox}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("ReviewList")}
            >
              <Text style={styles.followCount}>
                {averageRating !== null ? averageRating.toFixed(1) : "0.0"}
              </Text>
              <Text style={styles.followLabel}>Rating</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={[globalStyles.title, styles.settingsTitle]}>Settings</Text>

        <View style={styles.settingsBox}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate("AccountSettings")}
          >
            <Text style={styles.settingLabel}>Account</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate("FAQ")}
          >
            <Text style={styles.settingLabel}>FAQ</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate("About")}
          >
            <Text style={styles.settingLabel}>About App</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
            <Text style={[styles.settingLabel, styles.logoutText]}>Logout</Text>
            <Ionicons
              name="log-out-outline"
              size={20}
              color={theme.colors.error}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  profileImageContainer: {
    alignItems: "center",
    marginVertical: theme.spacing.lg,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  username: {
    fontSize: theme.font.size.xl,
    fontFamily: theme.font.family.bold,
    color: theme.colors.textPrimary,
    textAlign: "center",
    marginTop: theme.spacing.sm,
  },
  email: {
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  followSection: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 50,
    marginVertical: theme.spacing.lg,
  },
  followBox: {
    alignItems: "center",
  },
  followCount: {
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.bold,
    color: theme.colors.textPrimary,
  },
  followLabel: {
    fontSize: theme.font.size.sm,
    color: theme.colors.textSecondary,
  },
  settingsTitle: {
    marginBottom: theme.spacing.sm,
  },
  settingsBox: {
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadow.sm,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
  },
  settingLabel: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.medium,
    color: theme.colors.textPrimary,
  },
  logoutText: {
    color: theme.colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.textTertiary,
    opacity: 0.3,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalView: {
    width: "90%",
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: "center",
    ...theme.shadow.sm,
  },
  modalTitle: {
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  modalText: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  modalButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.round,
  },
  modalButtonText: {
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.md,
    color: theme.colors.textPrimary,
  },
});

export default ProfileScreen;
