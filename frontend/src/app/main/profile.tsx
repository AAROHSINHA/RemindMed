import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { logoutUser } from "@/api/auth";
import { StatBox } from "@/components/main/stat-box";
import { MainButton } from "@/components/sharedComponents/main-button";
import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";
import { profileStats } from "@/data/mock-profile-stats";
import { useUser } from "@/hooks/use-user";

export default function ProfileScreen() {
  const user = useUser();
  const insets = useSafeAreaInsets();
  const initial = user?.name.charAt(0).toUpperCase() ?? "";

  const handleEditProfile = () => {
    Alert.alert("Edit profile", "Editing your profile is coming soon.");
  };

  const handleLogout = async () => {
    await logoutUser();
    router.replace("/auth/login");
  };

  const details = [
    { label: "Email", value: user?.email ?? "-" },
    { label: "Phone", value: user?.phone ?? "-" },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.banner, { height: sizes.profileBannerHeight + insets.top }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
      </View>

      <Text style={styles.name}>{user?.name ?? "-"}</Text>

      <View style={styles.section}>
        <View style={styles.card}>
          {details.map((item, index) => (
            <View key={item.label} style={[styles.row, index > 0 && styles.rowDivider]}>
              <View style={styles.rowText}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.value}>{item.value}</Text>
              </View>
              <Pressable
                onPress={handleEditProfile}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${item.label.toLowerCase()}`}
                hitSlop={sizes.spacing.xs}
              >
                <Ionicons name="create-outline" size={sizes.iconSize.md} color={colors.primary} />
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.stats}>
          <StatBox
            icon="medkit-outline"
            value={profileStats.ongoingMedications}
            label="Ongoing medications"
          />
          <StatBox
            icon="checkmark-done-outline"
            value={profileStats.totalTaken}
            label="Medicines taken"
          />
          <StatBox icon="calendar-outline" value={profileStats.joinedAt} label="Joined at" />
        </View>

        <View style={styles.actions}>
          <MainButton
            text="Edit Profile"
            onClick={handleEditProfile}
            bgColor={colors.lavenderBackground}
            textColor={colors.primary}
          />
          <MainButton
            text="Logout"
            onClick={handleLogout}
            bgColor={colors.peachBackground}
            textColor={colors.error}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: sizes.spacing.xl,
  },
  banner: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: sizes.radius.lg,
    borderBottomRightRadius: sizes.radius.lg,
  },
  avatar: {
    position: "absolute",
    bottom: -sizes.avatarSize / 2,
    alignSelf: "center",
    width: sizes.avatarSize,
    height: sizes.avatarSize,
    borderRadius: sizes.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: sizes.avatarBorder,
    borderColor: colors.background,
    backgroundColor: colors.lavenderBackground,
  },
  avatarText: {
    fontSize: sizes.fontSize.xxl,
    fontFamily: "InterBold",
    color: colors.primary,
  },
  name: {
    marginTop: sizes.avatarSize / 2 + sizes.spacing.md,
    textAlign: "center",
    fontSize: sizes.fontSize.xl,
    fontFamily: "InterBold",
    color: colors.textPrimary,
  },
  section: {
    gap: sizes.spacing.md,
    marginTop: sizes.spacing.md,
    paddingHorizontal: sizes.spacing.lg,
  },
  card: {
    paddingHorizontal: sizes.spacing.md,
    borderRadius: sizes.radius.lg,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: sizes.spacing.md,
    paddingVertical: sizes.spacing.md,
  },
  rowDivider: {
    borderTopWidth: sizes.borderWidth,
    borderTopColor: colors.border,
  },
  rowText: {
    flex: 1,
    gap: sizes.spacing.xxs,
  },
  label: {
    fontSize: sizes.fontSize.xs,
    fontFamily: "JetBrainsMonoMedium",
    color: colors.textMuted,
  },
  value: {
    fontSize: sizes.fontSize.md,
    fontFamily: "InterSemiBold",
    color: colors.textPrimary,
  },
  stats: {
    flexDirection: "row",
    gap: sizes.spacing.sm,
  },
  actions: {
    gap: sizes.spacing.sm,
    marginTop: sizes.spacing.xs,
  },
});
