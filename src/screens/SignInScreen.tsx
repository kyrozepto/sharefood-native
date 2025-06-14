import React, { useState } from "react";
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
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { globalStyles, theme } from "../utils/theme";
import Button from "../components/Button";
import { useAuth } from "../context/auth";
import type { RootStackParamList } from "../navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "SignIn">;

const SignInScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const { login } = useAuth();

  const handleSignIn = async () => {
    const newErrors = { email: "", password: "" };

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    if (newErrors.email || newErrors.password) return;

    setIsLoading(true);

    try {
      await login(email, password);

      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    } catch (err) {
      const error = err as Error;
      Alert.alert("Login Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (field: keyof typeof errors) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={[globalStyles.container, styles.container]}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Sign in to continue sharing food and reducing waste
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email"
            placeholderTextColor={theme.colors.textTertiary}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              clearError("email");
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            accessibilityLabel="Email input"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
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
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <Button
          title={isLoading ? "Signing In..." : "Sign In"}
          onPress={handleSignIn}
          disabled={isLoading}
        />

        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons
              name="logo-google"
              size={28}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons
              name="logo-facebook"
              size={28}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons
              name="logo-apple"
              size={28}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.registerNowText}>Register Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: theme.spacing.lg,
  },
  forgotPasswordText: {
    color: theme.colors.accent,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.sm,
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
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing.lg,
  },
  registerText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
  },
  registerNowText: {
    color: theme.colors.accent,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
  },
});

export default SignInScreen;
