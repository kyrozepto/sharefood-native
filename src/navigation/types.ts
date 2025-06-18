import type { NavigationProp, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { LatLng } from "react-native-maps";
import { NavigatorScreenParams } from "@react-navigation/native";
import { Donation } from "../interfaces/donationInterface";

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  ForgotPassword: undefined;
  DonationDetail: { donationId: string };
  AddDonation: undefined;
  DonationRequests: { donationId: string };
  PickupDetail: { requestId: string };
  ReviewRating: {
    donation_id: number;
    donor_id: number;
    donor_name: string;
    item: string;
    quantity: string;
  };
  ReviewList: undefined;
  Notifications: undefined;
  About: undefined;
  FAQ: undefined;
  PrivacyPolicy: undefined;
  SignIn: undefined;
  SignUp: undefined;
  DonorHome: undefined;
  RecipientHome: undefined;
  RequestHistory: undefined;
  DonationHistory: undefined;
  Profile: undefined;
  AccountSettings: undefined;
  RequestForm: {
    donation: Donation;
  };
  DonationActivity: undefined;
  RequestActivity: undefined;
  DonationList: undefined;
  EditDonation: { donationId: string };
};

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Donations: undefined;
  Requests: undefined;
  Profile: undefined;
};

export type DonorStackParamList = {
  DonorDashboard: undefined;
  AddDonation: undefined;
  DonationDetail: { donationId: string };
  DonationHistory: undefined;
};

export type RecipientStackParamList = {
  RecipientDashboard: undefined;
  DonationDetail: { donationId: string };
  RequestHistory: undefined;
};

export type RootNavigationProp = NavigationProp<RootStackParamList>;
export type AuthNavigationProp = NavigationProp<AuthStackParamList>;
export type MainTabNavigationProp = NavigationProp<MainTabParamList>;

export type RootRouteProp<T extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  T
>;
