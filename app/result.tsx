import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import ScanImage from "components/scan/ScanImage";
import { BigButton, Card, Notice, SectionTitle, ui } from "components/ui";
import { colors, font, radius, space } from "constants/theme";
import { getScan } from "utils/ktcfs/api";
import {
  LABEL_COLORS,
  displayName,
  formatDateTime,
  formatPercent,
  statusOf,
} from "utils/ktcfs/display";
import type { Scan } from "utils/ktcfs/types";

// Kết quả một lần chụp. Kết luận đặt lên đầu bằng chữ to và màu theo tình trạng;
// ca chưa chắc chắn (top2 khác null) phải nêu cả hai khả năng, không kết luận một bệnh.
export default function Result() {
  const { scan_id } = useLocalSearchParams<{ scan_id: string }>();
  const router = useRouter();
  const [scan, setScan] = useState<Scan | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!scan_id) return;
    getScan(scan_id)
      .then(setScan)
      .catch((error) => setLoadError(error.message));
  }, [scan_id]);

  if (!scan) {
    return (
      <View style={styles.centered}>
        {loadError ? (
          <Notice tone="danger" title="Không mở được kết quả">
            {loadError}
          </Notice>
        ) : (
          <ActivityIndicator size="large" color={colors.primary} />
        )}
      </View>
    );
  }

  const { result, garden } = scan;
  const uncertain = !!result.top2;
  const status = statusOf(result);
  const hasNematode = result.label === "Nematode" || result.top2?.label === "Nematode";

  return (
    <ScrollView
      style={ui.screen}
      contentContainerStyle={styles.content}
    >
      {/* Kết luận */}
      <View style={[styles.verdict, { backgroundColor: status.soft, borderColor: status.color }]}>
        <View style={styles.verdictHeader}>
          <Ionicons name={status.icon} size={44} color={status.color} />
          <Text style={[styles.verdictTitle, { color: status.color }]}>
            {uncertain ? "Chưa chắc chắn" : displayName(result)}
          </Text>
        </View>
        {uncertain ? (
          <>
            <Text style={ui.body}>Có thể là một trong hai bệnh:</Text>
            {[result, result.top2!].map((item, index) => (
              <View key={item.label} style={styles.candidate}>
                <Text style={styles.candidateNumber}>{index + 1}</Text>
                <Text style={styles.candidateText}>{displayName(item)}</Text>
                <Text style={styles.candidatePercent}>{formatPercent(item.confidence)}</Text>
              </View>
            ))}
            <Text style={[ui.body, { fontWeight: "bold" }]}>
              {result.note ||
                "Hãy kiểm tra lại trên cây theo hướng dẫn bên dưới trước khi xử lý."}
            </Text>
          </>
        ) : (
          <>
            <Text style={ui.body}>
              Độ tin cậy:{" "}
              <Text style={{ fontWeight: "bold" }}>{formatPercent(result.confidence)}</Text>
            </Text>
            {!!result.note && <Text style={ui.body}>{result.note}</Text>}
          </>
        )}
      </View>

      <ScanImage scanId={scan.scan_id} result={result} maxHeight={360} />
      {result.boxes.length > 0 && (
        <Text style={[ui.muted, { textAlign: "center" }]}>
          Khung đỏ là chỗ nghi bị bệnh trên lá
        </Text>
      )}

      {/* Việc cần làm */}
      {!!result.check && (
        <Card style={uncertain && { borderColor: colors.warning, borderWidth: 2 }}>
          <View style={styles.sectionHeader}>
            <Ionicons name="search" size={28} color={colors.primary} />
            <SectionTitle style={styles.sectionTitle}>Kiểm tra lại trên cây</SectionTitle>
          </View>
          <Text style={ui.body}>{result.check}</Text>
        </Card>
      )}

      {hasNematode && (
        <Notice tone="warning" title="Tuyến trùng: chỉ là nghi ngờ">
          Tuyến trùng gây bệnh ở rễ, ảnh lá chỉ cho phép nghi ngờ. Cần đào kiểm tra rễ để
          xác nhận.
        </Notice>
      )}

      {!!result.advice && (
        <Card>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={28} color={colors.primary} />
            <SectionTitle style={styles.sectionTitle}>Lời khuyên</SectionTitle>
          </View>
          <Text style={ui.body}>{result.advice}</Text>
        </Card>
      )}

      {/* Thông tin lần chụp */}
      <Card style={{ gap: space.sm }}>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={26} color={colors.textMuted} />
          <Text style={[ui.body, { flex: 1 }]}>
            {garden
              ? `Vườn ${garden.polygon_id} · xã ${garden.commune_name} · ${garden.area_ha} ha`
              : "Không xác định được vườn"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time" size={26} color={colors.textMuted} />
          <Text style={[ui.body, { flex: 1 }]}>Chụp lúc {formatDateTime(scan.captured_at)}</Text>
        </View>
        {(result.is_disease || uncertain) && (
          <View style={styles.infoRow}>
            <Ionicons name="map" size={26} color={colors.textMuted} />
            <Text style={[ui.body, { flex: 1 }]}>
              {scan.recorded_on_map
                ? "Đã báo lên bản đồ dịch bệnh của xã"
                : "Chưa ghi lên bản đồ của xã"}
            </Text>
          </View>
        )}
      </Card>

      {/* Xác suất 8 loại: ẩn mặc định cho đỡ rối */}
      <Pressable
        accessibilityRole="button"
        onPress={() => setShowDetails((value) => !value)}
        style={styles.detailsToggle}
      >
        <Text style={styles.detailsToggleText}>
          {showDetails ? "Ẩn chi tiết" : "Xem chi tiết các khả năng"}
        </Text>
        <Ionicons
          name={showDetails ? "chevron-up" : "chevron-down"}
          size={24}
          color={colors.primaryDark}
        />
      </Pressable>
      {showDetails && (
        <Card style={{ gap: space.sm }}>
          {result.probabilities.map((item) => (
            <View key={item.label}>
              <View style={styles.probHeader}>
                <Text style={ui.body}>{displayName(item)}</Text>
                <Text style={[ui.body, { fontWeight: "bold" }]}>
                  {formatPercent(item.confidence)}
                </Text>
              </View>
              <View style={styles.probTrack}>
                <View
                  style={[
                    styles.probBar,
                    {
                      width: `${Math.max(1, item.confidence * 100)}%`,
                      backgroundColor: LABEL_COLORS[item.label],
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </Card>
      )}

      <BigButton
        label="Chụp lá khác"
        icon="camera"
        variant="secondary"
        onPress={() => router.navigate("/camera")}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: space.lg,
    backgroundColor: colors.background,
  },
  content: {
    padding: space.md,
    gap: space.md,
    paddingBottom: space.xl,
  },
  verdict: {
    borderWidth: 2,
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.sm,
  },
  verdictHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  verdictTitle: {
    flex: 1,
    fontSize: font.hero,
    fontWeight: "bold",
  },
  candidate: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.sm,
  },
  candidateNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    textAlign: "center",
    lineHeight: 32,
    fontSize: font.body,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: colors.warning,
    overflow: "hidden",
  },
  candidateText: {
    flex: 1,
    fontSize: font.large,
    fontWeight: "bold",
    color: colors.text,
  },
  candidatePercent: {
    fontSize: font.body,
    color: colors.textMuted,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginBottom: space.xs,
  },
  sectionTitle: {
    marginBottom: 0,
    fontSize: font.large + 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  detailsToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
    minHeight: 48,
  },
  detailsToggleText: {
    fontSize: font.body,
    fontWeight: "bold",
    color: colors.primaryDark,
    textDecorationLine: "underline",
  },
  probHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  probTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#EAE8E3",
    overflow: "hidden",
    marginTop: 4,
  },
  probBar: {
    height: "100%",
    borderRadius: 6,
  },
});
