import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, font, radius, shadow, space, touch } from "constants/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

// Nút lớn có biểu tượng và chữ, dễ bấm bằng ngón tay cái
export function BigButton({
  label,
  icon,
  onPress,
  variant = "primary",
  disabled,
  loading,
  style,
}: {
  label: string;
  icon?: IconName;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const palette = {
    primary: { bg: colors.primary, fg: "#fff", border: colors.primary },
    secondary: { bg: colors.surface, fg: colors.primaryDark, border: colors.primary },
    danger: { bg: colors.surface, fg: colors.danger, border: colors.danger },
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.bg, borderColor: palette.border },
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        icon && <Ionicons name={icon} size={26} color={palette.fg} />
      )}
      <Text style={[styles.buttonText, { color: palette.fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
}

// Hộp thông báo có màu theo mức độ: lỗi, cảnh báo, thông tin
export function Notice({
  tone,
  title,
  children,
  icon,
}: {
  tone: "danger" | "warning" | "info" | "success";
  title?: string;
  children?: React.ReactNode;
  icon?: IconName;
}) {
  const palette = {
    danger: { bg: colors.dangerSoft, fg: colors.danger, icon: "alert-circle" },
    warning: { bg: colors.warningSoft, fg: colors.warning, icon: "warning" },
    info: { bg: colors.infoSoft, fg: colors.info, icon: "information-circle" },
    success: { bg: colors.primarySoft, fg: colors.primaryDark, icon: "checkmark-circle" },
  }[tone];
  return (
    <View style={[styles.notice, { backgroundColor: palette.bg, borderColor: palette.fg }]}>
      <Ionicons name={icon ?? (palette.icon as IconName)} size={28} color={palette.fg} />
      <View style={{ flex: 1 }}>
        {title && <Text style={[styles.noticeTitle, { color: palette.fg }]}>{title}</Text>}
        {typeof children === "string" ? (
          <Text style={styles.noticeText}>{children}</Text>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

// Dòng menu lớn: biểu tượng, tiêu đề, mô tả ngắn, mũi tên
export function MenuRow({
  icon,
  title,
  subtitle,
  onPress,
  color = colors.primary,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
    >
      <View style={[styles.menuIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={28} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={26} color={colors.textMuted} />
    </Pressable>
  );
}

export const ui = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    fontSize: font.body,
    lineHeight: 27,
    color: colors.text,
  },
  muted: {
    fontSize: font.small,
    lineHeight: 24,
    color: colors.textMuted,
  },
});

const styles = StyleSheet.create({
  button: {
    minHeight: touch.min,
    borderRadius: radius.md,
    borderWidth: 2,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
  },
  buttonText: {
    fontSize: font.large,
    fontWeight: "bold",
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.75,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    ...shadow,
  },
  sectionTitle: {
    fontSize: font.title,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: space.sm,
  },
  notice: {
    flexDirection: "row",
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 2,
  },
  noticeTitle: {
    fontSize: font.large,
    fontWeight: "bold",
    marginBottom: 4,
  },
  noticeText: {
    fontSize: font.body,
    lineHeight: 27,
    color: colors.text,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    minHeight: 76,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadow,
  },
  menuIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTitle: {
    fontSize: font.large,
    fontWeight: "bold",
    color: colors.text,
  },
  menuSubtitle: {
    fontSize: font.small,
    color: colors.textMuted,
    marginTop: 2,
  },
});
