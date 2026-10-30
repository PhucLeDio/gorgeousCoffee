import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

// Quy tắc chụp của API KTCFS
export const MAX_ACCURACY_M = 50; // server từ chối nếu sai số GPS lớn hơn
export const GOOD_ACCURACY_M = 30; // chỉ bật nút chụp khi sai số dưới mức này
export const MAX_CAPTURE_AGE_MS = 30 * 60 * 1000; // phải gửi trong 30 phút sau khi chụp
const LONG_EDGE_PX = 1600;
const JPEG_QUALITY = 0.8;

// Thu ảnh về JPEG cạnh dài ~1600 px, chất lượng 80 (~150–300 KB).
// expo-camera đã xoay điểm ảnh đúng chiều, và ảnh lưu lại từ image-manipulator
// không còn cờ xoay EXIF, nên server nhận ảnh đúng chiều, không bị xoay lần nữa.
export async function prepareScanImage(uri: string) {
  const original = await ImageManipulator.manipulate(uri).renderAsync();
  let image = original;
  if (Math.max(original.width, original.height) > LONG_EDGE_PX) {
    image = await ImageManipulator.manipulate(original)
      .resize(
        original.width >= original.height ? { width: LONG_EDGE_PX } : { height: LONG_EDGE_PX }
      )
      .renderAsync();
  }
  return image.saveAsync({ compress: JPEG_QUALITY, format: SaveFormat.JPEG });
}

// ISO 8601 theo giờ máy, có múi giờ, ví dụ 2026-10-29T13:27:16+07:00
export function toIsoWithOffset(date: Date) {
  const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, "0");
  const offset = -date.getTimezoneOffset();
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `${offset >= 0 ? "+" : "-"}${pad(offset / 60)}:${pad(offset % 60)}`
  );
}
