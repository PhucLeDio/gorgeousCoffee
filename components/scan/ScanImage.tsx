import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import { getScanImageUri } from "utils/ktcfs/api";
import { formatPercent } from "utils/ktcfs/display";
import type { ScanResult } from "utils/ktcfs/types";

export function useScanImage(scanId: string) {
  const [uri, setUri] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setUri(null);
    setFailed(false);
    getScanImageUri(scanId)
      .then((value) => active && setUri(value))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [scanId]);

  return { uri, failed };
}

// Ảnh lần chụp kèm khung vùng nghi tổn thương. Toạ độ boxes tính trên ảnh đã xoay
// đúng chiều có kích thước image_size, nên chỉ cần co giãn theo khung hiển thị.
export default function ScanImage({
  scanId,
  result,
  maxHeight = 420,
}: {
  scanId: string;
  result: ScanResult;
  maxHeight?: number;
}) {
  const { uri, failed } = useScanImage(scanId);
  const [containerWidth, setContainerWidth] = useState(0);

  const { width: imageWidth, height: imageHeight } = result.image_size;
  const aspect = imageWidth / imageHeight || 1;
  const width = Math.min(containerWidth, maxHeight * aspect);
  const height = width / aspect;
  const scale = width / imageWidth;

  const onLayout = (event: LayoutChangeEvent) =>
    setContainerWidth(event.nativeEvent.layout.width);

  return (
    <View style={styles.container} onLayout={onLayout}>
      {containerWidth > 0 && (
        <View style={[styles.frame, { width, height }]}>
          {uri ? (
            <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="stretch" />
          ) : (
            <View style={styles.placeholder}>
              {failed ? (
                <Text style={styles.placeholderText}>Không tải được ảnh</Text>
              ) : (
                <ActivityIndicator color="#4CAF50" />
              )}
            </View>
          )}
          {uri &&
            result.boxes.map((box, index) => {
              const [x1, y1, x2, y2] = box.xyxy;
              return (
                <View
                  key={index}
                  pointerEvents="none"
                  style={[
                    styles.box,
                    {
                      left: x1 * scale,
                      top: y1 * scale,
                      width: (x2 - x1) * scale,
                      height: (y2 - y1) * scale,
                    },
                  ]}
                >
                  <Text style={styles.boxLabel}>{formatPercent(box.conf)}</Text>
                </View>
              );
            })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  frame: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#e0e0e0",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#777",
  },
  box: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#FF1744",
  },
  boxLabel: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "#FF1744",
    color: "white",
    fontSize: 11,
    paddingHorizontal: 3,
  },
});
