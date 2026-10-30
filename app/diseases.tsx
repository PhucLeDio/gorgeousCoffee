import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDiseases } from "utils/ktcfs/api";
import { displayName } from "utils/ktcfs/display";
import { Notice, ui } from "components/ui";
import { colors, font, radius, shadow, space } from "constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { Disease } from "utils/ktcfs/types";

const CACHE_KEY = "ktcfs_diseases";

// Tra cứu 8 lớp bệnh từ GET /diseases, lưu đệm trên máy để xem khi không có mạng.
export default function Diseases() {
  const [diseases, setDiseases] = useState<Disease[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) setDiseases(JSON.parse(cached));
      try {
        const fresh = await getDiseases();
        setDiseases(fresh);
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
      } catch (e: any) {
        if (!cached) setError(e.message);
      }
    })();
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: "Tra cứu bệnh" }} />
      <ScrollView style={ui.screen} contentContainerStyle={styles.content}>
        {!diseases && !error && <ActivityIndicator size="large" color={colors.primary} />}
        {error && (
          <Notice tone="danger" title="Không tải được danh mục bệnh">
            {error}
          </Notice>
        )}
        {diseases?.map((disease) => {
          const healthy = disease.label === "Healthy";
          return (
            <View key={disease.label} style={styles.card}>
              <View style={styles.titleRow}>
                <Ionicons
                  name={healthy ? "checkmark-circle" : "alert-circle"}
                  size={32}
                  color={healthy ? colors.primary : colors.danger}
                />
                <Text style={styles.title}>{displayName(disease)}</Text>
              </View>
              {!!disease.check && (
                <>
                  <Text style={styles.subtitle}>Cách nhận biết</Text>
                  <Text style={ui.body}>{disease.check}</Text>
                </>
              )}
              {!!disease.advice && (
                <>
                  <Text style={styles.subtitle}>Lời khuyên</Text>
                  <Text style={ui.body}>{disease.advice}</Text>
                </>
              )}
            </View>
          );
        })}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: space.md,
    gap: space.md,
  },
  card: {
    padding: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadow,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginBottom: space.xs,
  },
  title: {
    flex: 1,
    fontSize: font.title - 2,
    fontWeight: "bold",
    color: colors.text,
  },
  subtitle: {
    fontSize: font.large,
    fontWeight: "bold",
    color: colors.primaryDark,
    marginTop: space.sm,
  },
});
