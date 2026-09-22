import { ScrollView, Image, View, StyleSheet } from "react-native";
import { Paragraph, SizableText, YStack } from "tamagui";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function History() {
  const [items, setItems] = useState([]); // State lưu danh sách dữ liệu từ API
  const [loading, setLoading] = useState(true); // State kiểm tra trạng thái tải dữ liệu
  const router = useRouter();

  const labels = {
    "1": "Miner",
    "2": "Rust",
    "3": "Phoma",
    "4": "Cercospora",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const phone = await AsyncStorage.getItem("phone");
        if (!phone) {
          router.replace("/login");
          return;
        }

        const user_id = await AsyncStorage.getItem("user_id");
        const response = await fetch(
          `http://localhost:8285/histories/${user_id}`
        );
        if (response.ok) {
          setLoading(false);

          const data = await response.json();
          setItems(data);
        } else {
          console.error("Failed to fetch data: ", response.status);
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    // Gọi hàm fetch lần đầu
    fetchData();

    // Định kỳ gọi fetch mỗi 30 giây
    const interval = setInterval(fetchData, 30000); 

    return () => clearInterval(interval); // Dọn dẹp interval khi component unmount
  }, [router]);

  if (loading) {
    return (
      <YStack alignItems="center" justifyContent="center" flex={1}>
        <SizableText size="$3">Loading...</SizableText>
      </YStack>
    );
  }

  return (
    <ScrollView>
      <YStack gap="$2" alignItems="center">
        <SizableText size="$3" style={styles.headerText}>
          History
        </SizableText>
        {items.map((item) => (
          <YStack
            key={item.id} // Sử dụng `id` từ API làm key
            gap="$2"
            alignItems="center"
            style={styles.itemContainer}
          >
            <SizableText size="$2" style={styles.labelText}>
              {new Date(item.created_at).toLocaleDateString()}{" "}
              {/* Format ngày */}
            </SizableText>
            <Image source={{ uri: item.image_url }} style={styles.image} />
            <SizableText size="$2" style={styles.labelText}>
              Result: {labels[item.result]} (Confidence: {item.confidence})
            </SizableText>
          </YStack>
        ))}
      </YStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    marginBottom: 10,
    width: "70%",
  },
  image: {
    width: 200,
    height: 300,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  headerText: {
    color: "#000000",
  },
  labelText: {
    color: "#000000",
  },
  infoText: {
    color: "#000000",
  },
});
