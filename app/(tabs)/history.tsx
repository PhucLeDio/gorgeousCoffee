import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useCallback, useRef, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { listScans } from "utils/ktcfs/api";
import {
  displayName,
  formatDateTime,
  formatPercent,
  statusOf,
  statusTitle,
} from "utils/ktcfs/display";
import { BigButton, Notice, ui } from "components/ui";
import { colors, font, radius, shadow, space } from "constants/theme";
import type { Scan } from "utils/ktcfs/types";
import { useScanImage } from "components/scan/ScanImage";

const PAGE_SIZE = 20;

function Thumbnail({ scanId }: { scanId: string }) {
  const { uri } = useScanImage(scanId);
  return uri ? (
    <Image source={{ uri }} style={styles.image} />
  ) : (
    <View style={[styles.image, styles.imagePlaceholder]} />
  );
}

function HistoryItem({ scan, onPress }: { scan: Scan; onPress: () => void }) {
  const { result } = scan;
  const status = statusOf(result);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.itemContainer, pressed && { opacity: 0.75 }]}
    >
      <Thumbnail scanId={scan.scan_id} />
      <View style={styles.itemBody}>
        <View style={styles.statusRow}>
          <Ionicons name={status.icon} size={24} color={status.color} />
          <Text style={[styles.titleText, { color: status.color }]}>{statusTitle(result)}</Text>
        </View>
        {result.top2 ? (
          <Text style={styles.labelText}>
            {displayName(result)} hoặc {displayName(result.top2)}
          </Text>
        ) : (
          <Text style={styles.labelText}>Độ tin cậy {formatPercent(result.confidence)}</Text>
        )}
        <Text style={styles.metaText}>{formatDateTime(scan.captured_at)}</Text>
        {scan.garden && <Text style={styles.metaText}>Vườn {scan.garden.polygon_id}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={26} color={colors.textMuted} />
    </Pressable>
  );
}

export default function History() {
  const [items, setItems] = useState<Scan[]>([]);
  const [nextBefore, setNextBefore] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingMoreRef = useRef(false);
  const router = useRouter();

  const loadFirstPage = useCallback(async () => {
    try {
      const page = await listScans(PAGE_SIZE);
      setItems(page.items);
      setNextBefore(page.next_before);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  // Tải lại mỗi khi mở tab History
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const phone = await AsyncStorage.getItem("phone");
        if (!phone) {
          router.replace("/login");
          return;
        }
        await loadFirstPage();
        setLoading(false);
      })();
    }, [router, loadFirstPage])
  );

  const loadMore = async () => {
    if (!nextBefore || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const page = await listScans(PAGE_SIZE, nextBefore);
      // Trang đầu có thể vừa được tải lại khi quay về tab: bỏ mục trùng
      setItems((prev) => {
        const seen = new Set(prev.map((item) => item.scan_id));
        return [...prev, ...page.items.filter((item) => !seen.has(item.scan_id))];
      });
      setNextBefore(page.next_before);
    } catch (e: any) {
      setError(e.message);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadFirstPage();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[ui.screen, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.scan_id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      style={ui.screen}
      ListHeaderComponent={
        error ? (
          <View style={{ marginBottom: space.md }}>
            <Notice tone="danger" title="Không tải được lịch sử">
              {error}
            </Notice>
          </View>
        ) : undefined
      }
      ListEmptyComponent={
        !error ? (
          <View style={styles.empty}>
            <Ionicons name="leaf-outline" size={64} color={colors.primary} />
            <Text style={styles.emptyTitle}>Chưa có lần chụp nào</Text>
            <Text style={[ui.muted, { textAlign: "center" }]}>
              Chụp lá cà phê để kiểm tra bệnh, kết quả sẽ được lưu ở đây.
            </Text>
            <BigButton
              label="Chụp lá ngay"
              icon="camera"
              onPress={() => router.navigate("/camera")}
              style={{ alignSelf: "stretch" }}
            />
          </View>
        ) : undefined
      }
      ListFooterComponent={
        loadingMore ? <ActivityIndicator size="large" color={colors.primary} style={{ margin: 16 }} /> : undefined
      }
      renderItem={({ item }) => (
        <HistoryItem
          scan={item}
          onPress={() =>
            router.push({ pathname: "/result", params: { scan_id: item.scan_id } })
          }
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: space.md,
    gap: space.sm,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: space.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow,
    gap: space.md,
  },
  itemBody: {
    flex: 1,
    gap: 2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
  },
  imagePlaceholder: {
    backgroundColor: "#E5E2DC",
  },
  titleText: {
    flex: 1,
    fontSize: font.large,
    fontWeight: "bold",
  },
  labelText: {
    fontSize: font.body,
    color: colors.text,
  },
  metaText: {
    fontSize: font.small,
    color: colors.textMuted,
  },
  empty: {
    alignItems: "center",
    gap: space.md,
    paddingTop: space.xl,
  },
  emptyTitle: {
    fontSize: font.title,
    fontWeight: "bold",
    color: colors.text,
  },
});
