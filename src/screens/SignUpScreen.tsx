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
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { RootStackParamList } from "../navigation/types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { globalStyles, theme } from "../utils/theme";
import Button from "../components/Button";
import { registerUser } from "../services/auth";
import { useAuth } from "../context/auth";

type UserRole = "donor" | "receiver";

const SignUpScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const handleSignUp = async () => {
    const newErrors = {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "",
    };

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Please enter a valid email";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (!confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!role) newErrors.role = "Please select a role";

    setErrors(newErrors);
    if (Object.values(newErrors).some((error) => error)) return;

    setIsLoading(true);
    try {
      console.log("[SignUp] Sending request to registerUser with:", {
        user_name: name,
        email,
        phone,
        password,
        user_type: role,
      });
      await registerUser({
        user_name: name,
        email,
        phone,
        password,
        user_type: role!,
      });

      await login(email, password);

      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    } catch (error) {
      const err = error as Error;
      Alert.alert("Registration Failed", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (field: keyof typeof errors) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

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
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Join ShareFood</Text>
          <Text style={styles.subtitle}>
            Help reduce food waste and make a difference
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              placeholder="Full Name"
              placeholderTextColor={theme.colors.textTertiary}
              value={name}
              onChangeText={(value) => {
                setName(value);
                clearError("name");
              }}
              autoCapitalize="words"
              accessibilityLabel="Name input"
            />
            {errors.name ? (
              <Text style={styles.errorText}>{errors.name}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="Email"
              placeholderTextColor={theme.colors.textTertiary}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                clearError("email");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="Email input"
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.phone ? styles.inputError : null]}
              placeholder="Phone Number"
              placeholderTextColor={theme.colors.textTertiary}
              value={phone}
              onChangeText={(value) => {
                setPhone(value);
                clearError("phone");
              }}
              keyboardType="phone-pad"
              accessibilityLabel="Phone number input"
            />
            {errors.phone ? (
              <Text style={styles.errorText}>{errors.phone}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              placeholder="Password"
              placeholderTextColor={theme.colors.textTertiary}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                clearError("password");
              }}
              secureTextEntry
              accessibilityLabel="Password input"
            />
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                errors.confirmPassword ? styles.inputError : null,
              ]}
              placeholder="Confirm Password"
              placeholderTextColor={theme.colors.textTertiary}
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                clearError("confirmPassword");
              }}
              secureTextEntry
              accessibilityLabel="Confirm password input"
            />
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

          <Text style={styles.roleTitle}>I want to:</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "donor" && styles.roleButtonActive,
                errors.role && !role && styles.roleButtonError,
              ]}
              onPress={() => {
                setRole("donor");
                clearError("role");
              }}
            >
              <Ionicons
                name="restaurant"
                size={24}
                color={
                  role === "donor"
                    ? theme.colors.accent
                    : theme.colors.textPrimary
                }
              />
              <Text
                style={[
                  styles.roleText,
                  role === "donor" && styles.roleTextActive,
                ]}
              >
                Donate{"\n"}Food
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "receiver" && styles.roleButtonActive,
                errors.role && !role && styles.roleButtonError,
              ]}
              onPress={() => {
                setRole("receiver");
                clearError("role");
              }}
            >
              <Ionicons
                name="people"
                size={24}
                color={
                  role === "receiver"
                    ? theme.colors.accent
                    : theme.colors.textPrimary
                }
              />
              <Text
                style={[
                  styles.roleText,
                  role === "receiver" && styles.roleTextActive,
                ]}
              >
                Receive{"\n"}Food
              </Text>
            </TouchableOpacity>
          </View>
          {errors.role ? (
            <Text style={styles.errorText}>{errors.role}</Text>
          ) : null}

          <Button
            title={isLoading ? "Creating Account..." : "Create Account"}
            onPress={handleSignUp}
            disabled={isLoading}
          />

          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Ionicons
                name="logo-google"
                size={28}
                color={theme.colors.textPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Ionicons
                name="logo-facebook"
                size={28}
                color={theme.colors.textPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Ionicons
                name="logo-apple"
                size={28}
                color={theme.colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
              <Text style={styles.loginNowText}>Sign In Now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.lg,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xxl,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    marginBottom: theme.spacing.xl,
    textAlign: "center",
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
  roleTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
    marginBottom: theme.spacing.md,
    alignSelf: "flex-start",
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: theme.spacing.md,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.backgroundSecondary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: 30,
    marginHorizontal: theme.spacing.xs,
    minHeight: 70,
  },
  roleButtonActive: {
    backgroundColor: theme.colors.accent + "20",
    borderColor: theme.colors.accent,
    borderWidth: 1,
  },
  roleButtonError: {
    borderColor: theme.colors.error,
    borderWidth: 1,
  },
  roleText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
    marginLeft: theme.spacing.sm,
    textAlign: "center",
  },
  roleTextActive: {
    color: theme.colors.accent,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: theme.spacing.xl,
    width: "100%",
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: theme.spacing.md,
  },
  loginContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: theme.spacing.lg,
  },
  loginText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
  },
  loginNowText: {
    color: theme.colors.accent,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
  },
});

export default SignUpScreen;
