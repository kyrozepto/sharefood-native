"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, SafeAreaView, Modal } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import type { RootNavigationProp } from "../navigation/types"
import { globalStyles, theme } from "../utils/theme"

const ProfileScreen: React.FC = () => {
    const navigation = useNavigation<RootNavigationProp>()
    const [username, setUsername] = useState("Bahiskara")
    const [isEditing, setIsEditing] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [modalContent, setModalContent] = useState({ title: "", description: "" })

    const handleSave = () => {
        // Validate username
        if (username.trim().length === 0) {
            return
        }

        setIsEditing(false)
        // Here you would typically update the username in your backend
    }

    const handleLogout = () => {
        // Here you would typically clear auth tokens
        navigation.navigate("Auth")
    }

    const handleOpenModal = (title: string, description: string) => {
        setModalContent({ title, description })
        setModalVisible(true)
    }

    const handleCloseModal = () => {
        setModalVisible(false)
    }

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCloseModal}
            >
                {/* The overlay */}
                <TouchableOpacity
                    style={styles.centeredView}
                    activeOpacity={1}
                    onPressOut={handleCloseModal} // Allows closing the modal by tapping the background
                >
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>{modalContent.title}</Text>
                        <Text style={styles.modalText}>{modalContent.description}</Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={handleCloseModal}
                        >
                            <Text style={styles.modalButtonText}>Awesome!</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <View style={globalStyles.container}>
                <Text style={globalStyles.sectionHeader}>Your Profile</Text>

                {/* Profile Picture */}
                <View style={styles.profileImageContainer}>
                    <Image source={require("../../assets/images/profile_image.jpg")} style={styles.profileImage} />
                    <TouchableOpacity style={styles.editImageButton} activeOpacity={0.7}>
                        <Ionicons name="camera" size={20} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Username (edit) */}
                <View style={styles.usernameRow}>
                    {isEditing ? (
                        <>
                            <TextInput
                                style={styles.usernameInput}
                                value={username}
                                onChangeText={setUsername}
                                autoFocus
                                selectTextOnFocus
                            />
                            <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
                                <Text style={styles.editText}>Save</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text style={styles.username}>{username}</Text>
                            <TouchableOpacity onPress={() => setIsEditing(true)} activeOpacity={0.7}>
                                <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Follow count */}
                <View style={styles.followSection}>
                    <TouchableOpacity
                        style={styles.followBox}
                        activeOpacity={0.7}
                        onPress={() =>
                            handleOpenModal(
                                "Donations",
                                "This is the total number of times you've donated to various food banks and charities. Each donation, no matter the size, contributes to a larger impact and helps those in need. Keep up the amazing work! Your generosity is making a real difference."
                            )
                        }
                    >
                        <Text style={styles.followCount}>120</Text>
                        <Text style={styles.followLabel}>Donations</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.followBox}
                        activeOpacity={0.7}
                        onPress={() =>
                            handleOpenModal(
                                "Impact",
                                "This represents the total weight of food you've helped rescue. By preventing 85kg of food from going to waste, you've provided numerous meals for individuals and families. You're not just donating, you're reducing food waste and giving hope. Let's increase this incredible impact!"
                            )
                        }
                    >
                        <Text style={styles.followCount}>85kg</Text>
                        <Text style={styles.followLabel}>Impact</Text>
                    </TouchableOpacity>
                </View>

                <Text style={[globalStyles.title, styles.settingsTitle]}>Settings</Text>

                {/* Settings */}
                <View style={styles.settingsBox}>
                    <TouchableOpacity
                        style={styles.settingRow}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate("AccountSettings")}
                    >
                        <Text style={styles.settingLabel}>Account</Text>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textPrimary} />
                    </TouchableOpacity>

                    {/* <View style={styles.divider} />

                    <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={() => navigation.navigate("PrivacyPolicy")}>
                        <Text style={styles.settingLabel}>Privacy Policy</Text>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textPrimary} />
                    </TouchableOpacity> */}

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={() => navigation.navigate("FAQ")}>
                        <Text style={styles.settingLabel}>FAQ</Text>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textPrimary} />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity
                        style={styles.settingRow}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate("About")}
                    >
                        <Text style={styles.settingLabel}>About App</Text>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textPrimary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingRow} onPress={handleLogout} activeOpacity={0.7}>
                        <Text style={[styles.settingLabel, styles.logoutText]}>Logout</Text>
                        <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    profileImageContainer: {
        alignItems: "center",
        marginVertical: theme.spacing.lg,
        position: "relative",
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: theme.colors.accent,
    },
    editImageButton: {
        position: "absolute",
        bottom: 0,
        right: "35%",
        backgroundColor: theme.colors.accent,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    usernameRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        marginTop: theme.spacing.sm,
    },
    username: {
        color: theme.colors.textPrimary,
        fontFamily: theme.font.family.medium,
        fontSize: theme.font.size.xl,
    },
    usernameInput: {
        color: theme.colors.textPrimary,
        fontFamily: theme.font.family.medium,
        fontSize: theme.font.size.xl,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        minWidth: 150,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.backgroundSecondary,
    },
    editText: {
        color: theme.colors.accent,
        fontSize: theme.font.size.md,
        fontFamily: theme.font.family.medium,
    },
    followSection: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
        gap: 100,
    },
    followBox: {
        alignItems: "center",
    },
    followCount: {
        fontSize: theme.font.size.xl,
        fontFamily: theme.font.family.bold,
        color: theme.colors.textPrimary,
    },
    followLabel: {
        fontSize: theme.font.size.sm,
        fontFamily: theme.font.family.light,
        color: theme.colors.textSecondary,
    },
    settingsTitle: {
        marginBottom: theme.spacing.md,
    },
    settingsBox: {
        backgroundColor: theme.colors.backgroundSecondary,
        borderRadius: theme.borderRadius.md,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        marginTop: theme.spacing.sm,
        width: "100%",
        alignSelf: "center",
        ...theme.shadow.sm,
    },
    settingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: theme.spacing.md,
    },
    settingLabel: {
        color: theme.colors.textPrimary,
        fontSize: theme.font.size.md,
        fontFamily: theme.font.family.medium,
    },
    logoutText: {
        color: theme.colors.error,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.textTertiary,
        opacity: 0.3,
    },
    // --- MODAL STYLES ---
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)", // Darker overlay for more focus
    },
    modalView: {
        width: "90%",
        margin: 20,
        backgroundColor: theme.colors.backgroundSecondary, // Use secondary background color
        borderRadius: theme.borderRadius.md, // Use theme border radius
        padding: theme.spacing.lg, // Use theme spacing
        alignItems: "center",
        ...theme.shadow.sm, // Use theme shadow
    },
    modalTitle: {
        marginBottom: theme.spacing.md,
        textAlign: "center",
        fontSize: theme.font.size.lg,
        fontFamily: theme.font.family.bold,
        color: theme.colors.textPrimary, // Use primary text color
    },
    modalText: {
        marginBottom: theme.spacing.lg, // Increased margin for better spacing
        textAlign: "center",
        fontSize: theme.font.size.md,
        fontFamily: theme.font.family.regular,
        color: theme.colors.textSecondary, // Use secondary text color
        lineHeight: 22,
    },
    modalButton: {
        backgroundColor: theme.colors.accent,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.borderRadius.round,
        elevation: 2,
    },
    modalButtonText: {
        color: theme.colors.textPrimary, // Or "white" if the accent color is dark
        fontFamily: theme.font.family.bold,
        fontSize: theme.font.size.md,
        textAlign: "center",
    },
})

export default ProfileScreen