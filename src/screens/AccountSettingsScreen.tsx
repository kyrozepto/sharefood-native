"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Modal,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import type { RootNavigationProp } from "../navigation/types";
import { globalStyles, theme } from "../utils/theme";
import { useAuth } from "../context/auth";
import { getUserById, updateUser } from "../services/user";
import type { User } from "../interfaces/userInterface";

const AccountSettingsScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const { user, token } = useAuth();

  const [userData, setUserData] = useState<User | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageChanged, setProfileImageChanged] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "********",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  useEffect(() => {
    if (user?.user_id && token) {
      getUserById(user.user_id, token)
        .then((data) => {
          setUserData(data);
          setProfileImage(data.profile_picture || null);
          setFormData({
            name: data.user_name || "",
            email: data.email || "",
            phone: data.phone || "",
            password: "********",
          });
        })
        .catch((err) => {
          Alert.alert("Error", "Failed to load profile data.");
        });
    }
  }, [user, token]);

  const handleChangeProfilePicture = async () => {
    Alert.alert("Change Profile Picture", "Choose photo source", [
      {
        text: "Camera",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Permission Required", "Camera access denied");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          });
          if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
            setProfileImageChanged(true);
            setIsEditing(true);
            Alert.alert("Success", "Profile picture updated!");
          }
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Permission Required", "Gallery access denied");
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          });
          if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
            setProfileImageChanged(true);
            setIsEditing(true);
            Alert.alert("Success", "Profile picture updated!");
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSave = () => {
    setShowConfirmationModal(true);
  };

  const confirmSave = async () => {
    if (!user?.user_id || !token) {
      Alert.alert("Error", "User is not authenticated.");
      return;
    }

    try {
      const form = new FormData();
      form.append("user_name", formData.name);
      form.append("email", formData.email);
      form.append("phone", formData.phone);

      if (formData.password !== "********") {
        form.append("password", formData.password);
      }

      if (profileImage && profileImageChanged) {
        const filename = profileImage.split("/").pop()!;
        const match = /\.(\w+)$/.exec(filename);
        const ext = match ? match[1] : "jpg";

        form.append("profile_picture", {
          uri: profileImage,
          name: filename,
          type: `image/${ext}`,
        } as any);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      await updateUser(user.user_id, form, token);

      setIsEditing(false);
      setShowConfirmationModal(false);
      setProfileImageChanged(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      const err = error as Error;
      Alert.alert("Update Failed", err.message);
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={globalStyles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={globalStyles.sectionHeader}>Account Settings</Text>
        </View>

        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          <Image
            source={
              profileImage
                ? { uri: profileImage }
                : require("../../assets/images/profile_picture.jpg")
            }
            style={styles.profileImage}
          />
          <TouchableOpacity
            style={styles.editImageButton}
            onPress={handleChangeProfilePicture}
          >
            <Ionicons
              name="camera"
              size={20}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {["name", "email", "phone", "password"].map((field, i) => (
            <View style={styles.inputGroup} key={i}>
              <Text style={styles.label}>
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </Text>
              <TextInput
                style={styles.input}
                value={formData[field as keyof typeof formData]}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, [field]: text }))
                }
                editable={isEditing}
                secureTextEntry={field === "password"}
                keyboardType={
                  field === "email"
                    ? "email-address"
                    : field === "phone"
                    ? "phone-pad"
                    : "default"
                }
              />
            </View>
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsEditing(false)}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Modal */}
        <Modal
          visible={showConfirmationModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowConfirmationModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirm Changes</Text>
              <Text style={styles.modalText}>
                Are you sure you want to save these changes?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={confirmSave}
                >
                  <Text style={styles.modalButtonText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelModalButton]}
                  onPress={() => setShowConfirmationModal(false)}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      styles.cancelModalButtonText,
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  profileImageContainer: {
    alignItems: "center",
    marginVertical: theme.spacing.lg,
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    backgroundColor: theme.colors.accent,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.medium,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.round,
    padding: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
  },
  buttonContainer: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  button: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.round,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: theme.colors.accent,
  },
  saveButton: {
    backgroundColor: theme.colors.accent,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  buttonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.medium,
  },
  cancelButtonText: {
    color: theme.colors.accent,
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
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: theme.font.size.xl,
    fontFamily: theme.font.family.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  modalText: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: theme.colors.accent,
  },
  cancelModalButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  modalButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.medium,
  },
  cancelModalButtonText: {
    color: theme.colors.accent,
  },
});

export default AccountSettingsScreen;
