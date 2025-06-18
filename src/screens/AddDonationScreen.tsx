"use client";

import React, { useState, useEffect } from "react";
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
  Platform,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { useAuth } from "../context/auth";
import { createDonation } from "../services/donation";
import type { RootNavigationProp } from "../navigation/types";
import { globalStyles, theme } from "../utils/theme";
import Button from "../components/Button";

interface LocationSuggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

const AddDonationScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute();
  const { user, token } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantityValue, setQuantityValue] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("kg");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedLocation, setSelectedLocation] =
    useState<LocationSuggestion | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [category, setCategory] = useState("vegetables");
  const [image, setImage] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  // Debounce function for location search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (locationQuery.trim() && locationQuery.length > 2) {
        searchLocations(locationQuery);
      } else {
        setLocationSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [locationQuery]);

  const searchLocations = async (query: string) => {
    setLoadingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5&addressdetails=1&countrycodes=id`,
        {
          method: "GET",
          headers: {
            "User-Agent": "FoodDonationApp/1.0",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      let data: LocationSuggestion[];

      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("JSON parse error:", parseError, "Response:", text);
        throw new Error("Invalid response format");
      }

      setLocationSuggestions(data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Location search error:", error);
      Alert.alert("Error", "Failed to search locations. Please try again.");
      setLocationSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoadingLocation(false);
    }
  };

  const selectLocation = (location: LocationSuggestion) => {
    setSelectedLocation(location);
    setLocationQuery(location.display_name);
    setShowSuggestions(false);
    clearError("location");
    Keyboard.dismiss();
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to get your current location."
        );
        return;
      }

      setLoadingLocation(true);
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLocation.coords.latitude}&lon=${currentLocation.coords.longitude}&addressdetails=1&countrycodes=id`,
        {
          method: "GET",
          headers: {
            "User-Agent": "FoodDonationApp/1.0",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("JSON parse error:", parseError, "Response:", text);
        // Fallback: create location data with coordinates only
        data = {
          place_id: "current_location",
          display_name: `${currentLocation.coords.latitude.toFixed(
            6
          )}, ${currentLocation.coords.longitude.toFixed(6)}`,
          lat: currentLocation.coords.latitude.toString(),
          lon: currentLocation.coords.longitude.toString(),
          type: "current_location",
          importance: 1,
        };
      }

      if (data && (data.display_name || data.lat)) {
        const locationData: LocationSuggestion = {
          place_id: data.place_id || "current_location",
          display_name:
            data.display_name ||
            `${currentLocation.coords.latitude.toFixed(
              6
            )}, ${currentLocation.coords.longitude.toFixed(6)}`,
          lat: data.lat || currentLocation.coords.latitude.toString(),
          lon: data.lon || currentLocation.coords.longitude.toString(),
          type: "current_location",
          importance: 1,
        };
        selectLocation(locationData);
      } else {
        throw new Error("Invalid location data received");
      }
    } catch (error) {
      console.error("Current location error:", error);
      Alert.alert(
        "Error",
        "Failed to get current location. Please search manually or try again."
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  // Removed auto-location filling - users can manually choose to use current location

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

  const onChangeDate = (_: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setExpiryDate(selectedDate);
      clearError("expiryDate");
    }
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
    if (!expiryDate) newErrors.expiryDate = "Please select an expiry date.";
    if (!selectedLocation) newErrors.location = "Please select a location";
    if (!image) newErrors.image = "Please add a photo";

    setErrors(newErrors);
    if (Object.values(newErrors).some((e) => e)) return;

    if (!user || !token) {
      Alert.alert("Unauthorized", "Please login first.");
      return;
    }

    const formattedExpiry = expiryDate
      ? `${expiryDate.getDate().toString().padStart(2, "0")}-${(
          expiryDate.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${expiryDate.getFullYear()}`
      : "";

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", user.user_id.toString());
      formData.append("title", title);
      formData.append("description", description);
      formData.append("quantity_value", quantityValue);
      formData.append("quantity_unit", quantityUnit);
      formData.append(
        "location",
        `${selectedLocation!.lat},${selectedLocation!.lon}`
      );
      formData.append("location_name", selectedLocation!.display_name);
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
      navigation.navigate("Main", { screen: "Home" });
    } catch (err) {
      console.error("Donation error", err);
      Alert.alert("Error", "Failed to submit donation.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderLocationSuggestion = (
    item: LocationSuggestion,
    index: number
  ) => (
    <TouchableOpacity
      key={item.place_id}
      style={styles.suggestionItem}
      onPress={() => selectLocation(item)}
    >
      <Ionicons
        name="location-outline"
        size={20}
        color={theme.colors.textPrimary}
        style={styles.suggestionIcon}
      />
      <Text style={styles.suggestionText} numberOfLines={2}>
        {item.display_name}
      </Text>
    </TouchableOpacity>
  );

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
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
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
            </Picker>
          </View>
        </View>
        {errors.quantity && (
          <Text style={styles.errorText}>{errors.quantity}</Text>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Expiry Date:</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={[styles.input, errors.expiryDate && styles.inputError]}
          >
            <Text
              style={{
                color: expiryDate
                  ? theme.colors.textPrimary
                  : theme.colors.textTertiary,
              }}
            >
              {expiryDate ? expiryDate.toDateString() : "Select Expiry Date"}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={expiryDate || new Date()}
              mode="date"
              display="default"
              onChange={onChangeDate}
              minimumDate={new Date()}
            />
          )}
          {errors.expiryDate && (
            <Text style={styles.errorText}>{errors.expiryDate}</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.locationHeader}>
            <Text style={styles.label}>Location:</Text>
            <TouchableOpacity
              onPress={getCurrentLocation}
              style={styles.currentLocationButton}
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.textPrimary}
                />
              ) : (
                <Ionicons
                  name="location"
                  size={16}
                  color={theme.colors.textPrimary}
                />
              )}
              <Text style={styles.currentLocationText}>Use Current</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.locationInputContainer}>
            <TextInput
              style={[
                styles.input,
                styles.locationInput,
                errors.location && styles.inputError,
                selectedLocation && styles.inputWithSelection, // Add this line
              ]}
              placeholder={
                selectedLocation
                  ? selectedLocation.display_name
                  : "Search for location..."
              }
              placeholderTextColor={
                selectedLocation
                  ? theme.colors.textPrimary
                  : theme.colors.textTertiary
              }
              value={selectedLocation ? "" : locationQuery} // Show empty when location is selected
              onChangeText={(text) => {
                setLocationQuery(text);
                if (!text.trim()) {
                  setSelectedLocation(null);
                  setShowSuggestions(false);
                }
                clearError("location");
              }}
              onFocus={() => {
                // Clear selection when user wants to search again
                if (selectedLocation) {
                  setSelectedLocation(null);
                  setLocationQuery("");
                }
                if (locationSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
            />

            {/* Show selected location icon inside input */}
            {selectedLocation && (
              <View style={styles.selectedLocationIndicator}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.accent}
                />
              </View>
            )}

            {loadingLocation && locationQuery && !selectedLocation && (
              <View style={styles.loadingIndicator}>
                <ActivityIndicator
                  size="small"
                  color={theme.colors.textPrimary}
                />
              </View>
            )}
          </View>

          {showSuggestions &&
            locationSuggestions.length > 0 &&
            !selectedLocation && (
              <View style={styles.suggestionsContainer}>
                <ScrollView
                  style={styles.suggestionsList}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled={false}
                  showsVerticalScrollIndicator={true}
                >
                  {locationSuggestions.map((item, index) =>
                    renderLocationSuggestion(item, index)
                  )}
                </ScrollView>
              </View>
            )}

          {errors.location && (
            <Text style={styles.errorText}>{errors.location}</Text>
          )}
        </View>

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
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 20,
  },
  currentLocationText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
  locationInputContainer: {
    position: "relative",
  },
  locationInput: {
    paddingRight: 40,
  },
  loadingIndicator: {
    position: "absolute",
    right: 15,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  suggestionsContainer: {
    marginTop: 4,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    maxHeight: 200,
    overflow: "hidden",
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gradientEnd,
  },
  suggestionIcon: {
    marginRight: 10,
  },
  suggestionText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    flex: 1,
  },
  selectedLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 8,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 8,
  },
  selectedLocationText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  inputWithSelection: {
    color: theme.colors.textPrimary,
    fontWeight: "500",
  },
  selectedLocationIndicator: {
    position: "absolute",
    right: 15,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
});

export default AddDonationScreen;
