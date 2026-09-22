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

## Cấu hình API

Hiện tại, các endpoint API đang được khai báo trực tiếp (hardcode) tại các file mã nguồn. Khi cần trỏ ứng dụng sang server khác, bạn cần cập nhật tại các vị trí tương ứng:

### 1. Backend chính (Mặc định: `http://localhost:8285`)

| Endpoint | Chức năng | Vị trí file |
| :--- | :--- | :--- |
| `POST /auth/login` | Đăng nhập tài khoản | [`app/login.tsx`](app/login.tsx) |
| `POST /auth/register` | Đăng ký tài khoản | [`app/login.tsx`](app/login.tsx) |
| `GET /histories/map` | Dữ liệu định vị lịch sử bệnh trên bản đồ | [`app/(tabs)/map.tsx`](app/(tabs)/map.tsx) |
| `GET /histories/:user_id` | Danh sách lịch sử chẩn đoán của người dùng | [`app/(tabs)/history.tsx`](app/(tabs)/history.tsx) |
| `POST /predictor/predict` | Gửi ảnh chụp/tải lên để chẩn đoán sâu bệnh | [`components/camera/PhotoPickerSection.tsx`](components/camera/PhotoPickerSection.tsx)<br>[`components/camera/PhotoPreviewSection.tsx`](components/camera/PhotoPreviewSection.tsx) |

### 2. Chatbot AI (Mặc định: `http://192.168.0.116:5000`)

| Endpoint | Chức năng | Vị trí file |
| :--- | :--- | :--- |
| `POST /predict` | Gửi tin nhắn hỏi đáp tư vấn bệnh cây cà phê | [`app/result.tsx`](app/result.tsx) |

### 3. API bên ngoài (Thời tiết)

- **Nhà cung cấp:** WeatherAPI (`http://api.weatherapi.com`)
- **Endpoint:** `GET /v1/current.json`
- **Vị trí file:** [`app/(tabs)/index.tsx`](app/(tabs)/index.tsx)

### Lưu ý quan trọng khi thay đổi API

- **Thiết bị thật (Expo Go qua Wi-Fi):** Không sử dụng `http://localhost` vì điện thoại sẽ không thể kết nối tới máy tính của bạn. Hãy thay thế bằng địa chỉ IP mạng LAN của máy tính đang chạy backend (ví dụ: `http://192.168.x.x:8285`) hoặc dùng dịch vụ tunnel như [zrok](https://zrok.io) / [ngrok](https://ngrok.com).
- **Android Emulator:** Khi chạy trên máy ảo Android, `localhost` của máy host thường được truy cập qua `http://10.0.2.2`.

