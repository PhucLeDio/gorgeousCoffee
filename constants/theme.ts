// Bộ màu và cỡ chữ chung, thiết kế cho nông dân và người lớn tuổi:
// chữ to (tối thiểu 16, nội dung 18), tương phản cao, nút bấm cao tối thiểu 56 px.

export const colors = {
  primary: "#2E7D32", // xanh lá cà phê
  primaryDark: "#1B5E20",
  primarySoft: "#E8F5E9",
  accent: "#8D5524", // nâu hạt cà phê
  background: "#F3F6F0", // trắng ngả xanh lá, dịu mắt
  surface: "#FFFFFF",
  text: "#1C1C1C",
  textMuted: "#4A4A4A",
  border: "#D6D3CC",
  danger: "#C62828",
  dangerSoft: "#FDECEA",
  warning: "#E65100",
  warningSoft: "#FFF3E0",
  info: "#1565C0",
  infoSoft: "#E3F2FD",
};

export const font = {
  small: 16,
  body: 18,
  large: 20,
  title: 24,
  hero: 30,
};

export const space = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  md: 14,
  lg: 20,
};

// Bóng đổ nhẹ cho thẻ (thay cho viền xám)
export const shadow = {
  shadowColor: "#1B3A1F",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 3,
};

export const touch = {
  min: 56, // chiều cao tối thiểu của nút
};

// Chừa chỗ cho thanh tab cố định ở đáy màn hình
export const TAB_BAR_HEIGHT = 76;
