import { Platform } from "react-native";
import Constants from "expo-constants";
import { router } from "expo-router";
import { File } from "expo-file-system";
import { KTCFS_API_KEY, KTCFS_API_URL } from "constants/api";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  saveTokens,
  saveUser,
} from "./session";
import type {
  Disease,
  KtcfsUser,
  LoginResponse,
  Scan,
  ScanPage,
  TokenPair,
} from "./types";

export const GENERIC_ERROR = "Không gửi được yêu cầu, hãy thử lại.";
export const NETWORK_ERROR = "NETWORK_ERROR";

// Lỗi nghiệp vụ: {"detail": {"code", "message"}}. Lỗi kỹ thuật không có code
// (detail là chuỗi hoặc danh sách) thì dùng câu chung của từng chỗ gọi.
export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }

  // Chỉ tự gửi lại khi gặp 503 hoặc mất mạng; 4xx cần người dùng xử lý.
  get retryable() {
    return this.status === 503 || this.code === NETWORK_ERROR;
  }
}

async function toApiError(response: Response, fallback: string) {
  let body: any = null;
  try {
    body = await response.json();
  } catch {
    // body không phải JSON
  }
  const detail = body?.detail;
  if (detail && typeof detail === "object" && !Array.isArray(detail) && detail.code) {
    if (detail.code === "INVALID_API_KEY") {
      return new ApiError(
        response.status,
        "Lỗi cấu hình ứng dụng: khóa API KTCFS sai hoặc đã bị thu hồi.",
        detail.code
      );
    }
    return new ApiError(response.status, detail.message || fallback, detail.code);
  }
  return new ApiError(response.status, fallback);
}

type RequestOptions = {
  method?: string;
  json?: unknown;
  form?: FormData;
  auth?: boolean;
  // Câu hiện cho người dùng khi lỗi không có code
  fallback?: string;
};

async function send(path: string, options: RequestOptions, fallback: string) {
  const headers: Record<string, string> = { "X-API-Key": KTCFS_API_KEY };
  if (options.auth !== false) {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  let body: any;
  if (options.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.json);
  } else if (options.form) {
    // Không tự đặt Content-Type: fetch tự thêm boundary cho multipart/form-data
    body = options.form;
  }
  try {
    return await fetch(`${KTCFS_API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body,
    });
  } catch (error) {
    // Bản phát triển: kèm lỗi gốc để biết là mất mạng thật hay request bị hỏng
    const detail = __DEV__ ? ` [${path}: ${String(error)}]` : "";
    if (__DEV__) console.warn("[ktcfs] fetch failed", path, error);
    throw new ApiError(
      0,
      `Mất kết nối mạng. Kiểm tra mạng rồi thử lại.${detail}`,
      NETWORK_ERROR
    );
  }
}

let refreshing: Promise<boolean> | null = null;

// Gọi /auth/refresh, dùng chung một lần cho mọi request đang chờ.
// Trả false khi refresh token không còn hiệu lực (phải đăng nhập lại).
function refreshTokens() {
  if (!refreshing) {
    refreshing = (async () => {
      const refresh_token = await getRefreshToken();
      if (!refresh_token) return false;
      const response = await send(
        "/auth/refresh",
        { method: "POST", json: { refresh_token }, auth: false },
        GENERIC_ERROR
      );
      if (response.ok) {
        await saveTokens((await response.json()) as TokenPair);
        return true;
      }
      if (response.status === 401) return false;
      throw await toApiError(response, GENERIC_ERROR);
    })().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

async function expireSession() {
  await clearSession();
  router.replace("/login");
}

async function request(path: string, options: RequestOptions = {}) {
  const fallback = options.fallback ?? GENERIC_ERROR;
  let response = await send(path, options, fallback);

  // 401 INVALID_TOKEN: làm mới một lần rồi gửi lại; vẫn 401 thì về đăng nhập.
  if (response.status === 401 && options.auth !== false) {
    const error = await toApiError(response, fallback);
    if (error.code !== "INVALID_TOKEN") throw error;
    if (!(await refreshTokens())) {
      await expireSession();
      throw new ApiError(401, "Phiên đăng nhập đã hết hạn, hãy đăng nhập lại.", error.code);
    }
    response = await send(path, options, fallback);
    if (response.status === 401) {
      const retryError = await toApiError(response, fallback);
      if (retryError.code === "INVALID_TOKEN") await expireSession();
      throw retryError;
    }
  }

  if (!response.ok) throw await toApiError(response, fallback);
  return response;
}

async function requestJson<T>(path: string, options?: RequestOptions): Promise<T> {
  const response = await request(path, options);
  return (await response.json()) as T;
}

// Bỏ ký tự ẩn (zero-width, BOM) và khoảng trắng/xuống dòng ở hai đầu, hay dính theo khi
// copy tài khoản từ tin nhắn hoặc ghi chú trên điện thoại.
function cleanCredential(value: string) {
  return value.replace(/[\u200B-\u200D\u2060\uFEFF]/g, "").trim();
}

export async function login(loginId: string, password: string) {
  const data = await requestJson<LoginResponse>("/auth/login", {
    method: "POST",
    auth: false,
    json: {
      login: cleanCredential(loginId),
      password: cleanCredential(password),
      device_name: Constants.deviceName ?? `${Platform.OS} ${Platform.Version}`,
    },
    fallback: "Đăng nhập thất bại, hãy thử lại.",
  });
  await saveTokens(data);
  await saveUser(data.user);
  return data.user;
}

export async function logout() {
  try {
    await request("/auth/logout", { method: "POST" });
  } catch {
    // Vẫn xóa phiên trên máy dù server không nhận được yêu cầu
  } finally {
    await clearSession();
  }
}

export async function getMe() {
  const user = await requestJson<KtcfsUser>("/me");
  await saveUser(user);
  return user;
}

export async function getDiseases(): Promise<Disease[]> {
  const data = await requestJson<any>("/diseases", { auth: false });
  if (Array.isArray(data)) return data;
  return data?.items ?? data?.diseases ?? [];
}

export type ScanUpload = {
  uri: string;
  lat: number;
  lon: number;
  accuracyM: number;
  capturedAt: string;
};

export async function createScan(upload: ScanUpload) {
  const form = new FormData();
  if (Platform.OS === "web") {
    const blob = await (await fetch(upload.uri)).blob();
    form.append("image", blob, "leaf.jpg");
  } else {
    // Từ SDK 58, fetch toàn cục là expo/fetch: không nhận kiểu { uri, name, type } của
    // React Native ("Unsupported FormDataPart implementation"), phải gửi File có bytes().
    form.append("image", new File(upload.uri) as any);
  }
  form.append("lat", String(upload.lat));
  form.append("lon", String(upload.lon));
  form.append("accuracy_m", String(Math.round(upload.accuracyM * 10) / 10));
  form.append("captured_at", upload.capturedAt);

  const scan = await requestJson<Scan>("/scans", {
    method: "POST",
    form,
    fallback: "Không gửi được ảnh, hãy chụp lại.",
  });
  rememberScan(scan);
  return scan;
}

export async function listScans(limit = 20, before?: string | null) {
  const query = `limit=${limit}${before ? `&before=${encodeURIComponent(before)}` : ""}`;
  const page = await requestJson<ScanPage>(`/scans?${query}`, {
    fallback: "Không tải được lịch sử.",
  });
  page.items.forEach(rememberScan);
  return page;
}

export async function getScan(scanId: string) {
  const cached = scanCache.get(scanId);
  if (cached) return cached;
  const scan = await requestJson<Scan>(`/scans/${encodeURIComponent(scanId)}`, {
    fallback: "Không tải được kết quả.",
  });
  rememberScan(scan);
  return scan;
}

// Ảnh gốc cần cả 2 header nên không dùng thẳng URL trong <Image>: tải về rồi đổi
// sang data URI (dùng được cả native lẫn web).
export async function getScanImageUri(scanId: string) {
  const cached = imageCache.get(scanId);
  if (cached) return cached;
  const response = await request(`/scans/${encodeURIComponent(scanId)}/image`, {
    fallback: "Không tải được ảnh.",
  });
  const blob = await response.blob();
  const uri = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new ApiError(0, "Không đọc được ảnh."));
    reader.readAsDataURL(blob);
  });
  rememberScanImage(scanId, uri);
  return uri;
}

const scanCache = new Map<string, Scan>();
const imageCache = new Map<string, string>();
const IMAGE_CACHE_SIZE = 30; // data URI ~300 KB mỗi ảnh

function rememberScan(scan: Scan) {
  scanCache.set(scan.scan_id, scan);
}

export function rememberScanImage(scanId: string, uri: string) {
  imageCache.delete(scanId);
  imageCache.set(scanId, uri);
  if (imageCache.size > IMAGE_CACHE_SIZE) {
    imageCache.delete(imageCache.keys().next().value!);
  }
}
