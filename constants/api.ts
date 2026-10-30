// Cấu hình endpoint, đọc từ biến môi trường EXPO_PUBLIC_* (file .env, xem .env.example).
// EXPO_PUBLIC_* được nhúng vào bundle khi build: không commit .env, không ghi log khóa.

// API di động KTCFS: đăng nhập, gửi ảnh chụp, lịch sử, danh mục bệnh.
export const KTCFS_API_URL =
  process.env.EXPO_PUBLIC_KTCFS_API_URL ?? "https://ktcfs.nuian.vn/api/v1/mobile";

// Khóa X-API-Key của ứng dụng, do quản trị KTCFS cấp riêng.
export const KTCFS_API_KEY = process.env.EXPO_PUBLIC_KTCFS_API_KEY ?? "";

export const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY ?? "";
