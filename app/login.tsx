import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Text, YStack, Button, Input, Label, Separator, H3 } from "tamagui";
import { LogIn, Phone, Lock, User } from "@tamagui/lucide-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AuthScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const url = "http://localhost:8285";

  // const url = "https://cfapi.share.zrok.io";
  const url_post_register = url + "/auth/register";
  const url_post_login = url + "/auth/login";

  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await axios.post(url_post_login, {
        phone,
        password,
      });

      var user_id = response.data.user.user_id;
      var username = response.data.user.username;

      console.log(response.data);
      console.log(user_id);
      console.log(phone);
      console.log(username);

      alert("Đăng nhập thành công!");


      await AsyncStorage.setItem("phone", phone);
      await AsyncStorage.setItem("user_id", user_id);
      await AsyncStorage.setItem("username", username);


      router.replace("/(tabs)/");
    } catch (error) {
      alert(error.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  const handleRegister = async () => {
    if (password.length == 0 || phone.length == 0) {
      alert("Bạn vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const response = await axios.post(url_post_register, {
        username,
        phone,
        password,
      });

      alert(response.data.message);
      console.log("Registered with:", { username, phone, password });
      setIsRegister(false);
    } catch (error) {
      alert(error.response?.data?.message || "Đăng ký thất bại");
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
        <View style={styles.inner}>
          <YStack
            alignItems="center"
            justifyContent="center"
            padding="$5"
            gap="$5"
            style={styles.form}
          >
            <H3 style={styles.header}>
              {isRegister ? "Đăng ký" : "Đăng nhập"}
            </H3>
            <Separator style={styles.separator} />

            {isRegister && (
              <>
                <Label style={styles.label}>Tên người dùng</Label>
                <View style={styles.inputContainer}>
                  <User size={20} style={styles.icon} />
                  <Input
                    placeholder="Nhập tên người dùng"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                  />
                </View>
              </>
            )}

            <Label style={styles.label}>Số điện thoại</Label>
            <View style={styles.inputContainer}>
              <Phone size={20} style={styles.icon} />
              <Input
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
              />
            </View>

            <Label style={styles.label}>Mật khẩu</Label>
            <View style={styles.inputContainer}>
              <Lock size={20} style={styles.icon} />
              <Input
                placeholder="Nhập mật khẩu"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
              />
            </View>

            {isRegister && (
              <>
                <Label style={styles.label}>Xác nhận mật khẩu</Label>
                <View style={styles.inputContainer}>
                  <Lock size={20} style={styles.icon} />
                  <Input
                    placeholder="Nhập lại mật khẩu"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    style={styles.input}
                  />
                </View>
              </>
            )}

            <Button
              onPress={isRegister ? handleRegister : handleLogin}
              backgroundColor="blue"
              color="white"
              width="100%"
              style={styles.button}
            >
              {isRegister ? "Đăng ký" : "Đăng nhập"}
            </Button>

            <TouchableOpacity
              onPress={() => setIsRegister(!isRegister)}
              style={styles.toggle}
            >
              <Text style={styles.toggleText}>
                {isRegister
                  ? "Đã có tài khoản? Đăng nhập ngay"
                  : "Chưa có tài khoản? Đăng ký"}
              </Text>
            </TouchableOpacity>
          </YStack>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  inner: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    color: "#333",
  },
  separator: {
    marginVertical: 10,
    width: "50%",
    height: 1,
    backgroundColor: "#ccc",
  },
  form: {
    width: "100%",
    maxWidth: 400,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 5,
    color: "#555",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  icon: {
    marginLeft: 10,
    marginRight: 10,
    color: "#007bff",
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  button: {
    borderRadius: 99999,
    paddingVertical: 12,
    backgroundColor: "#007bff",
    marginTop: 10,
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  toggle: {
    marginTop: 15,
  },
  toggleText: {
    color: "#007bff",
    textDecorationLine: "underline",
  },
});
