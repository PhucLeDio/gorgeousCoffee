# Lá Cà Phê (Gorgeous Coffee)

Ứng dụng di động giúp nông dân kiểm tra bệnh lá cà phê: đứng trong vườn, chụp một
tấm lá, app gửi ảnh lên hệ thống **KTCFS** và hiện kết quả (lá khỏe, bệnh gì, hay
chưa chắc chắn) kèm cách kiểm tra lại và lời khuyên.

Xây dựng bằng Expo SDK 58, React Native và TypeScript.

## Mục lục

1. [Yêu cầu](#1-yêu-cầu)
2. [Cài đặt](#2-cài-đặt)
3. [Cấu hình khóa API](#3-cấu-hình-khóa-api)
4. [Chạy app bằng `npm run start`](#4-chạy-app-bằng-npm-run-start)
5. [Giả lập GPS (fake GPS)](#5-giả-lập-gps-fake-gps)
6. [Demo từng bước](#6-demo-từng-bước)
7. [Xử lý sự cố](#7-xử-lý-sự-cố)
8. [Cấu hình và API](#8-cấu-hình-và-api)

---

## 1. Yêu cầu

- **Node.js 22.13 trở lên** và **npm**.
- **Điện thoại Android** cài **Expo Go** bản hỗ trợ **SDK 58** (tải từ CH Play).
  Có thể dùng iPhone với Expo Go, nhưng giả lập GPS trên iPhone thật khó hơn.
- Điện thoại và máy tính **cùng một mạng Wi‑Fi**.
- **Khóa API KTCFS** (`X-API-Key`) và **tài khoản thử KTCFS**: do quản trị KTCFS cấp.

## 2. Cài đặt

```bash
git clone https://github.com/PhucLeDio/gorgeousCoffee.git
```

```bash
cd gorgeousCoffee
```

```bash
npm install --legacy-peer-deps
```

> Bắt buộc có `--legacy-peer-deps`: dự án có một thư viện cũ khai báo phiên bản React thấp hơn.

## 3. Cấu hình khóa API

**Bước 1.** Tạo file `.env` từ mẫu:

```bash
cp .env.example .env
```

**Bước 2.** Mở `.env`, dán khóa vào sau dấu `=` (không thêm dấu ngoặc, không có dấu cách):

```dotenv
EXPO_PUBLIC_KTCFS_API_URL=https://ktcfs.nuian.vn/api/v1/mobile
EXPO_PUBLIC_KTCFS_API_KEY=ktcfs_xxxxxxxx_...
EXPO_PUBLIC_WEATHER_API_KEY=
```

`EXPO_PUBLIC_WEATHER_API_KEY` có thể để trống; khi đó trang chủ không hiện thẻ thời tiết.

**Bước 3.** Kiểm tra khóa trước khi chạy app:

```bash
curl -s https://ktcfs.nuian.vn/api/v1/mobile/health -H "X-API-Key: $(grep '^EXPO_PUBLIC_KTCFS_API_KEY=' .env | cut -d= -f2-)"
```

- Thấy `{"status":"ok", ...}`: khóa đúng.
- Thấy `INVALID_API_KEY`: khóa sai hoặc đã bị thu hồi, xem [mục 7](#7-xử-lý-sự-cố).

> Không commit file `.env`, không gửi khóa vào nhóm chat chung. Mỗi lần sửa `.env` phải
> tắt và chạy lại `npm run start`.

## 4. Chạy app bằng `npm run start`

**Bước 1.** Ở thư mục dự án, chạy:

```bash
npm run start
```

Lệnh này chạy `expo start -c` (khởi động Metro và xóa bộ nhớ đệm). Chờ đến khi terminal
hiện **mã QR** và dòng `Metro: exp://192.168.x.x:8081`.

**Bước 2.** Trên điện thoại Android, mở **Expo Go** → **Scan QR code** → quét mã QR trong
terminal. Lần đầu sẽ mất khoảng 1 phút để tải app.

**Bước 3.** App mở ra ở màn **Đăng nhập**. Khi sửa code, app tự nạp lại.

Các phím hay dùng trong cửa sổ Metro:

| Phím | Tác dụng |
| :--- | :--- |
| `r` | Tải lại app trên điện thoại |
| `m` | Mở menu nhà phát triển trên điện thoại |
| `w` | Mở bản web (chỉ xem giao diện, xem lưu ý bên dưới) |
| `Ctrl + C` | Tắt Metro |

Tuỳ chọn thêm (viết sau `--`):

```bash
npm run start -- --port 8082
```

```bash
npm run start -- --tunnel
```

- `--port 8082`: chạy ở cổng khác khi cổng 8081 đang bận.
- `--tunnel`: dùng khi điện thoại **không cùng mạng Wi‑Fi** với máy tính, hoặc mạng chặn kết
  nối giữa các máy. Lần đầu Expo có thể hỏi cài thêm `@expo/ngrok`.

> **Bản web** (`w`) chỉ để xem giao diện: server KTCFS chặn gọi từ trình duyệt (CORS), nên
> đăng nhập, gửi ảnh, lịch sử… đều báo lỗi mạng. Hãy thử chức năng trên điện thoại.

**Xem màn hình điện thoại trên máy tính (tuỳ chọn, Ubuntu + Android):** cắm cáp, bật
*Gỡ lỗi USB* trên điện thoại, rồi:

```bash
sudo apt install scrcpy adb
```

```bash
scrcpy
```

## 5. Giả lập GPS (fake GPS)

Server KTCFS **chỉ nhận ảnh chụp khi người chụp đứng trong ranh giới vườn** (cho lệch theo
sai số GPS, tối thiểu 15 m) và **sai số GPS ≤ 50 m**. App chỉ bật nút chụp khi sai số
**dưới 30 m**. Khi ngồi ở nhà để thử, cần giả lập vị trí điện thoại vào giữa một vườn thử.

### Toạ độ các vườn thử (xã Đăk Mar)

| Tài khoản | Vườn | Vĩ độ, kinh độ (tâm vườn) |
| :--- | :--- | :--- |
| Nông hộ 1 | `dakmar_100` (3,27 ha) | `14.564910, 107.923382` |
| Nông hộ 1 | `dakmar_1000` (0,87 ha) | `14.556368, 107.900345` |
| Nông hộ 2 | `dakmar_1001` (0,86 ha) | `14.559148, 107.923838` |
| HTX | `dakmar_1002` (0,86 ha) | `14.547302, 107.928017` |
| HTX | `dakmar_1003` (0,86 ha) | `14.599832, 107.952977` |
| Cán bộ xã | Chụp được ở **mọi vườn** của xã | Dùng toạ độ bất kỳ ở trên |

Số điện thoại và mật khẩu từng tài khoản được gửi riêng trong nhóm. Nông hộ và HTX **chỉ chụp
được ở vườn của chính mình**.

### Cách A: điện thoại Android thật (dùng Expo Go)

**Bước 1. Bật Tùy chọn nhà phát triển.** Vào **Cài đặt → Giới thiệu điện thoại** (Realme/OPPO:
*Cài đặt → Giới thiệu điện thoại → Phiên bản*), bấm **7 lần** vào **Số hiệu bản tạo** (*Build
number*) cho đến khi báo "Bạn đã là nhà phát triển".

**Bước 2. Cài ứng dụng giả lập vị trí.** Mở CH Play, tìm **"Fake GPS location"**, cài một
ứng dụng có đánh giá tốt.

**Bước 3. Chọn ứng dụng vị trí mô phỏng.** Vào **Cài đặt → Hệ thống (hoặc Cài đặt bổ sung) →
Tùy chọn nhà phát triển → Chọn ứng dụng vị trí mô phỏng** (*Select mock location app*) → chọn
ứng dụng vừa cài.

**Bước 4. Đặt vị trí giả.** Mở ứng dụng Fake GPS:
1. Dán toạ độ vào ô tìm kiếm, ví dụ `14.564910, 107.923382` (vườn `dakmar_100`), hoặc nhấn
   giữ lên bản đồ để đặt điểm.
2. Bấm nút **Bắt đầu / Play**. Trên thanh thông báo sẽ có biểu tượng ứng dụng đang giả lập.

**Bước 5. Mở lại Lá Cà Phê** trong Expo Go. Vào tab **Chụp lá**, ô định vị phải chuyển **màu
xanh**: "Định vị tốt ±x m".

**Bước 6. Thử xong thì tắt giả lập**: bấm **Dừng** trong ứng dụng Fake GPS, rồi ở *Chọn ứng
dụng vị trí mô phỏng* chọn **Không có ứng dụng nào**.

### Cách B: máy ảo Android (Android Studio)

1. Mở máy ảo, chạy `npm run start` rồi bấm `a` trong cửa sổ Metro để mở app trên máy ảo.
2. Trên thanh công cụ máy ảo bấm **⋯ (Extended controls) → Location**, nhập
   *Latitude* `14.564910`, *Longitude* `107.923382`, bấm **Set location**.

Hoặc dùng lệnh (chú ý: **kinh độ trước, vĩ độ sau**):

```bash
adb emu geo fix 107.923382 14.564910
```

### Cách C: iOS Simulator (macOS)

Trong Simulator chọn **Features → Location → Custom Location…**, nhập vĩ độ `14.564910`,
kinh độ `107.923382`.

## 6. Demo từng bước

> **Lưu ý:** đây là **server chính thức**. Ảnh chụp ra bệnh sẽ được ghi lên bản đồ của xã
> Đăk Mar trên web KTCFS. Mỗi tài khoản gửi tối đa **60 ảnh/giờ**. Không đổi mật khẩu các
> tài khoản thử.

Chuẩn bị: đã làm [mục 3](#3-cấu-hình-khóa-api) (khóa báo `ok`), đang chạy `npm run start`, điện
thoại đã giả lập GPS vào vườn `dakmar_100` theo [mục 5](#5-giả-lập-gps-fake-gps).

### Bước 1. Đăng nhập

1. Mở app → màn **Đăng nhập** có logo **Lá Cà Phê**.
2. Nhập số điện thoại và mật khẩu của tài khoản thử **Nông hộ 1** → **Đăng nhập**.
3. Vào **Trang chủ**: thấy "Xin chào, …", "Xã Đăk Mar · 2 vườn".

### Bước 2. Chụp lá và xem kết quả

1. Bấm **Chụp lá ngay** (hoặc nút tròn **Chụp lá** ở giữa thanh dưới).
2. Lần đầu: cho phép **máy ảnh** và **vị trí**.
3. Chờ ô trên cùng chuyển **xanh**: "Định vị tốt ±x m". Khi còn **cam** thì nút chụp bị mờ.
4. Đưa một chiếc lá cà phê vào giữa khung, bấm nút chụp.
   *Không có lá thật?* Mở một ảnh lá cà phê bị bệnh (ví dụ lá gỉ sắt) trên màn hình máy tính
   rồi chụp lại. Chụp qua màn hình có
   thể bị lóa hoặc nhòe, nên kết quả đôi khi khác ảnh gốc, thậm chí bị báo "không phải lá cà
   phê"; khi đó chỉnh góc chụp hoặc giảm độ sáng màn hình rồi chụp lại.
5. Màn **"Ảnh đã rõ lá chưa?"** → bấm **Gửi kiểm tra**.
6. Màn **Kết quả kiểm tra**:
   - Ô kết luận màu **đỏ** (có bệnh), **xanh** (lá khỏe) hoặc **cam** (chưa chắc chắn).
   - Ảnh có **khung đỏ** đánh dấu chỗ nghi bệnh.
   - **Kiểm tra lại trên cây**, **Lời khuyên**, thông tin vườn, "Đã báo lên bản đồ dịch bệnh của xã".
   - Bấm **Xem chi tiết các khả năng** để xem xác suất 8 loại.

### Bước 3. Ca "Chưa chắc chắn"

Ca này xảy ra khi ảnh khó phân biệt giữa hai bệnh (ví dụ lá vừa có đốm vừa có vết sáp).
Khi server trả về ca chưa chắc chắn, kết quả hiện **"Chưa chắc chắn"** màu cam, nêu **cả hai** khả năng (đánh số 1, 2) và câu
nhắc kiểm tra lại trên cây.

### Bước 4. Ca bị từ chối: chụp ngoài vườn

1. Trong ứng dụng Fake GPS, đổi vị trí ra ngoài vườn, ví dụ toạ độ của vườn người khác khi
   đang đăng nhập Nông hộ 2, hoặc dừng giả lập.
2. Chụp và gửi: app báo khung đỏ **"Vị trí chụp không nằm trong vườn của bạn (vườn gần nhất …
   cách khoảng … m)"**, chỉ còn nút **Chụp lại** (không có "Gửi lại", vì gửi lại cùng vị trí
   vẫn bị từ chối).

### Bước 5. Lịch sử, bản đồ, tra cứu

1. Tab **Lịch sử**: các lần chụp mới nhất ở trên, có ảnh nhỏ và màu theo tình trạng; kéo
   xuống để tải thêm; bấm một dòng để mở lại kết quả.
2. Tab **Bản đồ** (chỉ trên điện thoại): ghim xanh là tâm các vườn, chấm màu là nơi phát
   hiện bệnh.
3. **Trang chủ → Tra cứu bệnh**: dấu hiệu và lời khuyên của 8 loại.
4. Tab **Tài khoản** → **Đăng xuất** (app hỏi lại trước khi đăng xuất).

### Bước 6. Xem trên web KTCFS (tuỳ chọn)

Đăng nhập <https://ktcfs.nuian.vn> bằng tài khoản **Cán bộ xã**, chọn lớp **Sâu bệnh**: vườn
`dakmar_100` được tô màu có bệnh sau lần chụp ở Bước 2.

## 7. Xử lý sự cố

| Hiện tượng | Nguyên nhân / cách xử lý |
| :--- | :--- |
| "Lỗi cấu hình ứng dụng: khóa API KTCFS sai hoặc đã bị thu hồi" | Khóa trong `.env` sai. Chép lại khóa, lưu file, thử lệnh `curl` ở mục 3, rồi tắt và chạy lại `npm run start`. Vẫn sai thì xin khóa mới. |
| Expo Go không mở được app sau khi quét QR | Kiểm tra cùng Wi‑Fi; thử `npm run start -- --tunnel`. |
| Sửa `.env` mà app không đổi | Phải tắt Metro (`Ctrl + C`) rồi chạy lại `npm run start`. |
| Ô định vị mãi màu cam | GPS sai số lớn: ra chỗ thoáng, hoặc kiểm tra ứng dụng Fake GPS đang **chạy** và đã được chọn làm *ứng dụng vị trí mô phỏng*. Thoát hẳn Expo Go rồi mở lại. |
| "Vị trí chụp không nằm trong vườn của bạn" | Đứng ngoài vườn, hoặc đăng nhập tài khoản không sở hữu vườn đó. Đổi toạ độ giả lập về đúng vườn của tài khoản (mục 5). |
| "Mất kết nối mạng" khi gửi ảnh | Kiểm tra mạng điện thoại. App giữ ảnh và tự gửi lại; ảnh chỉ gửi được trong 30 phút sau khi chụp. |
| Báo vượt giới hạn gửi ảnh (lỗi 429) | Vượt 60 ảnh/giờ của tài khoản; chờ rồi bấm **Gửi lại**. |
| Đăng nhập báo tài khoản bị khóa tạm | Sai mật khẩu 5 lần trong 15 phút; chờ 15 phút. |

## 8. Cấu hình và API

Các biến trong `.env` được đọc qua [`constants/api.ts`](constants/api.ts):

| Biến | Ý nghĩa |
| :--- | :--- |
| `EXPO_PUBLIC_KTCFS_API_URL` | API di động KTCFS |
| `EXPO_PUBLIC_KTCFS_API_KEY` | Khóa `X-API-Key` do quản trị KTCFS cấp riêng |
| `EXPO_PUBLIC_WEATHER_API_KEY` | Key của [WeatherAPI](https://www.weatherapi.com) (tuỳ chọn) |

### API bên ngoài: thời tiết

- Nhà cung cấp: WeatherAPI, `GET https://api.weatherapi.com/v1/current.json`
- Vị trí file: [`app/(tabs)/index.tsx`](app/(tabs)/index.tsx)
- Chỉ gọi khi `EXPO_PUBLIC_WEATHER_API_KEY` có giá trị.

### Các lệnh khác

```bash
npm run web
```

```bash
npm run android
```

```bash
npm run ios
```

- `npm run web`: chỉ bản web (xem giao diện).
- `npm run android` / `npm run ios`: build app riêng (cần Android SDK / Xcode). Biểu tượng
  app, màn chờ và tên "Lá Cà Phê" chỉ hiện ở bản build riêng, không hiện trong Expo Go.
