import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useRef, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import { WEATHER_API_KEY } from "constants/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, font, radius, shadow, space } from "constants/theme";
import { BigButton, Card, SectionTitle, ui } from "components/ui";
import Logo from "components/Logo";
import { useScanImage } from "components/scan/ScanImage";
import { listScans } from "utils/ktcfs/api";
import { getUser } from "utils/ktcfs/session";
import { formatDateTime, statusOf, statusTitle } from "utils/ktcfs/display";
import type { KtcfsUser, Scan } from "utils/ktcfs/types";

type Weather = {
  location: string;
  temp_c: number;
  wind_kph: number;
  humidity: number;
  condition: string;
  icon: string;
};

// Các bước chụp, theo quy tắc của KTCFS (đứng trong vườn, GPS tốt, ảnh rõ)
const CAPTURE_STEPS = [
  { icon: "location" as const, text: "Đứng trong vườn cà phê của mình" },
  { icon: "radio" as const, text: "Chờ ô định vị chuyển màu xanh" },
  { icon: "sunny" as const, text: "Chụp gần, rõ 1–2 lá, đủ sáng, không ngược nắng" },
];

type IconName = React.ComponentProps<typeof Ionicons>["name"];

// Ô tiện ích to, dạng lưới 2 cột
function Tile({
  icon,
  title,
  color,
  onPress,
}: {
  icon: IconName;
  title: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && { opacity: 0.75 }]}
    >
      <View style={[styles.tileIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={30} color="#fff" />
      </View>
      <Text style={styles.tileTitle}>{title}</Text>
    </Pressable>
  );
}

function RecentThumb({ scanId }: { scanId: string }) {
  const { uri } = useScanImage(scanId);
  return uri ? (
    <Image source={{ uri }} style={styles.recentThumb} />
  ) : (
    <View style={[styles.recentThumb, { backgroundColor: colors.primarySoft }]} />
  );
}

const WEATHER_REFRESH_MS = 10 * 60 * 1000;
const WEATHER_MOVE_KM = 1;

// Khoảng cách gần đúng giữa hai toạ độ (km), đủ dùng cho khoảng cách ngắn
function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const rad = Math.PI / 180;
  const x = (b.lon - a.lon) * rad * Math.cos(((a.lat + b.lat) / 2) * rad);
  const y = (b.lat - a.lat) * rad;
  return Math.sqrt(x * x + y * y) * 6371;
}

// Thời tiết theo vị trí GPS hiện tại. Lấy lại mỗi khi mở Trang chủ (vị trí có thể đã đổi,
// kể cả khi giả lập GPS), nhưng chỉ gọi WeatherAPI khi đã quá 10 phút hoặc đi xa hơn 1 km.
function useWeather() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const last = useRef<{ lat: number; lon: number; at: number } | null>(null);

  const refresh = useCallback(async () => {
    if (!WEATHER_API_KEY) return;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      // Độ chính xác cao: lấy theo GPS thay vì Wi-Fi/trạm phát sóng
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const here = { lat: position.coords.latitude, lon: position.coords.longitude };
      const prev = last.current;
      if (
        prev &&
        Date.now() - prev.at < WEATHER_REFRESH_MS &&
        distanceKm(prev, here) < WEATHER_MOVE_KM
      ) {
        return;
      }
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${here.lat},${here.lon}&lang=vi`
      );
      const data = await response.json();
      if (!response.ok || data.error) {
        console.error("Weather API error:", data.error?.message ?? response.status);
        return;
      }
      last.current = { ...here, at: Date.now() };
      setWeather({
        location: data.location.name,
        temp_c: data.current.temp_c,
        wind_kph: data.current.wind_kph,
        humidity: data.current.humidity,
        condition: data.current.condition.text,
        icon: `https:${data.current.condition.icon}`,
      });
    } catch (error) {
      console.error("Error getting weather:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return weather;
}

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<KtcfsUser | null>(null);
  const [recent, setRecent] = useState<Scan[]>([]);
  const weather = useWeather();

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
          setRecent((await listScans(2)).items);
        } catch (error) {
          console.error("Error loading recent scans:", error);
        }
      })();
    }, [router])
  );

  const gardenCount = user?.gardens?.length ?? user?.garden_count ?? 0;

  return (
    <ScrollView style={ui.screen} contentContainerStyle={{ paddingBottom: space.xl }}>
      {/* Phần đầu: logo, lời chào */}
      <View style={[styles.header, { paddingTop: insets.top + space.md }]}>
        <View style={styles.headerRow}>
          <Logo size={44} light />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tài khoản"
            onPress={() => router.navigate("/profile")}
            style={styles.avatar}
          >
            <Ionicons name="person" size={26} color={colors.primary} />
          </Pressable>
        </View>
        <Text style={styles.greeting}>Xin chào{user ? `, ${user.full_name}` : ""}</Text>
        {user && (
          <View style={styles.headerChip}>
            <Ionicons name="location" size={18} color="#fff" />
            <Text style={styles.headerChipText}>
              Xã {user.commune_name} · {gardenCount} vườn
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* Việc chính: chụp lá */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Ionicons name="scan" size={40} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Lá cà phê có bệnh không?</Text>
              <Text style={ui.muted}>Chụp một tấm, biết ngay kết quả.</Text>
            </View>
          </View>
          <BigButton
            label="Chụp lá ngay"
            icon="camera"
            onPress={() => router.navigate("/camera")}
          />
        </View>

        {/* Lần chụp gần đây */}
        {recent.length > 0 && (
          <View>
            <View style={styles.sectionRow}>
              <SectionTitle style={{ marginBottom: 0 }}>Lần chụp gần đây</SectionTitle>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.navigate("/history")}
                hitSlop={12}
              >
                <Text style={styles.link}>Xem tất cả</Text>
              </Pressable>
            </View>
            <View style={{ gap: space.sm }}>
              {recent.map((scan) => {
                const status = statusOf(scan.result);
                return (
                  <Pressable
                    key={scan.scan_id}
                    accessibilityRole="button"
                    onPress={() =>
                      router.push({ pathname: "/result", params: { scan_id: scan.scan_id } })
                    }
                    style={({ pressed }) => [styles.recentRow, pressed && { opacity: 0.75 }]}
                  >
                    <RecentThumb scanId={scan.scan_id} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={[styles.pill, { backgroundColor: status.soft }]}>
                        <Ionicons name={status.icon} size={18} color={status.color} />
                        <Text style={[styles.pillText, { color: status.color }]}>
                          {statusTitle(scan.result)}
                        </Text>
                      </View>
                      <Text style={ui.muted}>{formatDateTime(scan.captured_at)}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={26} color={colors.textMuted} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Tiện ích */}
        <View>
          <SectionTitle>Tiện ích</SectionTitle>
          <View style={styles.grid}>
            <Tile
              icon="time"
              title="Lịch sử chụp"
              color={colors.primary}
              onPress={() => router.navigate("/history")}
            />
            <Tile
              icon="book"
              title="Tra cứu bệnh"
              color={colors.accent}
              onPress={() => router.push("/diseases")}
            />
            <Tile
              icon="map"
              title="Bản đồ vườn"
              color={colors.info}
              onPress={() => router.navigate("/map")}
            />
            <Tile
              icon="person"
              title="Tài khoản"
              color="#6A4C93"
              onPress={() => router.navigate("/profile")}
            />
          </View>
        </View>

        {/* Hướng dẫn chụp */}
        <Card>
          <SectionTitle>Cách chụp cho đúng</SectionTitle>
          {CAPTURE_STEPS.map((step, index) => (
            <View key={step.text} style={styles.step}>
              <View style={styles.stepIcon}>
                <Ionicons name={step.icon} size={24} color={colors.primary} />
              </View>
              <Text style={[ui.body, { flex: 1 }]}>
                <Text style={{ fontWeight: "bold" }}>{index + 1}. </Text>
                {step.text}
              </Text>
            </View>
          ))}
        </Card>

        {/* Thời tiết (chỉ hiện khi có khóa WeatherAPI) */}
        {weather && (
          <Card style={styles.weather}>
            <Image source={{ uri: weather.icon }} style={styles.weatherIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.weatherTemp}>{Math.round(weather.temp_c)}°C</Text>
              <Text style={ui.body}>{weather.condition}</Text>
              <Text style={ui.muted}>
                Trạm gần nhất: {weather.location} · Gió {Math.round(weather.wind_kph)} km/h ·
                Độ ẩm {weather.humidity}%
              </Text>
            </View>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: space.md,
    paddingBottom: 56,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: space.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    fontSize: font.title,
    fontWeight: "bold",
    color: "#fff",
  },
  headerChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  headerChipText: {
    fontSize: font.small,
    color: "#fff",
  },
  content: {
    paddingHorizontal: space.md,
    marginTop: -40,
    gap: space.lg,
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.md,
    ...shadow,
    shadowOpacity: 0.14,
    elevation: 6,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  heroIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: font.large + 2,
    fontWeight: "bold",
    color: colors.text,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.sm,
  },
  link: {
    fontSize: font.small,
    fontWeight: "bold",
    color: colors.primaryDark,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadow,
  },
  recentThumb: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderRadius: 999,
  },
  pillText: {
    fontSize: font.body,
    fontWeight: "bold",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
  },
  tile: {
    flexBasis: "47%",
    flexGrow: 1,
    minHeight: 120,
    padding: space.md,
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    justifyContent: "space-between",
    ...shadow,
  },
  tileIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  tileTitle: {
    fontSize: font.large,
    fontWeight: "bold",
    color: colors.text,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingVertical: space.xs,
  },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  weather: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  weatherIcon: {
    width: 64,
    height: 64,
  },
  weatherTemp: {
    fontSize: font.hero,
    fontWeight: "bold",
    color: colors.text,
  },
});
