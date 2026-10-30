import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { KtcfsUser, TokenPair } from "./types";

// Token nằm trong Keychain (iOS) / Keystore (Android) qua expo-secure-store.
// Web không có secure store nên đành dùng AsyncStorage (localStorage).
const ACCESS_KEY = "ktcfs_access_token";
const REFRESH_KEY = "ktcfs_refresh_token";
const USER_KEY = "ktcfs_user";

// Các key cũ mà những màn hình khác vẫn đọc để kiểm tra đăng nhập.
const PROFILE_KEYS = ["phone", "user_id", "username", "authToken", USER_KEY];

const useSecureStore = Platform.OS !== "web";

async function secureGet(key: string) {
  return useSecureStore ? SecureStore.getItemAsync(key) : AsyncStorage.getItem(key);
}

async function secureSet(key: string, value: string) {
  if (useSecureStore) await SecureStore.setItemAsync(key, value);
  else await AsyncStorage.setItem(key, value);
}

async function secureDelete(key: string) {
  if (useSecureStore) await SecureStore.deleteItemAsync(key);
  else await AsyncStorage.removeItem(key);
}

let accessTokenCache: string | null | undefined;

export async function getAccessToken() {
  if (accessTokenCache === undefined) accessTokenCache = await secureGet(ACCESS_KEY);
  return accessTokenCache;
}

export async function getRefreshToken() {
  return secureGet(REFRESH_KEY);
}

export async function saveTokens(tokens: TokenPair) {
  accessTokenCache = tokens.access_token;
  await secureSet(ACCESS_KEY, tokens.access_token);
  // refresh_token đổi mới mỗi lần làm mới: cái cũ hết hiệu lực ngay, phải lưu cái mới.
  await secureSet(REFRESH_KEY, tokens.refresh_token);
}

export async function saveUser(user: KtcfsUser) {
  // AsyncStorage chỉ nhận string
  await AsyncStorage.multiSet([
    ["phone", String(user.phone ?? "")],
    ["user_id", String(user.user_id)],
    ["username", String(user.full_name ?? "")],
    [USER_KEY, JSON.stringify(user)],
  ]);
}

export async function getUser(): Promise<KtcfsUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function clearSession() {
  accessTokenCache = null;
  await secureDelete(ACCESS_KEY);
  await secureDelete(REFRESH_KEY);
  await AsyncStorage.multiRemove(PROFILE_KEYS);
}
