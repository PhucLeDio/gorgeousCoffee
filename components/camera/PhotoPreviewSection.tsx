import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { CapturedLeaf, useScanUpload } from "utils/useScanUpload";
import { BigButton, Notice } from "components/ui";
import { colors, font, radius, space } from "constants/theme";

const PhotoPreviewSection = ({
  photo,
  handleRetakePhoto,
}: {
  photo: CapturedLeaf;
  handleRetakePhoto: () => void;
}) => {
  const { sending, error, retryAt, canResend, send } = useScanUpload(photo);
  const [now, setNow] = useState(Date.now());

  // Đếm ngược tới lần tự gửi lại
  useEffect(() => {
    if (!retryAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [retryAt]);

  const secondsLeft = retryAt ? Math.max(0, Math.ceil((retryAt - now) / 1000)) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Ảnh đã rõ lá chưa?</Text>
      <Image style={styles.preview} source={{ uri: photo.uri }} resizeMode="contain" />
      <Text style={styles.metaText}>
        Vị trí chụp: sai số ±{Math.round(photo.accuracyM)} m
      </Text>

      {error && (
        <Notice tone={retryAt ? "warning" : "danger"} title="Chưa gửi được ảnh">
          <Text style={styles.noticeText}>{error}</Text>
          {retryAt && (
            <Text style={styles.noticeText}>
              Ảnh vẫn được giữ trên máy. Tự gửi lại sau {secondsLeft} giây.
            </Text>
          )}
        </Notice>
      )}

      {sending && (
        <Notice tone="info" title="Đang kiểm tra ảnh...">
          <Text style={styles.noticeText}>Vui lòng chờ trong giây lát.</Text>
        </Notice>
      )}

      <View style={styles.buttons}>
        {canResend && (
          <BigButton
            label={error ? "Gửi lại" : "Gửi kiểm tra"}
            icon={error ? "refresh" : "checkmark-circle"}
            onPress={send}
            loading={sending}
          />
        )}
        {/* Khi không gửi lại được, "Chụp lại" thành nút chính */}
        <BigButton
          label="Chụp lại"
          icon="camera"
          variant={canResend ? "secondary" : "primary"}
          onPress={handleRetakePhoto}
          disabled={sending}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: space.md,
    gap: space.md,
  },
  title: {
    fontSize: font.title,
    fontWeight: "bold",
    color: colors.text,
  },
  preview: {
    width: "100%",
    aspectRatio: 3 / 4,
    maxHeight: 460,
    borderRadius: radius.lg,
    backgroundColor: "#222",
  },
  metaText: {
    fontSize: font.small,
    color: colors.textMuted,
  },
  noticeText: {
    fontSize: font.body,
    lineHeight: 27,
    color: colors.text,
  },
  buttons: {
    gap: space.sm,
  },
});

export default PhotoPreviewSection;
