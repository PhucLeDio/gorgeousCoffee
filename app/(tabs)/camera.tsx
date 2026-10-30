import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import PhotoPreviewSection from "../../components/camera/PhotoPreviewSection";
import { useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CapturedLeaf } from "utils/useScanUpload";
import { GOOD_ACCURACY_M, prepareScanImage } from "utils/ktcfs/capture";
import { colors, font, radius, space } from "constants/theme";
import { BigButton } from "components/ui";

type GpsFix = { lat: number; lon: number; accuracy: number; timestamp: number };

const MAX_FIX_AGE_MS = 60 * 1000;

// Ảnh chỉ được chụp bằng camera trong app (không chọn từ thư viện), khi người dùng
// đang đứng trong vườn và GPS đủ chính xác (quy tắc chụp của KTCFS).
export default function Camera() {
  const router = useRouter();
  const cameraRef = useRef<CameraView | null>(null);

  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [locationDenied, setLocationDenied] = useState(false);
  const [fix, setFix] = useState<GpsFix | null>(null);
  const [processing, setProcessing] = useState(false);
  const [photo, setPhoto] = useState<CapturedLeaf | null>(null); // Quản lý ảnh chụp

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const phone = await AsyncStorage.getItem("phone");
        if (!phone) router.replace("/login");
      } catch (error) {
        console.error("Error reading AsyncStorage:", error);
      }
    };
    checkLoginStatus();
  }, [router]);

  // Theo dõi GPS khi đang mở tab camera
  useFocusEffect(
    useCallback(() => {
      let subscription: Location.LocationSubscription | null = null;
      let cancelled = false;
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationDenied(true);
          return;
        }
        setLocationDenied(false);
        const sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 0 },
          (position) =>
            setFix({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
              accuracy: position.coords.accuracy ?? Infinity,
              timestamp: position.timestamp,
            })
        );
        if (cancelled) sub.remove();
        else subscription = sub;
      })().catch((error) => console.error("Error watching location:", error));
      return () => {
        cancelled = true;
        subscription?.remove();
      };
    }, [])
  );

  if (!permission) return <View />; // Chưa load xong quyền truy cập camera
  if (!permission.granted)
    return (
      <View style={styles.permission}>
        <Ionicons name="camera" size={72} color={colors.primary} />
        <Text style={styles.permissionTitle}>Cho phép dùng máy ảnh</Text>
        <Text style={styles.permissionText}>
          Ứng dụng cần máy ảnh để chụp lá cà phê và kiểm tra bệnh.
        </Text>
        <BigButton label="Cho phép" icon="checkmark" onPress={requestPermission} />
      </View>
    );

  const fixFresh = fix && Date.now() - fix.timestamp < MAX_FIX_AGE_MS;
  const gpsReady = !!fix && fixFresh && fix.accuracy < GOOD_ACCURACY_M;

  // Hàm đổi hướng camera
  const toggleCameraFacing = () => setFacing((prev) => (prev === "back" ? "front" : "back"));

  // Hàm chụp ảnh: ghi lại vị trí và thời điểm chụp ngay lúc bấm
  const handleTakePhoto = async () => {
    if (!cameraRef.current || !fix || !gpsReady || processing) return;
    const capturedAt = new Date();
    const position = fix;
    setProcessing(true);
    try {
      const picture = await cameraRef.current.takePictureAsync({ quality: 1 });
      const image = await prepareScanImage(picture.uri);
      setPhoto({
        uri: image.uri,
        lat: position.lat,
        lon: position.lon,
        accuracyM: position.accuracy,
        capturedAt,
      });
    } catch (error) {
      console.error("Error taking photo:", error);
      alert("Không chụp được ảnh, hãy thử lại.");
    } finally {
      setProcessing(false);
    }
  };

  // Hàm làm lại hoặc reset ảnh
  const handleRetakePhoto = () => setPhoto(null);

  if (photo)
    return <PhotoPreviewSection photo={photo} handleRetakePhoto={handleRetakePhoto} />;

  // Ô định vị: xanh khi đủ chính xác để chụp, cam khi còn chờ
  let gpsTitle = "Đang tìm vị trí...";
  let gpsHint = "Đứng yên ở chỗ thoáng trong vườn";
  if (locationDenied) {
    gpsTitle = "Chưa có quyền vị trí";
    gpsHint = "Cần bật vị trí để biết bạn đang đứng trong vườn";
  } else if (fix && fixFresh) {
    gpsTitle = gpsReady
      ? `Định vị tốt ±${Math.round(fix.accuracy)} m`
      : `Đang định vị ±${Math.round(fix.accuracy)} m`;
    gpsHint = gpsReady
      ? "Có thể chụp được rồi"
      : `Chờ dưới ${GOOD_ACCURACY_M} m, ra chỗ thoáng, tránh tán cây dày`;
  }

  let shutterLabel = "Bấm để chụp";
  if (processing) shutterLabel = "Đang xử lý ảnh...";
  else if (!gpsReady) shutterLabel = "Chờ định vị xanh";

  // Giao diện camera chính
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={[styles.gpsBadge, gpsReady ? styles.gpsGood : styles.gpsWaiting]}>
          <Ionicons
            name={gpsReady ? "checkmark-circle" : "locate"}
            size={30}
            color="white"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.gpsTitle}>{gpsTitle}</Text>
            <Text style={styles.gpsHint}>{gpsHint}</Text>
          </View>
        </View>
        {/* Khung đặt lá */}
        <View style={styles.frame} pointerEvents="none">
          <Text style={styles.frameText}>Đặt lá vào giữa khung</Text>
        </View>
      </CameraView>

      <View style={styles.controls}>
        {/* Nút đổi camera trước/sau */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Đổi camera"
          style={styles.sideButton}
          onPress={toggleCameraFacing}
        >
          <Ionicons name="camera-reverse" size={32} color="white" />
          <Text style={styles.sideLabel}>Đổi camera</Text>
        </Pressable>

        {/* Nút chụp */}
        <View style={styles.shutterWrap}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Chụp ảnh"
            onPress={handleTakePhoto}
            disabled={!gpsReady || processing}
            style={[styles.shutter, (!gpsReady || processing) && styles.shutterDisabled]}
          >
            {processing ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <Ionicons name="camera" size={40} color={colors.primary} />
            )}
          </Pressable>
          <Text style={styles.shutterLabel}>{shutterLabel}</Text>
        </View>

        <View style={styles.sideButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  permission: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: space.lg,
    gap: space.md,
    backgroundColor: colors.background,
  },
  permissionTitle: {
    fontSize: font.title,
    fontWeight: "bold",
    color: colors.text,
  },
  permissionText: {
    fontSize: font.body,
    lineHeight: 27,
    color: colors.textMuted,
    textAlign: "center",
  },
  camera: {
    flex: 1,
  },
  gpsBadge: {
    position: "absolute",
    top: space.md,
    left: space.md,
    right: space.md,
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
  },
  gpsGood: {
    backgroundColor: "rgba(27, 94, 32, 0.92)",
  },
  gpsWaiting: {
    backgroundColor: "rgba(191, 54, 12, 0.92)",
  },
  gpsTitle: {
    color: "white",
    fontSize: font.large,
    fontWeight: "bold",
  },
  gpsHint: {
    color: "white",
    fontSize: font.small,
  },
  frame: {
    position: "absolute",
    top: "24%",
    left: "12%",
    right: "12%",
    bottom: "8%",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: radius.lg,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: space.sm,
  },
  frameText: {
    color: "white",
    fontSize: font.small,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    backgroundColor: "black",
  },
  sideButton: {
    width: 90,
    alignItems: "center",
    gap: 4,
  },
  sideLabel: {
    color: "white",
    fontSize: 14,
  },
  shutterWrap: {
    alignItems: "center",
    gap: space.xs,
  },
  shutter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "white",
    borderWidth: 6,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterDisabled: {
    opacity: 0.4,
  },
  shutterLabel: {
    color: "white",
    fontSize: font.small,
    fontWeight: "bold",
  },
});
