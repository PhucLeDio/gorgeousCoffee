# Gorgeous Coffee

Ứng dụng mobile hỗ trợ nông nghiệp, được xây dựng bằng Expo, React Native,
TypeScript và Tamagui.

## Yêu cầu

- Node.js 20 trở lên
- npm
- Expo Go tương thích với Expo SDK 51 nếu chạy trên điện thoại Android

## Cài đặt

```bash
git clone https://github.com/PhucLeDio/gorgeousCoffee.git
cd gorgeousCoffee
npm install --legacy-peer-deps
```

Dự án có một dependency cũ yêu cầu phiên bản React thấp hơn, vì vậy cần dùng
`--legacy-peer-deps` khi cài bằng npm.

## Chạy chương trình

```bash
npm run start -- --lan --port 8082
```

Sau khi Metro khởi động:

- Nhấn `w` để mở bản web hoặc truy cập <http://localhost:8082>.
- Trên Android, mở Expo Go và quét mã QR trong terminal.
- Điện thoại và máy tính phải kết nối cùng một mạng Wi-Fi.
- Nếu không quét được QR, nhập thủ công địa chỉ `exp://<IP-máy-tính>:8082`
  trong Expo Go.

## Các lệnh khác

```bash
npm run web      # Chạy bản web
npm run android  # Chạy native Android khi đã cấu hình Android SDK/thiết bị
npm run ios      # Chạy native iOS trên macOS
```

## Phiên bản Expo

Dự án hiện sử dụng Expo SDK 51 (`expo ~51.0.39`). Các dependency đã được căn
chỉnh theo SDK này. Nếu nâng cấp Expo, nên nâng lần lượt từng SDK và kiểm thử
lại web, Android và iOS sau mỗi bước.
