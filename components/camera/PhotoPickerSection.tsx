import React, { useState, useEffect } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { CameraCapturedPicture } from "expo-camera";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PhotoPickerSection = ({
  photo,
  handleRetakePhoto,
}: {
  photo;
  handleRetakePhoto: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [cause, setCause] = useState<string | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [prePhoto, setPrephoto] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );

  const router = useRouter();

  useEffect(() => {
    const getLocation = async () => {
      try {
        // const { status } = await Location.requestForegroundPermissionsAsync();
        // if (status !== 'granted') {
        //   console.error('Permission to access location was denied');
        //   return;
        // }

        const location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };

    getLocation();
  }, []);

  const handleCheckPhoto = async () => {
    setLoading(true);
    try {
      const user_id = await AsyncStorage.getItem("user_id");
      if (!user_id) {
        throw new Error("Không tìm thấy user_id trong AsyncStorage.");
      }
      const formData = new FormData();
      formData.append("file", {
        uri: photo.uri,
        type: "image/jpeg",
        name: "photo.jpg",
      } as any); // Bypass TypeScript type check
      formData.append("user_id", user_id);
      formData.append(
        "croods",
        `${location?.coords.latitude},${location?.coords.longitude}`
      );

      const response = await fetch(
        "http://localhost:8285/predictor/predict",
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResult(
          `Tên bệnh: ${data.result.name}\nNguyên nhân: ${data.result.cause}\nGiải pháp: ${data.result.solution}`
        );
        setName(data.result.name);
        setCause(data.result.cause);
        setSolution(data.result.solution);
        setPrephoto(data.image_url);

        // router.replace('/result');
      } else {
        setResult(`Lỗi: ${data.message || "Không thể dự đoán"}`);
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Vui lòng thử lại",
          text1Style: { fontSize: 20 },
          text2Style: { fontSize: 16 },
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setResult("Đã xảy ra lỗi khi gửi API.");
    } finally {
      setLoading(false);

      if (name && cause && solution && prePhoto) {
        router.push({
          pathname: "/result",
          params: {
            name,
            cause,
            solution,
            uri: prePhoto,
          },
        });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.box}>
        <Image style={styles.previewContainer} source={{ uri: photo.uri }} />
      </View>

      <View style={styles.redPoint} />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleRetakePhoto}>
          <EvilIcons name="trash" size={44} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleCheckPhoto}>
          <AntDesign name="check" size={44} color="black" />
        </TouchableOpacity>
      </View>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    borderRadius: 15,
    padding: 1,
    width: "95%",
    backgroundColor: "darkgray",
    justifyContent: "center",
    alignItems: "center",
  },
  previewContainer: {
    width: "75%",
    height: "75%",
    borderRadius: 15,
  },
  buttonContainer: {
    gap: 20,
    marginTop: "4%",
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  button: {
    backgroundColor: "gray",
    borderRadius: 25,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "15%",
  },
  redPoint: {
    position: "absolute",
    top: "40%",
    left: "50%",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "red",
    transform: [{ translateX: -5 }, { translateY: -5 }],
  },
});

export default PhotoPickerSection;
