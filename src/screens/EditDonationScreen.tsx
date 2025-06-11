"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, Alert } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import type { RootNavigationProp, RootRouteProp } from "../navigation/types"
import { globalStyles, theme } from "../utils/theme"
import Button from "../components/Button"

// Mock data - replace with actual data from your backend
const mockDonation = {
  id: "1",
  title: "Fresh Vegetables",
  description: "A variety of fresh vegetables including carrots, potatoes, and onions. All vegetables are in good condition and were purchased yesterday.",
  quantity: "5kg",
  expiryTime: "2 hours",
  location: "123 Main St, City",
  image: "https://images.pexels.com/photos/3872406/pexels-photo-3872406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
}

const EditDonationScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>()
  const route = useRoute<RootRouteProp<"EditDonation">>()
  const [title, setTitle] = useState(mockDonation.title)
  const [description, setDescription] = useState(mockDonation.description)
  const [quantity, setQuantity] = useState(mockDonation.quantity)
  const [expiryTime, setExpiryTime] = useState(mockDonation.expiryTime)
  const [location, setLocation] = useState(mockDonation.location)
  const [image, setImage] = useState<string | null>(mockDonation.image)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    quantity: "",
    expiryTime: "",
    location: "",
    image: "",
  })

  const pickImage = async () => {
    Alert.alert(
      "Change Photo",
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
              aspect: [4, 3],
              quality: 1,
            })
            if (!result.canceled) {
              setImage(result.assets[0].uri)
              clearError("image")
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
              aspect: [4, 3],
              quality: 1,
            })
            if (!result.canceled) {
              setImage(result.assets[0].uri)
              clearError("image")
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

  const handleSubmit = async () => {
    const newErrors = {
      title: "",
      description: "",
      quantity: "",
      expiryTime: "",
      location: "",
      image: "",
    }

    if (!title.trim()) {
      newErrors.title = "Title is required"
    }
    if (!description.trim()) {
      newErrors.description = "Description is required"
    }
    if (!quantity.trim()) {
      newErrors.quantity = "Quantity is required"
    }
    if (!expiryTime.trim()) {
      newErrors.expiryTime = "Expiry time is required"
    }
    if (!location.trim()) {
      newErrors.location = "Location is required"
    }
    if (!image) {
      newErrors.image = "Please add a photo"
    }

    setErrors(newErrors)
    if (Object.values(newErrors).some(error => error)) return

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      navigation.goBack()
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        title: "Failed to update donation"
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = (field: keyof typeof errors) => {
    setErrors(prev => ({ ...prev, [field]: "" }))
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Donation</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView 
        style={[globalStyles.container]}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={pickImage}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={32} color={theme.colors.textSecondary} />
              <Text style={styles.imagePlaceholderText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>
        {errors.image ? <Text style={styles.errorText}>{errors.image}</Text> : null}

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.title ? styles.inputError : null]}
            placeholder="Food Title"
            placeholderTextColor={theme.colors.textTertiary}
            value={title}
            onChangeText={(value) => {
              setTitle(value)
              clearError("title")
            }}
            accessibilityLabel="Food title input"
          />
          {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, styles.textArea, errors.description ? styles.inputError : null]}
            placeholder="Description"
            placeholderTextColor={theme.colors.textTertiary}
            value={description}
            onChangeText={(value) => {
              setDescription(value)
              clearError("description")
            }}
            multiline
            textAlignVertical="top"
            accessibilityLabel="Description input"
          />
          {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.quantity ? styles.inputError : null]}
            placeholder="Quantity (e.g., 5kg, 10 pieces)"
            placeholderTextColor={theme.colors.textTertiary}
            value={quantity}
            onChangeText={(value) => {
              setQuantity(value)
              clearError("quantity")
            }}
            accessibilityLabel="Quantity input"
          />
          {errors.quantity ? <Text style={styles.errorText}>{errors.quantity}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.expiryTime ? styles.inputError : null]}
            placeholder="Expiry Time (e.g., 2 hours, 1 day)"
            placeholderTextColor={theme.colors.textTertiary}
            value={expiryTime}
            onChangeText={(value) => {
              setExpiryTime(value)
              clearError("expiryTime")
            }}
            accessibilityLabel="Expiry time input"
          />
          {errors.expiryTime ? <Text style={styles.errorText}>{errors.expiryTime}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.location ? styles.inputError : null]}
            placeholder="Location"
            placeholderTextColor={theme.colors.textTertiary}
            value={location}
            onChangeText={(value) => {
              setLocation(value)
              clearError("location")
            }}
            accessibilityLabel="Location input"
          />
          {errors.location ? <Text style={styles.errorText}>{errors.location}</Text> : null}
        </View>

        <Button 
          title={isLoading ? "Updating..." : "Update Donation"} 
          onPress={handleSubmit} 
          disabled={isLoading}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

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
    paddingTop: 60,
    paddingBottom: theme.spacing.xxxl,
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
  imageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    marginBottom: theme.spacing.md,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
    marginTop: theme.spacing.sm,
  },
  inputContainer: {
    width: "100%",
    marginBottom: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.backgroundSecondary,
    color: theme.colors.textPrimary,
    padding: theme.spacing.md,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    width: "100%",
    borderRadius: 30,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: theme.spacing.md,
  },
  inputError: {
    borderColor: theme.colors.error,
    borderWidth: 1,
  },
  errorText: {
    color: theme.colors.error,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.sm,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.md,
  },
})

export default EditDonationScreen 