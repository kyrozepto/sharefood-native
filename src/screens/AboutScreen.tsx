"use client"

import type React from "react"
import { View, Text, StyleSheet, ScrollView, Image, SafeAreaView, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import type { RootNavigationProp } from "../navigation/types"
import { globalStyles, theme } from "../utils/theme"

const AboutScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>()

  const contributors = [
    {
      username: "kyrozepto",
      name: "Bahiskara Ananda Arryanto", 
      description: "NPM-22081010181",
      image: require("../../assets/images/profile_image.jpg"),
    },
    {
      username: "ikoindra",
      name: "Iko Indra Gunawan",
      description: "NPM-22081010003", 
      image: require("../../assets/images/profile_image2.jpg"),
    },
  ]

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={globalStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>About App</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ShareFood</Text>
          <Text style={styles.description}>
            ShareFood is a community-driven platform that connects food donors with those in need. 
            Our mission is to reduce food waste and help those facing food insecurity by making food sharing simple and accessible.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's on ShareFood?</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="restaurant" size={24} color={theme.colors.accent} />
              <Text style={styles.featureText}>Food Donation</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="location" size={24} color={theme.colors.accent} />
              <Text style={styles.featureText}>Pickup Management</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="people" size={24} color={theme.colors.accent} />
              <Text style={styles.featureText}>Donators and Recipients</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GitHub Contributors</Text>
          {contributors.map((contributor, index) => (
            <View key={index} style={styles.contributorCard}>
              <Image source={contributor.image} style={styles.contributorImage} />
              <View style={styles.contributorInfo}>
                <Text style={styles.contributorusername}>{contributor.username}</Text>
                <Text style={styles.contributorName}>{contributor.name}</Text>
                <Text style={styles.contributorDescription}>{contributor.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Version</Text>
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.lg,
    marginBottom: theme.spacing.md,
  },
  description: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    lineHeight: 25,
  },
  featureList: {
    gap: theme.spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  featureText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
  },
  contributorCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  contributorImage: {
    width: 50,
    height: 50,
    borderRadius: 30,
    marginRight: theme.spacing.md,
  },
  contributorInfo: {
    flex: 1,
  },
  contributorName: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
  },
  contributorusername: {
    color: theme.colors.accent,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.sm,
    marginBottom: theme.spacing.xs,
  },
  contributorDescription: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.sm,
  },
  versionText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
  },
})

export default AboutScreen