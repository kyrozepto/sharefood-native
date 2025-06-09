import type React from "react"
import { TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { theme } from "../utils/theme"

interface BackButtonProps {
  onPress?: () => void
  color?: string
  size?: number
}

const BackButton: React.FC<BackButtonProps> = ({ onPress, color = theme.colors.textPrimary, size = 30 }) => {
  const navigation = useNavigation()

  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      navigation.goBack()
    }
  }

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.7}>
      <Ionicons name="chevron-back" size={size} color={color} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 40,
    left: 22,
    zIndex: 10,
    padding: theme.spacing.xs,
  },
})

export default BackButton
