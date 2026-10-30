import { Alert, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { getMe, logout } from "utils/ktcfs/api";
import { getUser } from "utils/ktcfs/session";
import type { KtcfsUser } from "utils/ktcfs/types";
import { BigButton, Card, MenuRow, SectionTitle, ui } from "components/ui";
import { colors, font, radius, space } from "constants/theme";

const ROLE_LABELS: Record<string, string> = {
  citizen_user: "Nông hộ",
  cooperative_user: "Hợp tác xã",
  commune_officer: "Cán bộ xã",
};

// Hỏi lại trước khi đăng xuất để tránh bấm nhầm
function confirmLogout(onConfirm: () => void) {
  const message = "Bạn có chắc muốn đăng xuất không?";
  if (Platform.OS === "web") {
    if (window.confirm(message)) onConfirm();
    return;
  }
  Alert.alert("Đăng xuất", message, [
    { text: "Không", style: "cancel" },
    { text: "Đăng xuất", style: "destructive", onPress: onConfirm },
  ]);
}

export default function Profile() {
  const [user, setUser] = useState<KtcfsUser | null>(null);

  const router = useRouter();

  // Hiện hồ sơ đã lưu ngay, rồi làm mới từ GET /me
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const saved = await getUser();
        if (!saved) {
          router.replace("/login");
          return;
        }
        setUser(saved);
        try {
          setUser(await getMe());
        } catch (e) {
          console.error("Error loading profile:", e);
        }
      })();
    }, [router])
  );

  // Đăng xuất: thu hồi phiên trên server rồi xóa token trên máy
  const handleLogout = () =>
    confirmLogout(async () => {
      await logout();
      router.replace("/login");
    });

  return (
    <ScrollView style={ui.screen} contentContainerStyle={styles.content}>
      {/* Thông tin người dùng */}
      <Card style={styles.userCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={44} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user?.full_name}</Text>
          <Text style={ui.body}>{user?.phone}</Text>
          {user && (
            <Text style={ui.muted}>
              {ROLE_LABELS[user.role] ?? user.role} · Xã {user.commune_name}
            </Text>
          )}
        </View>
      </Card>

      {/* Vườn được chụp */}
      {user && (
        <View>
          <SectionTitle>Vườn của bạn</SectionTitle>
          {user.gardens && user.gardens.length > 0 ? (
            <View style={{ gap: space.sm }}>
              {user.gardens.map((garden, index) => (
                <Card key={garden.polygon_id} style={styles.garden}>
                  <View style={styles.gardenIcon}>
                    <Ionicons name="leaf" size={26} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.gardenTitle}>Vườn {index + 1}</Text>
                    <Text style={ui.muted}>
                      Mã {garden.polygon_id} · {String(garden.area_ha).replace(".", ",")} ha
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <Card>
              <Text style={ui.body}>
                {user.garden_count > 0
                  ? `Bạn chụp được ở ${user.garden_count} vườn trong xã.`
                  : "Tài khoản chưa có vườn trên bản đồ. Hãy nhờ cán bộ xã đăng ký vườn trên KTCFS."}
              </Text>
            </Card>
          )}
        </View>
      )}

      <View style={{ gap: space.sm }}>
        <SectionTitle>Tiện ích</SectionTitle>
        <MenuRow
          icon="book"
          title="Tra cứu bệnh"
          subtitle="Dấu hiệu và cách xử lý"
          color={colors.accent}
          onPress={() => router.push("/diseases")}
        />
      </View>

      <BigButton label="Đăng xuất" icon="log-out" variant="danger" onPress={handleLogout} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: space.md,
    gap: space.lg,
    paddingBottom: space.xl,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: font.title - 2,
    fontWeight: "bold",
    color: colors.text,
  },
  garden: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    borderRadius: radius.md,
  },
  gardenIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  gardenTitle: {
    fontSize: font.large,
    fontWeight: "bold",
    color: colors.text,
  },
});
