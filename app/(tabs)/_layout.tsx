import { Tabs } from "expo-router";
import TabBar from "components/TabBar";
import { colors, font } from "constants/theme";

// Tiêu đề tiếng Việt, chữ to; bỏ các nút menu/tìm kiếm/chuông chưa có chức năng.
export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
        headerTitleStyle: { fontSize: font.title, fontWeight: "bold" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Trang chủ", headerShown: false }} />
      <Tabs.Screen name="map" options={{ title: "Bản đồ vườn" }} />
      <Tabs.Screen name="camera" options={{ title: "Chụp lá cà phê" }} />
      <Tabs.Screen name="history" options={{ title: "Lịch sử chụp" }} />
      <Tabs.Screen name="profile" options={{ title: "Tài khoản" }} />
    </Tabs>
  );
}
