import type React from "react"
import { TouchableOpacity, Text, StyleSheet, type StyleProp, type ViewStyle, type TextStyle } from "react-native"
import { theme } from "../utils/theme"

interface ButtonProps {
  title: string
  onPress: () => void
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  variant?: "primary" | "secondary" | "outline"
  disabled?: boolean
}

const Button: React.FC<ButtonProps> = ({ title, onPress, style, textStyle, variant = "primary", disabled = false }) => {
  const buttonStyles = [
    styles.button,
    variant === "primary" && styles.primaryButton,
    variant === "secondary" && styles.secondaryButton,
    variant === "outline" && styles.outlineButton,
    disabled && styles.disabledButton,
    style,
  ]

  const textStyles = [
    styles.buttonText,
    variant === "primary" && styles.primaryText,
    variant === "secondary" && styles.secondaryText,
    variant === "outline" && styles.outlineText,
    disabled && styles.disabledText,
    textStyle,
  ]

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primaryButton: {
    backgroundColor: theme.colors.textPrimary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.accent,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.textPrimary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
  },
  primaryText: {
    color: theme.colors.background,
  },
  secondaryText: {
    color: theme.colors.textPrimary,
  },
  outlineText: {
    color: theme.colors.textPrimary,
  },
  disabledText: {
    color: theme.colors.textTertiary,
  },
})

export default Button
