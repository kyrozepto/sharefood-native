"use client";

import type React from "react";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { RootNavigationProp } from "../navigation/types";
import { globalStyles, theme } from "../utils/theme";
import Button from "../components/Button";
import { resetPassword } from "services/user";

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError("All fields are required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await resetPassword(email, newPassword);
      setSuccess(true);
    } catch (error: any) {
      setError(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={[globalStyles.container, styles.container]}>
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

        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email and set a new password
        </Text>

        {!success ? (
          <>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="Email"
                placeholderTextColor={theme.colors.textTertiary}
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setError("");
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="New Password"
                placeholderTextColor={theme.colors.textTertiary}
                value={newPassword}
                onChangeText={(value) => {
                  setNewPassword(value);
                  setError("");
                }}
                secureTextEntry
              />
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="Confirm Password"
                placeholderTextColor={theme.colors.textTertiary}
                value={confirmPassword}
                onChangeText={(value) => {
                  setConfirmPassword(value);
                  setError("");
                }}
                secureTextEntry
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            <Button
              title={isLoading ? "Processing..." : "Reset Password"}
              onPress={handleResetPassword}
              disabled={isLoading}
            />
          </>
        ) : (
          <View style={styles.successContainer}>
            <Ionicons
              name="checkmark-circle"
              size={64}
              color={theme.colors.accent}
            />
            <Text style={styles.successTitle}>Password Updated!</Text>
            <Text style={styles.successText}>
              You can now sign in with your new password.
            </Text>
            <Button
              title="Back to Login"
              style={styles.backtosigninButton}
              onPress={() => navigation.navigate("Auth")}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  backtosigninButton: {
    paddingHorizontal: theme.spacing.xl,
  },
  backButton: {
    position: "absolute",
    top: theme.spacing.xl,
    left: theme.spacing.xl,
    zIndex: 1,
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xxl,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    marginBottom: theme.spacing.xl,
    textAlign: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  inputContainer: {
    width: "100%",
    marginBottom: theme.spacing.lg,
  },
  input: {
    backgroundColor: theme.colors.backgroundSecondary,
    color: theme.colors.textPrimary,
    padding: theme.spacing.md,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    width: "100%",
    borderRadius: 30,
    marginBottom: theme.spacing.md,
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
  successContainer: {
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  successTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xl,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  successText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
});

export default ForgotPasswordScreen;
