import { CameraView, useCameraPermissions } from "expo-camera";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import PhotoPreviewSection from "../../components/camera/PhotoPreviewSection";
import { useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CapturedLeaf } from "utils/useScanUpload";
import {
  GOOD_ACCURACY_M,
  LEAF_FRAME,
  PHOTO_ASPECT,
  prepareScanImage,
} from "utils/ktcfs/capture";
import { colors, font, radius, space } from "constants/theme";
import { BigButton } from "components/ui";

type GpsFix = { lat: number; lon: number; accuracy: number; timestamp: number };

const MAX_FIX_AGE_MS = 60 * 1000;
// Chờ một nhịp sau khi bấm cho tay hết rung rồi mới chụp
const STEADY_DELAY_MS = 600;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Ảnh chỉ được chụp bằng camera trong app (không chọn từ thư viện), khi người dùng
// đang đứng trong vườn và GPS đủ chính xác (quy tắc chụp của KTCFS).
export default function Camera() {
  const router = useRouter();
  const cameraRef = useRef<CameraView | null>(null);

  const [torch, setTorch] = useState(false);
  const [steadying, setSteadying] = useState(false);
  const [area, setArea] = useState({ width: 0, height: 0 });
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
        setTorch(false);
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

  // Hàm chụp ảnh: ghi lại vị trí và thời điểm chụp ngay lúc bấm, nhắc giữ yên máy
  // một nhịp cho tay hết rung rồi mới chụp
  const handleTakePhoto = async () => {
    if (!cameraRef.current || !fix || !gpsReady || processing) return;
    const capturedAt = new Date();
    const position = fix;
    setProcessing(true);
    setSteadying(true);
    try {
      await wait(STEADY_DELAY_MS);
      if (!cameraRef.current) return;
      const picture = await cameraRef.current.takePictureAsync({ quality: 1 });
      setSteadying(false);
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
      setSteadying(false);
      setProcessing(false);
    }
  };

  // Vùng camera đúng tỉ lệ 3:4 như ảnh chụp, lớn nhất vừa chỗ trống
  const onCameraAreaLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setArea({ width, height });
  };
  const cameraWidth = Math.min(area.width, area.height * PHOTO_ASPECT);
  const cameraHeight = cameraWidth / PHOTO_ASPECT;

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
  if (steadying) shutterLabel = "Giữ yên máy...";
  else if (processing) shutterLabel = "Đang xử lý ảnh...";
  else if (!gpsReady) shutterLabel = "Chờ định vị xanh";

  // Giao diện camera chính
  return (
    <View style={styles.container}>
      <View style={[styles.gpsBadge, gpsReady ? styles.gpsGood : styles.gpsWaiting]}>
        <Ionicons name={gpsReady ? "checkmark-circle" : "locate"} size={30} color="white" />
        <View style={{ flex: 1 }}>
          <Text style={styles.gpsTitle}>{gpsTitle}</Text>
          <Text style={styles.gpsHint}>{gpsHint}</Text>
        </View>
      </View>

      <View style={styles.cameraArea} onLayout={onCameraAreaLayout}>
        {cameraWidth > 0 && (
          <View style={{ width: cameraWidth, height: cameraHeight }}>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              ratio="4:3"
              enableTorch={torch}
              ref={cameraRef}
            />
            {/* Khung đặt lá: ảnh gửi đi được cắt đúng theo khung này */}
            <View
              pointerEvents="none"
              style={[
                styles.frame,
                {
                  left: `${LEAF_FRAME.x * 100}%`,
                  top: `${LEAF_FRAME.y * 100}%`,
                  width: `${LEAF_FRAME.width * 100}%`,
                  height: `${LEAF_FRAME.height * 100}%`,
                },
              ]}
            />
            {steadying && (
              <View pointerEvents="none" style={styles.steady}>
                <Ionicons name="hand-left" size={44} color="white" />
                <Text style={styles.steadyText}>Giữ yên máy...</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.controls}>
        {/* Nút đèn: chụp dưới tán cây tối */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={torch ? "Tắt đèn" : "Bật đèn"}
          style={[styles.sideButton, torch && styles.sideButtonActive]}
          onPress={() => setTorch((value) => !value)}
        >
          <Ionicons name={torch ? "flashlight" : "flashlight-outline"} size={30} color="white" />
          <Text style={styles.sideLabel}>{torch ? "Tắt đèn" : "Bật đèn"}</Text>
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
            {processing && !steadying ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <Ionicons name="camera" size={40} color={colors.primary} />
            )}
          </Pressable>
          <Text style={styles.shutterLabel}>{shutterLabel}</Text>
        </View>

        <View style={styles.sideButtonSpacer} />
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
  cameraArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  gpsBadge: {
    margin: space.sm,
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
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: radius.lg,
    borderStyle: "dashed",
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
    paddingVertical: space.xs,
    borderRadius: radius.md,
  },
  sideButtonActive: {
    backgroundColor: "rgba(255, 213, 79, 0.35)",
  },
  sideButtonSpacer: {
    width: 90,
  },
  steady: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  steadyText: {
    color: "white",
    fontSize: font.title,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowRadius: 6,
  },
  sideLabel: {
    color: "white",
    fontSize: font.small,
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
