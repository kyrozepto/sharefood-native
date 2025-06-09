"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import type { RootNavigationProp } from "../navigation/types"
import { globalStyles, theme } from "../utils/theme"

// Mock data - replace with actual data from your backend
const mockFAQs = [
  {
    id: "1",
    question: "How does ShareFood work?",
    answer: "ShareFood connects food donors with recipients to reduce food waste and help those in need. Donors can post available food items, and recipients can request them for pickup.",
  },
  {
    id: "2",
    question: "What types of food can I donate?",
    answer: "You can donate any non-perishable food items, fresh produce, packaged goods, and prepared food that is still safe to consume. All donations must be within their expiry date and in good condition.",
  },
  {
    id: "3",
    question: "How do I schedule a pickup?",
    answer: "Once your request for a donation is approved, you can schedule a pickup time with the donor through the app. The donor will confirm the pickup time and location.",
  },
  {
    id: "4",
    question: "Is there a limit to how much food I can request?",
    answer: "There is no strict limit, but we encourage reasonable requests based on your needs. Please be considerate of other recipients who may also need assistance.",
  },
  {
    id: "5",
    question: "How do I report an issue?",
    answer: "You can report issues through the app's support section or contact our support team directly. We take all reports seriously and will investigate them promptly.",
  },
]

const FAQScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

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
          <Text style={styles.title}>Frequently Asked Questions</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          {mockFAQs.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              style={styles.faqCard}
              onPress={() => toggleExpand(faq.id)}
            >
              <View style={styles.questionContainer}>
                <Text style={styles.question}>{faq.question}</Text>
                <Ionicons
                  name={expandedId === faq.id ? "chevron-up" : "chevron-down"}
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </View>
              {expandedId === faq.id && (
                <Text style={styles.answer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
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
  content: {
    paddingHorizontal: theme.spacing.md,
  },
  faqCard: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  questionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  question: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.md,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  answer: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    marginTop: theme.spacing.md,
    lineHeight: 24,
  },
})

export default FAQScreen 