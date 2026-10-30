import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { login } from "utils/ktcfs/api";
import { BigButton, Notice } from "components/ui";
import { LogoMark } from "components/Logo";
import { colors, font, radius, space, touch } from "constants/theme";

// Đăng nhập bằng tài khoản KTCFS (nông hộ, HTX, cán bộ xã). Tài khoản do xã cấp,
// app không có đăng ký.
export default function AuthScreen() {
  const [loginId, setLoginId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleLogin = async () => {
    if (loginId.trim().length == 0 || password.length == 0) {
      setError("Bạn vui lòng điền đầy đủ số điện thoại và mật khẩu.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await login(loginId, password);
      router.replace("/");
    } catch (e: any) {
      setError(e.message || "Đăng nhập thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brand}>
          <LogoMark size={104} onDark />
          <Text style={styles.appName}>
            Lá <Text style={{ color: "#FFE0B2" }}>Cà Phê</Text>
          </Text>
          <Text style={styles.tagline}>Chụp lá – biết bệnh – chữa kịp thời</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.header}>Đăng nhập</Text>

          <Text style={styles.label}>Số điện thoại</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="call" size={26} color={colors.primary} />
            <TextInput
              placeholder="Ví dụ: 0912 345 678"
              placeholderTextColor={colors.textMuted}
              keyboardType={Platform.OS === "web" ? "default" : "phone-pad"}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              textContentType="username"
              value={loginId}
              onChangeText={setLoginId}
              style={styles.input}
            />
          </View>
          <Text style={styles.helper}>Có thể nhập email nếu tài khoản dùng email.</Text>

          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={26} color={colors.primary} />
            <TextInput
              placeholder="Nhập mật khẩu"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              // Khi bấm hiện mật khẩu, bàn phím không được tự sửa chữ
              autoCorrect={false}
              spellCheck={false}
              autoComplete="password"
              textContentType="password"
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleLogin}
              style={styles.input}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              onPress={() => setShowPassword((value) => !value)}
              style={styles.eye}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={26}
                color={colors.textMuted}
              />
            </Pressable>
          </View>

          {error && (
            <Notice tone="danger" title="Chưa đăng nhập được">
              {error}
            </Notice>
          )}

          <BigButton
            label={submitting ? "Đang đăng nhập..." : "Đăng nhập"}
            icon="log-in"
            onPress={handleLogin}
            loading={submitting}
            style={{ marginTop: space.sm }}
          />

          <Text style={styles.hintText}>
            Dùng tài khoản KTCFS do xã cấp. Chưa có tài khoản hoặc quên mật khẩu, hãy liên hệ
            cán bộ xã.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: space.md,
    gap: space.lg,
  },
  brand: {
    alignItems: "center",
    gap: 4,
  },
  appName: {
    fontSize: font.hero + 6,
    fontWeight: "800",
    color: "#fff",
    marginTop: space.sm,
  },
  tagline: {
    fontSize: font.body,
    color: "#fff",
  },
  form: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.sm,
  },
  header: {
    fontSize: font.title + 2,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: space.xs,
  },
  label: {
    fontSize: font.large,
    fontWeight: "bold",
    color: colors.text,
    marginTop: space.xs,
  },
  helper: {
    fontSize: font.small,
    color: colors.textMuted,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    minHeight: touch.min + 4,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    paddingLeft: space.md,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minWidth: 0, // trên web ô nhập có bề rộng mặc định, đẩy nút con mắt ra ngoài
    alignSelf: "stretch",
    fontSize: font.large,
    color: colors.text,
  },
  eye: {
    width: touch.min,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
  },
  hintText: {
    marginTop: space.sm,
    fontSize: font.small,
    lineHeight: 24,
    color: colors.textMuted,
    textAlign: "center",
  },
});
