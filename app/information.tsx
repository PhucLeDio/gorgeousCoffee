import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Text, Input, Button, YStack } from "tamagui";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EditInfo() {
  const router = useRouter();

  const [name, setName] = useState("Nguyễn Văn A");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        const value = await AsyncStorage.getItem("phone");
        if (value !== null) {
          setPhone(value);
        } else {
          router.replace("/login");
        }
      } catch (e) {
        console.error("Error reading value:", e);
      }
    };

    getData(); // Gọi hàm lấy dữ liệu
  }, [router]); // Chạy lại mỗi khi router thay đổi

  return (
    <View style={{ backgroundColor: "white", flex: 1, padding: 20 }}>
      <YStack gap="$4">
        <Text fontWeight="bold">Tên</Text>
        <Input
          value={name}
          onChangeText={setName}
          placeholder="Nhập tên của bạn"
        />
        <Text fontWeight="bold">Phone number</Text>
        <Input
          value={phone}
          onChangeText={setPhone}
          placeholder="Nhập số điện thoại của bạn"
        />
        <Button
          color="white"
          backgroundColor="#4CAF50"
          onPress={() => {
            alert("Thông tin đã được lưu!");
          }}
        >
          Lưu thông tin
        </Button>
      </YStack>
    </View>
  );
}
