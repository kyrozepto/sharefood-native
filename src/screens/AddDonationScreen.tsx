"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../context/auth";
import { createDonation } from "../services/donation";
import type { RootNavigationProp } from "../navigation/types";
import { globalStyles, theme } from "../utils/theme";
import Button from "../components/Button";

const AddDonationScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const { user, token } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantityValue, setQuantityValue] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("kg");
  const [expiryDay, setExpiryDay] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("vegetables");
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    quantity: "",
    expiryDate: "",
    location: "",
    image: "",
  });

  const clearError = (field: keyof typeof errors) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const pickImage = async () => {
    Alert.alert("Add Photo", "Choose photo source", [
      {
        text: "Camera",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Permission Required", "Camera access needed.");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
          if (!result.canceled) {
            setImage(result.assets[0].uri);
            clearError("image");
          }
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Permission Required", "Gallery access needed.");
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
          if (!result.canceled) {
            setImage(result.assets[0].uri);
            clearError("image");
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSubmit = async () => {
    const newErrors = {
      title: "",
      description: "",
      quantity: "",
      expiryDate: "",
      location: "",
      image: "",
    };

    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!quantityValue.trim() || isNaN(Number(quantityValue)))
      newErrors.quantity = "Quantity must be a valid number";
    if (
      !expiryDay.trim() ||
      !expiryMonth.trim() ||
      !expiryYear.trim() ||
      isNaN(Number(expiryDay)) ||
      isNaN(Number(expiryMonth)) ||
      isNaN(Number(expiryYear))
    )
      newErrors.expiryDate = "Expiry date must be complete (DD-MM-YYYY)";
    if (!location.trim()) newErrors.location = "Location is required";
    if (!image) newErrors.image = "Please add a photo";

    setErrors(newErrors);
    if (Object.values(newErrors).some((e) => e)) return;

    if (!user || !token) {
      Alert.alert("Unauthorized", "Please login first.");
      return;
    }

    const formattedExpiry = `${expiryDay.padStart(
      2,
      "0"
    )}-${expiryMonth.padStart(2, "0")}-${expiryYear}`;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", user.user_id.toString());
      formData.append("title", title);
      formData.append("description", description);
      formData.append("quantity_value", quantityValue);
      formData.append("quantity_unit", quantityUnit);
      formData.append("location", location);
      formData.append("expiry_date", formattedExpiry);
      formData.append("category", category);

      if (image) {
        formData.append("donation_picture", {
          uri: image,
          name: "donation.jpg",
          type: "image/jpeg",
        } as any);
      }

      await createDonation(formData as any, token);
      Alert.alert("Success", "Donation created successfully!");
      navigation.goBack();
    } catch (err) {
      console.error("Donation error", err);
      Alert.alert("Error", "Failed to submit donation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Donation</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons
                name="camera"
                size={32}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.imagePlaceholderText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>
        {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}

        <TextInput
          style={[styles.input, errors.title && styles.inputError]}
          placeholder="Title"
          placeholderTextColor={theme.colors.textTertiary}
          value={title}
          onChangeText={(t) => {
            setTitle(t);
            clearError("title");
          }}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

        <TextInput
          style={[
            styles.input,
            styles.textArea,
            errors.description && styles.inputError,
          ]}
          placeholder="Description"
          placeholderTextColor={theme.colors.textTertiary}
          value={description}
          multiline
          onChangeText={(t) => {
            setDescription(t);
            clearError("description");
          }}
        />
        {errors.description && (
          <Text style={styles.errorText}>{errors.description}</Text>
        )}

        <View style={{ flexDirection: "row", gap: 10 }}>
          <TextInput
            style={[
              styles.input,
              { flex: 1 },
              errors.quantity && styles.inputError,
            ]}
            placeholder="Quantity Value"
            placeholderTextColor={theme.colors.textTertiary}
            keyboardType="numeric"
            value={quantityValue}
            onChangeText={(t) => {
              setQuantityValue(t);
              clearError("quantity");
            }}
          />
          <View
            style={[styles.pickerWrapper, errors.quantity && styles.inputError]}
          >
            <Picker
              selectedValue={quantityUnit}
              onValueChange={(item) => setQuantityUnit(item)}
              style={styles.picker}
            >
              <Picker.Item label="kg" value="kg" />
              <Picker.Item label="g" value="g" />
              <Picker.Item label="liter" value="liter" />
              <Picker.Item label="ml" value="ml" />
              <Picker.Item label="pcs" value="pcs" />
              <Picker.Item label="pack" value="pack" />
            </Picker>
          </View>
        </View>
        {errors.quantity && (
          <Text style={styles.errorText}>{errors.quantity}</Text>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Expiry Date:</Text>
          <View style={styles.expiryRow}>
            <TextInput
              style={[
                styles.input,
                styles.expiryInput,
                errors.expiryDate && styles.inputError,
              ]}
              placeholder="DD"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="numeric"
              maxLength={2}
              value={expiryDay}
              onChangeText={(t) => {
                setExpiryDay(t);
                clearError("expiryDate");
              }}
            />
            <TextInput
              style={[
                styles.input,
                styles.expiryInput,
                errors.expiryDate && styles.inputError,
              ]}
              placeholder="MM"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="numeric"
              maxLength={2}
              value={expiryMonth}
              onChangeText={(t) => {
                setExpiryMonth(t);
                clearError("expiryDate");
              }}
            />
            <TextInput
              style={[
                styles.input,
                styles.expiryInput,
                errors.expiryDate && styles.inputError,
              ]}
              placeholder="YYYY"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="numeric"
              maxLength={4}
              value={expiryYear}
              onChangeText={(t) => {
                setExpiryYear(t);
                clearError("expiryDate");
              }}
            />
          </View>
          {errors.expiryDate && (
            <Text style={styles.errorText}>{errors.expiryDate}</Text>
          )}
        </View>

        <TextInput
          style={[styles.input, errors.location && styles.inputError]}
          placeholder="Location"
          placeholderTextColor={theme.colors.textTertiary}
          value={location}
          onChangeText={(t) => {
            setLocation(t);
            clearError("location");
          }}
        />
        {errors.location && (
          <Text style={styles.errorText}>{errors.location}</Text>
        )}

        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Vegetables" value="vegetables" />
            <Picker.Item label="Fruits" value="fruits" />
            <Picker.Item label="Bakery" value="bakery" />
            <Picker.Item label="Dairy" value="dairy" />
            <Picker.Item label="Meat" value="meat" />
            <Picker.Item label="Non-Perishable" value="non-perishable" />
            <Picker.Item label="Prepared-Food" value="prepared-food" />
          </Picker>
        </View>

        <Button
          title={isLoading ? "Submitting..." : "Create Donation"}
          onPress={handleSubmit}
          disabled={isLoading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.md,
    backgroundColor: "#000",
  },
  backButton: {
    backgroundColor: theme.colors.backgroundSecondary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 100,
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
    marginTop: 8,
  },
  input: {
    backgroundColor: theme.colors.backgroundSecondary,
    color: theme.colors.textPrimary,
    padding: 14,
    marginVertical: 8,
    borderRadius: 30,
  },
  inputError: {
    borderColor: theme.colors.error,
    borderWidth: 1,
  },
  errorText: {
    color: theme.colors.error,
    marginLeft: 10,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  pickerWrapper: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 30,
    justifyContent: "center",
    marginVertical: 8,
    flex: 1,
  },
  picker: {
    height: 50,
    color: theme.colors.textPrimary,
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
    marginLeft: 10,
  },
  expiryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  expiryInput: {
    flex: 1,
    textAlign: "center",
    color: theme.colors.textPrimary,
  },
});

export default AddDonationScreen;
