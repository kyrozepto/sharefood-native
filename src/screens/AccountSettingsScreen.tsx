"use client"

import React, { useState } from "react"
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
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import type { RootNavigationProp } from "../navigation/types"
import { globalStyles, theme } from "../utils/theme"

const AccountSettingsScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>()
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [formData, setFormData] = useState({
    name: "Bahiskara",
    email: "user@example.com",
    phone: "+1234567890",
    password: "********",
  })
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    setShowConfirmationModal(true)
  }

  const confirmSave = () => {
    // Here you would typically update the user data in your backend
    setIsEditing(false)
    setShowConfirmationModal(false)
    Alert.alert("Success", "Profile updated successfully!")
  }

  const handleChangeProfilePicture = async () => {
    Alert.alert(
      "Change Profile Picture",
      "Choose photo source",
      [
        {
          text: "Camera",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync()
            if (status !== "granted") {
              Alert.alert("Permission Required", "Please grant camera permission to take photos")
              return
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 1,
            })
            if (!result.canceled) {
              // Here you would typically upload the image to your backend
              // For now, we'll just show a success message
              Alert.alert("Success", "Profile picture updated successfully!")
            }
          },
        },
        {
          text: "Gallery",
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
            if (status !== "granted") {
              Alert.alert("Permission Required", "Please grant gallery permission to select photos")
              return
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 1,
            })
            if (!result.canceled) {
              // Here you would typically upload the image to your backend
              // For now, we'll just show a success message
              Alert.alert("Success", "Profile picture updated successfully!")
            }
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    )
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={globalStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={globalStyles.sectionHeader}>Account Settings</Text>
        </View>

        {/* Profile Picture */}
        <View style={styles.profileImageContainer}>
          <Image source={require("../../assets/images/profile_image.jpg")} style={styles.profileImage} />
          <TouchableOpacity style={styles.editImageButton} onPress={handleChangeProfilePicture} activeOpacity={0.7}>
            <Ionicons name="camera" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              editable={isEditing}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              editable={isEditing}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              editable={isEditing}
              secureTextEntry
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {isEditing ? (
            <>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsEditing(false)}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => setIsEditing(true)}>
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Confirmation Modal */}
        <Modal
          visible={showConfirmationModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowConfirmationModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirm Changes</Text>
              <Text style={styles.modalText}>Are you sure you want to save these changes?</Text>
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
                  <Text style={[styles.modalButtonText, styles.cancelModalButtonText]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  )
}

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
})

export default AccountSettingsScreen 