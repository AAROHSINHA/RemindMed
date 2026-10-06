import { router } from "expo-router";

import { logoutUser } from "@/api/auth";
import { InfoRow } from "@/components/main/info-row";
import { MainButton } from "@/components/sharedComponents/main-button";
import { ScreenContainer } from "@/components/sharedComponents/screen-container";
import { SectionHeader } from "@/components/sharedComponents/section-header";
import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";
import { useUser } from "@/hooks/use-user";

export default function ProfileScreen() {
  const user = useUser();

  const handleLogout = async () => {
    await logoutUser();
    router.replace("/auth/login");
  };

  return (
    <ScreenContainer>
      <SectionHeader title="My Profile" />
      <InfoRow icon="person-outline" label="Name" value={user?.name ?? "-"} />
      <InfoRow icon="mail-outline" label="Email" value={user?.email ?? "-"} />
      <InfoRow icon="call-outline" label="Phone" value={user?.phone ?? "-"} />
      <MainButton
        text="Log Out"
        onClick={handleLogout}
        bgColor={colors.peachBackground}
        textColor={colors.error}
        style={{ marginTop: sizes.spacing.md }}
      />
    </ScreenContainer>
  );
}
