import type { NavigationProp, RouteProp } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"

export type RootStackParamList = {
  Auth: undefined
  Main: undefined
  ForgotPassword: undefined
  DonationDetail: { donationId: string }
  AddDonation: undefined
  DonationRequests: { donationId: string }
  PickupDetail: { donationId: string }
  ReviewRating: { transactionId: string }
  Notifications: undefined
  About: undefined
  FAQ: undefined
  PrivacyPolicy: undefined
  SignIn: undefined
  SignUp: undefined
  DonorHome: undefined
  RecipientHome: undefined
  RequestHistory: undefined
  DonationHistory: undefined
  Profile: undefined
  AccountSettings: undefined
  RequestForm: {
    donation: {
      id: string
      title: string
      description: string
      quantity: string
      expiryTime: string
      location: string
      distance: string
      donor: {
        name: string
        rating: number
        totalDonations: number
      }
      image: string
    }
  }
  DonationActivity: undefined
}

export type AuthStackParamList = {
  SignIn: undefined
  SignUp: undefined
}

export type MainTabParamList = {
  Home: undefined
  Search: undefined
  Donations: undefined
  Profile: undefined
}

export type DonorStackParamList = {
  DonorDashboard: undefined
  AddDonation: undefined
  DonationDetail: { donationId: string }
  DonationHistory: undefined
}

export type RecipientStackParamList = {
  RecipientDashboard: undefined
  DonationDetail: { donationId: string }
  RequestHistory: undefined
}

export type RootNavigationProp = NavigationProp<RootStackParamList>
export type AuthNavigationProp = NavigationProp<AuthStackParamList>
export type MainTabNavigationProp = NavigationProp<MainTabParamList>

export type RootRouteProp<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>
