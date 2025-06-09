import { StyleSheet } from "react-native"

export const theme = {
  colors: {
    background: "#000000",
    backgroundSecondary: "#121212",
    textPrimary: "#ffffff",
    textSecondary: "#eeeeee",
    textTertiary: "#B5B5B5",
    accent: "#1DB954",
    error: "#FF5252",
    gradientStart: "#1E89B8",
    gradientEnd: "#000000",
  },
  spacing: {
    xs: 5,
    sm: 10,
    md: 15,
    lg: 20,
    xl: 30,
    xxl: 40,
    xxxl: 50,
  },
  font: {
    family: {
      light: "CarosLight",
      regular: "CarosRegular",
      medium: "CarosMedium",
      bold: "CarosBold",
      heavy: "CarosHeavy",
    },
    size: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 28,
      display: 38,
    },
    lineHeight: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 32,
      xxl: 36,
      xxxl: 42,
    },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 9999,
  },
  image: {
    playlist: {
      sm: 90,
      md: 150,
      lg: 200,
    },
    song: {
      sm: 50,
      md: 90,
      lg: 120,
    },
    profile: {
      sm: 40,
      md: 80,
      lg: 120,
    },
  },
  shadow: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 8,
    },
  },
}

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.display,
    lineHeight: theme.font.lineHeight.xxxl,
  },
  subHeader: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.lg,
    lineHeight: theme.font.lineHeight.lg,
  },
  sectionHeader: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xxl,
    marginVertical: theme.spacing.sm,
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xxl,
    lineHeight: theme.font.lineHeight.md,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    lineHeight: theme.font.lineHeight.xxl,
  },
  body: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    lineHeight: theme.font.lineHeight.md,
  },
  caption: {
    color: theme.colors.textTertiary,
    fontFamily: theme.font.family.light,
    fontSize: theme.font.size.sm,
    lineHeight: theme.font.lineHeight.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  spaceBetween: {
    justifyContent: "space-between",
  },
})
