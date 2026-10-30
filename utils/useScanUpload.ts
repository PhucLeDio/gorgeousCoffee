import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { ApiError, createScan, rememberScanImage } from "utils/ktcfs/api";
import { MAX_CAPTURE_AGE_MS, toIsoWithOffset } from "utils/ktcfs/capture";

export type CapturedLeaf = {
  uri: string; // ảnh đã thu về ~1600 px
  lat: number;
  lon: number;
  accuracyM: number;
  capturedAt: Date;
};

const RETRY_AFTER_UNAVAILABLE_MS = 2 * 60 * 1000; // 503 AI_UNAVAILABLE: gửi lại sau vài phút
const RETRY_AFTER_OFFLINE_MS = 20 * 1000;

// Gửi ảnh lên POST /scans rồi mở màn /result.
// Chỉ tự gửi lại khi gặp 503 hoặc mất mạng, và chỉ trong 30 phút kể từ lúc chụp;
// các lỗi 4xx hiện message để người dùng xử lý (chụp lại, đứng trong vườn...).
export function useScanUpload(photo: CapturedLeaf) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAt, setRetryAt] = useState<number | null>(null);
  // false khi gửi lại cùng ảnh, cùng vị trí chắc chắn bị từ chối: phải chụp lại
  const [canResend, setCanResend] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendingRef = useRef(false);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  useEffect(() => clearTimer, []);

  const send = useCallback(async () => {
    if (sendingRef.current) return;
    clearTimer();
    setRetryAt(null);

    const deadline = photo.capturedAt.getTime() + MAX_CAPTURE_AGE_MS;
    if (Date.now() > deadline) {
      setCanResend(false);
      setError("Ảnh đã chụp quá 30 phút, hãy chụp lại.");
      return;
    }

    sendingRef.current = true;
    setSending(true);
    setError(null);
    try {
      const scan = await createScan({
        uri: photo.uri,
        lat: photo.lat,
        lon: photo.lon,
        accuracyM: photo.accuracyM,
        capturedAt: toIsoWithOffset(photo.capturedAt),
      });
      rememberScanImage(scan.scan_id, photo.uri);
      router.push({ pathname: "/result", params: { scan_id: scan.scan_id } });
    } catch (e) {
      const apiError =
        e instanceof ApiError ? e : new ApiError(0, "Không gửi được ảnh, hãy chụp lại.");
      setError(apiError.message);
      // Gửi lại có ích khi mất mạng, server bận (503) hoặc vượt giới hạn (429, thử lại sau).
      // Các lỗi 4xx khác (ngoài vườn, GPS kém, ảnh tối...) cần người dùng chụp lại.
      setCanResend(apiError.retryable || apiError.status === 429);
      if (apiError.retryable) {
        const delay =
          apiError.status === 503 ? RETRY_AFTER_UNAVAILABLE_MS : RETRY_AFTER_OFFLINE_MS;
        const next = Date.now() + delay;
        if (next < deadline) {
          setRetryAt(next);
          timer.current = setTimeout(() => send(), delay);
        }
      }
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }, [photo, router]);

  return { sending, error, retryAt, canResend, send };
}
