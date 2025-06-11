import type React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { Ionicons } from "@expo/vector-icons"
import { ActivityIndicator, View } from "react-native"
import { useState } from "react"

// Screens
import SignInScreen from "../screens/SignInScreen"
import SignUpScreen from "../screens/SignUpScreen"
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen"
import HomeScreen from "../screens/HomeScreen"
import SearchScreen from "../screens/SearchScreen"
import ProfileScreen from "../screens/ProfileScreen"
import DonationDetailScreen from "../screens/DonationDetailScreen"
import AddDonationScreen from "../screens/AddDonationScreen"
import DonationRequestsScreen from "../screens/DonationRequestsScreen"
import PickupDetailScreen from "../screens/PickupDetailScreen"
import ReviewRatingScreen from "../screens/ReviewRatingScreen"
import NotificationsScreen from "../screens/NotificationsScreen"
import AboutScreen from "../screens/AboutScreen"
import AccountSettingsScreen from "../screens/AccountSettingsScreen"
import RequestFormScreen from "../screens/RequestFormScreen"
import DonationActivityScreen from "../screens/DonationActivityScreen"
import DonationListScreen from "../screens/DonationListScreen"
import EditDonationScreen from "../screens/EditDonationScreen"
// import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen"
import FAQScreen from "../screens/FAQScreen"
// Types
import type { RootStackParamList, AuthStackParamList, MainTabParamList } from "./types"

// Hooks
import { useFonts } from "../hooks/useFonts"

// Theme
import { theme } from "../utils/theme"

// Create navigators
const Stack = createStackNavigator<RootStackParamList>()
const AuthStack = createStackNavigator<AuthStackParamList>()
const Tab = createBottomTabNavigator<MainTabParamList>()

// Auth navigator
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="SignIn" component={SignInScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
  </AuthStack.Navigator>
)

// Main tab navigator
const MainTabNavigator = () => {
  const [currentRoute, setCurrentRoute] = useState("Home")

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: React.ComponentProps<typeof Ionicons>["name"] = "ellipse"

            switch (route.name) {
              case "Home":
                iconName = "home"
                break
              case "Search":
                iconName = "search"
                break
              case "Donations":
                iconName = "restaurant"
                break
              case "Profile":
                iconName = "person"
                break
            }

            return <Ionicons name={iconName} size={size} color={color} />
          },
          tabBarLabelStyle: {
            fontFamily: theme.font.family.regular,
            fontSize: theme.font.size.sm,
          },
          tabBarActiveTintColor: theme.colors.textPrimary,
          tabBarInactiveTintColor: theme.colors.textTertiary,
          tabBarStyle: {
            backgroundColor: theme.colors.background,
            height: 50,
            borderTopWidth: 0,
          },
          headerShown: false,
        })}
        screenListeners={{
          state: (e) => {
            const route = e.data.state.routes[e.data.state.index]
            setCurrentRoute(route.name)
          },
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Donations" component={DonationActivityScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </View>
  )
}

// Root navigator
const AppNavigator = () => {
  const { fontsLoaded, error } = useFonts()

  if (!fontsLoaded) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background }}
      >
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="DonationDetail" component={DonationDetailScreen} />
        <Stack.Screen name="AddDonation" component={AddDonationScreen} />
        <Stack.Screen name="DonationRequests" component={DonationRequestsScreen} />
        <Stack.Screen name="PickupDetail" component={PickupDetailScreen} />
        <Stack.Screen name="ReviewRating" component={ReviewRatingScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
        <Stack.Screen name="RequestForm" component={RequestFormScreen} />
        <Stack.Screen name="DonationActivity" component={DonationActivityScreen} />
        <Stack.Screen name="DonationList" component={DonationListScreen} />
        <Stack.Screen name="EditDonation" component={EditDonationScreen} />
        {/* <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} /> */}
        <Stack.Screen name="FAQ" component={FAQScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigator
