"use client";

import React, { useEffect, useState } from "react";
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
import { useAuth } from "../context/auth";

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const { user, token, logout } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Initialize to true
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    description: "",
  });

  useFocusEffect(
    React.useCallback(() => {
      const fetchUserData = async () => {
        if (user?.user_id && token) {
          try {
            const data = await getUserById(user.user_id, token);
            setUserData(data);
          } catch (error) {
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      };

      fetchUserData();
      return () => {};
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

        <View style={styles.followSection}>
          <TouchableOpacity
            style={styles.followBox}
            activeOpacity={0.7}
            onPress={() =>
              handleOpenModal("Donations", "You’ve donated food 120 times!")
            }
          >
            <Text style={styles.followCount}>120</Text>
            <Text style={styles.followLabel}>Donations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.followBox}
            activeOpacity={0.7}
            onPress={() =>
              handleOpenModal(
                "Impact",
                "You’ve helped prevent 85kg of food waste!"
              )
            }
          >
            <Text style={styles.followCount}>85kg</Text>
            <Text style={styles.followLabel}>Impact</Text>
          </TouchableOpacity>
        </View>

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
    gap: 100,
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
