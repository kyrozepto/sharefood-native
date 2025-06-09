import type React from "react"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  Modal,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import type { RootNavigationProp, RootRouteProp } from "../navigation/types"
import { globalStyles, theme } from "../utils/theme"
import Button from "../components/Button"

const timeSlots = [
  { id: "1", label: "13:00 - 15:00" },
  { id: "2", label: "16:00 - 18:00" },
]

interface FormErrors {
  quantity?: string
  timeSlot?: string
  agreement?: string
}

const RequestFormScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>()
  const route = useRoute<RootRouteProp<"RequestForm">>()
  const { donation } = route.params

  const [requestedQuantity, setRequestedQuantity] = useState(1)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [notes, setNotes] = useState("")
  const [isAgreed, setIsAgreed] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const maxQuantity = parseInt(donation.quantity, 10)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    if (requestedQuantity <= 0) {
      newErrors.quantity = "Jumlah harus minimal 1."
    }
    if (requestedQuantity > maxQuantity) {
      newErrors.quantity = `Tidak bisa melebihi jumlah tersedia (${maxQuantity}).`
    }
    if (!selectedTimeSlot) {
      newErrors.timeSlot = "Silakan pilih waktu pengambilan."
    }
    if (!isAgreed) {
      newErrors.agreement = "Anda harus menyetujui persyaratan terlebih dahulu."
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleQuantityChange = (text: string) => {
    const num = parseInt(text, 10)
    setRequestedQuantity(isNaN(num) ? 0 : num)
  }

  const incrementQuantity = () => {
    if (requestedQuantity < maxQuantity) {
      setRequestedQuantity(prev => prev + 1)
    }
  }

  const decrementQuantity = () => {
    if (requestedQuantity > 1) {
      setRequestedQuantity(prev => prev - 1)
    }
  }
  
  useEffect(() => {
    validateForm();
  }, [requestedQuantity, selectedTimeSlot, isAgreed]);

  const handleSubmit = () => {
    if (validateForm()) {
      console.log({
        donationId: donation.id,
        quantity: requestedQuantity,
        timeSlot: selectedTimeSlot,
        notes,
      })
      setShowSuccessModal(true)
    }
  }

  const handleSuccess = () => {
    setShowSuccessModal(false)
    navigation.goBack()
  }

  const isSubmitDisabled = Object.keys(errors).length > 0 || requestedQuantity <= 0

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={[globalStyles.container, styles.container]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Formulir Permintaan</Text>
          <View style={{ alignContent: "center" }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Ringkasan Donasi</Text>
            <Image source={{ uri: donation.image }} style={styles.donationImage} />
            <Text style={styles.donationTitle}>{donation.title}</Text>
            <Text style={styles.donationDetail}>Total Tersedia: {donation.quantity}</Text>
            <Text style={styles.donationDetail}>Kadaluarsa: {donation.expiryTime}</Text>
            <Text style={styles.donationDetail}>Lokasi: {donation.location}</Text>
            <View style={styles.pickupInfo}>
                <Ionicons name="walk-outline" size={20} color={theme.colors.textSecondary} />
                <Text style={styles.pickupInfoText}>Hanya untuk Pengambilan Sendiri (Self-Pickup)</Text>
            </View>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Detail Permintaan Anda</Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Jumlah yang Diminta</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity style={styles.quantityButton} onPress={decrementQuantity} disabled={requestedQuantity <= 1}>
                  <Ionicons name="remove" size={24} color={requestedQuantity <= 1 ? theme.colors.textTertiary : theme.colors.textPrimary} />
                </TouchableOpacity>
                <TextInput
                  style={styles.quantityInput}
                  value={requestedQuantity.toString()}
                  onChangeText={handleQuantityChange}
                  onBlur={() => { if (requestedQuantity === 0) setRequestedQuantity(1) }}
                  keyboardType="numeric"
                />
                <TouchableOpacity style={styles.quantityButton} onPress={incrementQuantity} disabled={requestedQuantity >= maxQuantity}>
                  <Ionicons name="add" size={24} color={requestedQuantity >= maxQuantity ? theme.colors.textTertiary : theme.colors.textPrimary} />
                </TouchableOpacity>
              </View>
              {errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}
            </View>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Waktu Pengambilan</Text>
              <View style={styles.timeSlotsContainer}>
                {timeSlots.map(slot => (
                  <TouchableOpacity
                    key={slot.id}
                    style={[ styles.timeSlot, selectedTimeSlot === slot.id && styles.timeSlotSelected ]}
                    onPress={() => setSelectedTimeSlot(slot.id)}
                  >
                    <Text style={[ styles.timeSlotText, selectedTimeSlot === slot.id && styles.timeSlotTextSelected ]}>
                      {slot.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.timeSlot && <Text style={styles.errorText}>{errors.timeSlot}</Text>}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Catatan (Opsional)</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Mis: Saya akan datang sedikit terlambat."
                placeholderTextColor={theme.colors.textTertiary}
                multiline
              />
            </View>
          </View>
          
          <View style={styles.section}>
            <TouchableOpacity style={styles.agreementContainer} onPress={() => setIsAgreed(!isAgreed)}>
              <View style={[styles.checkbox, isAgreed && styles.checkboxChecked]}>
                {isAgreed && <Ionicons name="checkmark" size={16} color={"#FFFFFF"} />}
              </View>
              <Text style={styles.agreementText}>
                Saya mengerti dan setuju dengan syarat dan ketentuan pengambilan donasi.
              </Text>
            </TouchableOpacity>
            {errors.agreement && <Text style={styles.errorText}>{errors.agreement}</Text>}
          </View>

          <Button title="Kirim Permintaan" onPress={handleSubmit} disabled={isSubmitDisabled} />
        </ScrollView>

        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
          onRequestClose={handleSuccess}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Ionicons
                name="checkmark-circle"
                size={64}
                color={theme.colors.accent}
                style={styles.successIcon}
              />
              <Text style={styles.modalTitle}>Permintaan Berhasil!</Text>
              <Text style={styles.modalText}>
                Permintaan donasi Anda telah berhasil dikirim. Silakan tunggu konfirmasi dari
                pendonor.
              </Text>
              <Button title="Kembali" onPress={handleSuccess} />
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: theme.spacing.md,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xl,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.lg,
    marginBottom: theme.spacing.md,
  },
  donationImage: {
    width: "100%",
    height: 180,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  donationTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.lg,
    marginBottom: theme.spacing.xs,
  },
  donationDetail: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    marginBottom: theme.spacing.xs,
    lineHeight: 22,
  },
  pickupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: theme.borderRadius.sm,
  },
  pickupInfoText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.sm,
  },
  fieldContainer: {
    marginBottom: theme.spacing.lg,
  },
  fieldLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.md,
    marginBottom: theme.spacing.sm,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.round,
  },
  quantityInput: {
    width: 60,
    height: 44,
    textAlign: "center",
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xl,
    marginHorizontal: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.sm,
    marginTop: theme.spacing.sm,
    paddingLeft: theme.spacing.xs,
  },
  timeSlotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  timeSlot: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    borderColor: theme.colors.textTertiary,
  },
  timeSlotSelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  timeSlotText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.medium,
  },
  timeSlotTextSelected: {
    color: "#FFFFFF",
  },
  notesInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    textAlignVertical: "top",
    minHeight: 100,
    borderWidth: 1,
    borderColor: theme.colors.textTertiary,
  },
  agreementContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.textSecondary,
    marginRight: theme.spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  agreementText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.sm,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: "90%",
    alignItems: "center",
  },
  successIcon: {
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.xl,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  modalText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
})

export default RequestFormScreen